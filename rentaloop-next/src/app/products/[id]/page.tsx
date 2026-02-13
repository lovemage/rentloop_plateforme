import { notFound } from "next/navigation";
import Image from "next/image";
import { ProductGallery } from "@/components/products/product-gallery";
import { RentalCard } from "@/components/products/rental-card";
import { ProductQA, type Question } from "@/components/products/product-qa";
import { FavoriteButton } from "@/components/products/favorite-button";
import { MapPin, ShieldCheck, User, Star, AlertCircle } from "lucide-react";
import { db } from "@/lib/db";
import { items, users, userProfiles, itemQuestions, rentals } from "@/lib/schema";
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
        instagramId: string | null;
        threadsId: string | null;
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
            ownerProfile: {
                instagramId: userProfiles.instagramId,
                threadsId: userProfiles.threadsId,
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
            .leftJoin(userProfiles, eq(items.ownerId, userProfiles.userId))
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
                isVerified: data.owner?.role === 'verified' || data.owner?.role === 'admin',
                instagramId: data.ownerProfile?.instagramId || null,
                threadsId: data.ownerProfile?.threadsId || null,
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
                                {/* Social IDs */}
                                {(product.owner.instagramId || product.owner.threadsId) && (
                                    <div className="flex flex-wrap gap-3 mt-2">
                                        {product.owner.instagramId && (
                                            <a
                                                href={`https://www.instagram.com/${product.owner.instagramId.replace('@', '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-sm text-pink-600 hover:text-pink-700 transition-colors font-medium"
                                            >
                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                                                @{product.owner.instagramId.replace('@', '')}
                                            </a>
                                        )}
                                        {product.owner.threadsId && (
                                            <a
                                                href={`https://www.threads.com/@${product.owner.threadsId.replace('@', '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-sm text-gray-700 hover:text-gray-900 transition-colors font-medium"
                                            >
                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.432 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.34-.779-.964-1.405-1.803-1.817a13.7 13.7 0 01-.235 2.49c-.36 1.7-1.048 2.994-2.047 3.843-1.108.94-2.533 1.42-4.235 1.42h-.004c-1.43-.007-2.648-.424-3.623-1.237-1.03-.858-1.574-2.012-1.574-3.338 0-1.276.534-2.39 1.503-3.133.878-.675 2.043-1.048 3.375-1.08 1.065-.024 2.043.108 2.919.393-.028-.793-.171-1.442-.433-1.935-.349-.659-.958-1.004-1.81-1.025h-.065c-.663 0-1.593.18-2.278.858l-1.382-1.514C8.69 6.468 10.026 5.826 11.5 5.81h.097c1.579.03 2.768.66 3.436 1.824.582 1.014.87 2.352.857 3.975v.06c.003.125.003.25 0 .375 1.16.508 2.078 1.32 2.66 2.37.832 1.497.94 4.074-1.088 6.101C15.65 22.268 13.47 22.98 12.186 24zm-.09-8.73c-.839.02-1.505.207-1.928.544-.383.304-.572.7-.572 1.21 0 .621.237 1.093.703 1.404.52.347 1.178.521 1.958.526 1.13-.007 2.003-.32 2.665-.957.542-.522.914-1.35 1.161-2.465a11.6 11.6 0 00-3.987-.262z" /></svg>
                                                @{product.owner.threadsId.replace('@', '')}
                                            </a>
                                        )}
                                    </div>
                                )}
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
