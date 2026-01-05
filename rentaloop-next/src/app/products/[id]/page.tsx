import { notFound } from "next/navigation";
import Image from "next/image";
import { ProductGallery } from "@/components/products/product-gallery";
import { RentalCard } from "@/components/products/rental-card";
import { ProductQA, type Question } from "@/components/products/product-qa";
import { FavoriteButton } from "@/components/products/favorite-button";
import { MapPin, ShieldCheck, User, Star, AlertCircle } from "lucide-react";
import { db } from "@/lib/db";
import { items, users, itemQuestions, rentals } from "@/lib/schema";
import { eq, desc, and, inArray, gt } from "drizzle-orm";
import { auth } from "@/auth";
import { eachDayOfInterval } from "date-fns";
import { getTodayDateString } from "@/lib/date-utils";
import { getMyFavoriteProductIds, recordProductView, getFavoriteCount } from "@/app/actions/tracking";
import { getItemReviews } from "@/app/actions/rentals";

import { LocationMap } from "@/components/products/location-map";

async function getProduct(id: string): Promise<{
    id: string;
    title: string;
    description: string;
    pricePerDay: number;
    deposit: number;
    images: string[];
    status: string | null;
    ownerId: string;
    availableFrom: Date | null;
    availableTo: Date | null;
    locations: {
        placeId?: string;
        name?: string;
        address: string;
        lat: number;
        lng: number;
    }[];
    locationText: {
        city: string;
        district: string;
        address: string;
    };
    owner: {
        name: string;
        avatar: string | null | undefined;
        rating: number;
        responseRate: string;
        joinDate: string;
        isVerified: boolean;
    };
    notes: string[];
    condition: string;
    discountRate3Days: number;
    discountRate7Days: number;
} | null> {
    try {
        const result = await db.select({
            id: items.id,
            title: items.title,
            description: items.description,
            pricePerDay: items.pricePerDay,
            deposit: items.deposit,
            images: items.images,
            status: items.status,
            ownerId: items.ownerId,
            availableFrom: items.availableFrom,
            availableTo: items.availableTo,
            owner: {
                name: users.name,
                avatar: users.image,
                rating: users.rating,
                reviewCount: users.reviewCount,
                joinDate: users.createdAt,
                role: users.role,
            },
            pickupLocation: items.pickupLocation,
            pickupLocations: items.pickupLocations, // Add this
            createdAt: items.createdAt,
            condition: items.condition,
            notes: items.notes,
            discountRate3Days: items.discountRate3Days,
            discountRate7Days: items.discountRate7Days,
        })
            .from(items)
            .leftJoin(users, eq(items.ownerId, users.id))
            .where(eq(items.id, id))
            .limit(1);

        if (result.length === 0) return null;

        const data = result[0];

        // Parse locations
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let locations: any[] = [];
        if (data.pickupLocations && Array.isArray(data.pickupLocations) && data.pickupLocations.length > 0) {
            locations = data.pickupLocations;
        } else if (data.pickupLocation) {
            // Legacy single string location
            // We use a default coordinate (Taipei) but show address
            locations = [{
                address: data.pickupLocation,
                name: '面交地點',
                lat: 25.0330,
                lng: 121.5654
            }];
        }

        // Parse legacy breakdown for UI text (optional)
        const primaryAddress = locations[0]?.address || data.pickupLocation || "";
        const city = primaryAddress.length >= 3 ? primaryAddress.substring(0, 3) : "台灣";
        const district = primaryAddress.length >= 6 ? primaryAddress.substring(3, 6) : "地區";

        return {
            id: data.id,
            title: data.title,
            description: data.description || "尚無描述",
            pricePerDay: data.pricePerDay || 0,
            deposit: data.deposit || 0,
            images: data.images ? (Array.isArray(data.images) ? data.images : [data.images]) : [],
            status: data.status,
            ownerId: data.ownerId,
            availableFrom: data.availableFrom,
            availableTo: data.availableTo,
            locations,
            locationText: {
                city,
                district,
                address: primaryAddress || "詳細地址於預約後提供",
            },
            owner: {
                name: data.owner?.name || "Unknown User",
                avatar: data.owner?.avatar,
                rating: data.owner?.rating || 5.0,
                responseRate: "95%",
                joinDate: data.owner?.joinDate ? new Date(data.owner.joinDate).getFullYear() + "年" : "2024年",
                isVerified: data.owner?.role === 'verified' || data.owner?.role === 'admin'
            },
            notes: data.notes ? data.notes.split('\n') : [
                "禁止用於非法用途",
                "請愛惜使用，若有損壞需照價賠償"
            ],
            condition: data.condition || "良好",
            discountRate3Days: Number(data.discountRate3Days || 0),
            discountRate7Days: Number(data.discountRate7Days || 0),
        };
    } catch (err) {
        console.error("Error fetching product:", err);
        return null;
    }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await getProduct(id);
    const session = await auth();

    if (session?.user?.id) {
        await recordProductView(id);
    }

    const favoriteIdsResult = session?.user?.id ? await getMyFavoriteProductIds() : null;
    const initialFavorited = favoriteIdsResult?.success ? favoriteIdsResult.itemIds.includes(id) : false;
    const favoriteCountRes = await getFavoriteCount(id);
    const initialFavoriteCount = favoriteCountRes.success ? favoriteCountRes.count : 0;

    if (!product) {
        notFound();
    }

    // Fetch Questions with explicit type annotation
    const questions: Question[] = await db.select({
        id: itemQuestions.id,
        content: itemQuestions.content,
        reply: itemQuestions.reply,
        createdAt: itemQuestions.createdAt,
        repliedAt: itemQuestions.repliedAt,
        user: {
            name: users.name,
            image: users.image
        }
    })
        .from(itemQuestions)
        .leftJoin(users, eq(itemQuestions.userId, users.id))
        .where(eq(itemQuestions.itemId, id))
        .orderBy(desc(itemQuestions.createdAt));

    // Fetch Blocked Dates
    // Fetch rentals that are blocking dates (exclude cancelled and completed)
    // Using UTC+8 (Taipei) timezone for date comparison
    const today = getTodayDateString();
    const rentalRecords = await db.select({
        startDate: rentals.startDate,
        endDate: rentals.endDate
    }).from(rentals)
        .where(and(
            eq(rentals.itemId, id),
            inArray(rentals.status, ['pending', 'approved', 'ongoing', 'blocked']),
            gt(rentals.endDate, today)
        ));

    const blockedDates = rentalRecords.flatMap(r => {
        if (!r.startDate || !r.endDate) return [];
        try {
            const start = new Date(r.startDate);
            const end = new Date(r.endDate);
            if (start > end) return [];
            return eachDayOfInterval({ start, end });
        } catch { return []; }
    });


    const isOwner = session?.user?.id === product!.ownerId;

    // Fetch Reviews
    const reviewsRes = await getItemReviews(id);
    const reviews = reviewsRes.success ? reviewsRes.data : [];
    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : product.owner.rating.toFixed(1); // Fallback to owner rating if no item reviews yet

    return (
        <div className="min-h-screen bg-white pb-24 lg:pb-12">
            {/* Mobile Header (Back Button) could go here if navigation bar is hidden */}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">

                {/* Title Section (Mobile: Below Image, Desktop: Top) */}
                <div className="hidden lg:block mb-6">
                    <div className="flex items-start justify-between gap-4">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
                        {session?.user?.id ? (
                            <FavoriteButton itemId={id} initialFavorited={initialFavorited} initialCount={initialFavoriteCount} />
                        ) : (
                            <a href="/auth" className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold border border-gray-200 bg-white hover:border-primary transition-colors">
                                <Star className="h-4 w-4" /> 關注 {initialFavoriteCount > 0 && <span className="opacity-60 text-xs">({initialFavoriteCount})</span>}
                            </a>
                        )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-current text-yellow-400" />
                            <span className="font-medium text-gray-900">{averageRating}</span> ({reviews.length} 則評價)
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1 text-gray-700 underline decoration-gray-300 underline-offset-2">
                            {product.locationText.city}, {product.locationText.district}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Gallery & Info */}
                    <div className="lg:col-span-2 space-y-10">

                        {/* Gallery */}
                        <ProductGallery images={product.images} />

                        {/* Mobile Title Section (Visible only on mobile) */}
                        <div className="lg:hidden space-y-3">
                            <div className="flex items-start justify-between gap-3">
                                <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>
                                {session?.user?.id ? (
                                    <FavoriteButton itemId={id} initialFavorited={initialFavorited} initialCount={initialFavoriteCount} />
                                ) : (
                                    <a href="/auth" className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold border border-gray-200 bg-white hover:border-primary transition-colors">
                                        <Star className="h-4 w-4" /> 關注 {initialFavoriteCount > 0 && <span className="opacity-60 text-xs">({initialFavoriteCount})</span>}
                                    </a>
                                )}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Star className="w-4 h-4 fill-current text-yellow-400" />
                                <span className="font-medium text-black">4.9</span> ·
                                <span className="underline">{product.locationText.city}, {product.locationText.district}</span>
                            </div>
                        </div>

                        <div className="h-px bg-gray-200" />

                        {/* Owner Info & Attributes */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-gray-900">由 {product.owner.name} 出租</h3>
                                <div className="text-gray-500 text-sm flex gap-4">
                                    <span>{product.condition}</span>
                                    <span>·</span>
                                    <span>回應率 {product.owner.responseRate}</span>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden">
                                    {product.owner.avatar ? (
                                        <Image src={product.owner.avatar} alt={product.owner.name} width={56} height={56} className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                            <User className="w-8 h-8" />
                                        </div>
                                    )}
                                </div>
                                {product.owner.isVerified && (
                                    <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full">
                                        <ShieldCheck className="w-5 h-5 text-green-600 fill-current" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="h-px bg-gray-200" />

                        {/* Description */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-gray-900">關於此商品</h3>
                            <div className="prose prose-gray max-w-none text-gray-600 whitespace-pre-line leading-relaxed">
                                {product.description}
                            </div>
                            <div className="prose prose-gray max-w-none text-gray-600 whitespace-pre-line leading-relaxed">
                                {product.description}
                            </div>
                        </div>

                        <div className="h-px bg-gray-200" />

                        {/* Reviews Section */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                評價
                                <span className="text-sm font-normal text-gray-500">({reviews.length})</span>
                            </h3>

                            {reviews.length > 0 ? (
                                <div className="grid gap-6">
                                    {reviews.map((review) => (
                                        <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                                                        {review.reviewerImage ? (
                                                            <Image src={review.reviewerImage} alt={review.reviewerName || 'User'} fill className="object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                <User className="w-5 h-5" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900">{review.reviewerName || 'Unknown'}</div>
                                                        <div className="text-xs text-gray-500">
                                                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex text-yellow-400">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                            {review.comment && (
                                                <p className="text-gray-600 leading-relaxed text-sm pl-[52px]">
                                                    {review.comment}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-gray-500 text-sm py-4 bg-gray-50 rounded-xl text-center">
                                    尚無評價，成為第一個評價的人吧！
                                </div>
                            )}
                        </div>

                        <div className="h-px bg-gray-200" />

                        {/* Rental Rules / Notes */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-gray-900">租賃注意事項</h3>
                            <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-6">
                                <ul className="space-y-3">
                                    {product.notes.map((note, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-700 font-medium">{note}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="h-px bg-gray-200" />

                        {/* Location */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-gray-900">面交地點</h3>
                            <div className="rounded-xl overflow-hidden shadow-sm border border-gray-100">
                                <LocationMap
                                    locations={product.locations}
                                    apiKey={process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}
                                />
                                <div className="p-4 bg-white">
                                    {product.locations.map((loc, idx) => (
                                        <div key={idx} className="flex items-center gap-2 mb-2 last:mb-0">
                                            <MapPin className="w-4 h-4 text-green-600" />
                                            <span className="text-sm font-medium">{loc.address} {loc.name ? `(${loc.name})` : ''}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <p className="text-sm text-gray-500">詳細地址將於預約確認後提供。</p>
                        </div>

                        <div className="h-px bg-gray-200" />

                        {/* Q&A Section */}
                        <ProductQA
                            itemId={product.id}
                            questions={questions}
                            isOwner={isOwner}
                            currentUserId={session?.user?.id}
                        />

                    </div>

                    {/* Right Column: Sticky Rental Card (Desktop Only) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <RentalCard
                                itemId={product.id}
                                itemTitle={product.title}
                                pricePerDay={product.pricePerDay}
                                deposit={product.deposit}
                                blockedDates={blockedDates}
                                availableRange={{ from: product.availableFrom, to: product.availableTo }}
                                isLoggedIn={!!session?.user}
                                isOwner={isOwner}
                                discountRate3Days={product.discountRate3Days}
                                discountRate7Days={product.discountRate7Days}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
