import { db } from "@/lib/db";
import { items, categories } from "@/lib/schema";
import { eq, desc, inArray } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";

// Helper to get category hierarchy
async function getAllCategories() {
  const all = await db.select().from(categories).orderBy(desc(categories.level)); // Fetch all
  // Build tree
  const roots = all.filter(c => !c.parentId);
  const getChildren = (pid: string) => all.filter(c => c.parentId === pid);
  return { roots, getChildren, all };
}

async function getProducts(categorySlug?: string) {
  try {
    let query = db.select().from(items).orderBy(desc(items.createdAt));

    if (categorySlug) {
      const cat = await db.select().from(categories).where(eq(categories.slug, categorySlug)).limit(1);

      if (cat.length > 0) {
        const targetCat = cat[0];
        // Find all descendant category IDs (including self)
        // Simplification: just find direct children if it's a parent, or self.
        // For distinct "levels", we might need recursive query, but let's do 1 level deep for now.
        const children = await db.select({ id: categories.id }).from(categories).where(eq(categories.parentId, targetCat.id));
        const ids = [targetCat.id, ...children.map(c => c.id)];

        // Filter items
        query = db.select().from(items).where(inArray(items.categoryId, ids)).orderBy(desc(items.createdAt));
      }
    }

    return await query;
  } catch (err) {
    console.error(err);
    return [];
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams;
  const productList = await getProducts(category);
  const { roots, getChildren } = await getAllCategories();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:px-8">

        {/* Sidebar */}
        <aside className="w-full lg:w-64 lg:shrink-0 space-y-8">
          <div className="lg:hidden flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Filters</h2>
            <button className="flex items-center gap-2 text-sm font-medium text-green-600">
              <span className="material-symbols-outlined">tune</span>
              顯示
            </button>
          </div>

          <div className="hidden lg:block space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Categories</h3>
              <Link href="/products" className="text-xs font-medium text-gray-500 hover:text-green-600">
                Clear
              </Link>
            </div>

            <div className="space-y-4">
              {roots.map((root) => {
                const children = getChildren(root.id);
                const isRootActive = category === root.slug || category === root.id;

                return (
                  <div key={root.id}>
                    <Link
                      href={`/products?category=${root.slug || root.id}`}
                      className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors font-bold ${isRootActive ? "text-green-700" : "text-gray-900 hover:text-green-600"}`}
                    >
                      <span className="material-symbols-outlined text-[20px] text-gray-400">category</span>
                      {root.name}
                    </Link>

                    {children.length > 0 && (
                      <ul className="ml-8 space-y-1 mt-1 border-l-2 border-gray-100 pl-2">
                        {children.map(child => {
                          const isChildActive = category === child.slug || category === child.id;
                          return (
                            <li key={child.id}>
                              <Link
                                href={`/products?category=${child.slug || child.id}`}
                                className={`block py-1 text-sm transition-colors ${isChildActive ? "text-green-600 font-bold" : "text-gray-500 hover:text-gray-900"}`}
                              >
                                {child.name}
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>

            {roots.length === 0 && (
              <div className="text-sm text-gray-400 italic">No categories found.</div>
            )}
          </div>

          <hr className="hidden lg:block border-gray-200" />

          {/* Static Filters Placeholder */}
          <div className="hidden lg:block space-y-4">
            <h3 className="font-bold text-gray-900">價格區間</h3>
            <div className="text-sm text-gray-500">Coming soon</div>
          </div>
        </aside>

        {/* Main Content */}
        <section className="flex-1 flex flex-col gap-6">
          {/* Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-black px-8 py-10 md:py-14 shadow-lg isolate">
            <div className="absolute inset-0 -z-10 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2813&auto=format&fit=crop')] bg-cover bg-center opacity-40" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-gray-900/90 to-transparent" />
            <div className="flex max-w-lg flex-col gap-4">
              <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-green-500/20 px-3 py-1 text-xs font-bold text-green-300 backdrop-blur-md border border-green-500/30">
                <span className="material-symbols-outlined text-[16px]">eco</span>
                Sustainability Impact
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                Don&apos;t Buy it. <span className="text-green-400">Rent it.</span>
              </h1>
              <p className="text-gray-200 text-sm md:text-base leading-relaxed">
                Access premium gear for your next adventure without the clutter. Save money and reduce waste with every rental.
              </p>
            </div>
          </div>

          {/* List Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Available Items</h2>
              <p className="text-sm text-gray-500">Showing {productList.length} results</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-500 whitespace-nowrap">Sort by:</span>
              <select className="h-10 rounded-lg border border-gray-200 bg-white text-sm">
                <option>Newest Arrivals</option>
                <option>Price: Low to High</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {productList.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              目前沒有商品。
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              {productList.map((item) => (
                <Link
                  key={item.id}
                  href={`/products/${item.id}`}
                  className="group flex flex-col overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-green-200"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                    {item.images && item.images[0] ? (
                      <Image
                        src={item.images[0]}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
                    )}

                    {item.status === "active" && (
                      <div className="absolute left-3 top-3 inline-flex items-center rounded-md bg-green-500 px-2 py-1 text-xs font-bold text-white shadow-sm">
                        Available
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="text-base font-bold text-gray-900 line-clamp-2 group-hover:text-green-700 transition-colors">
                      {item.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <span className="material-symbols-outlined text-[16px]">location_on</span>
                      {item.pickupLocation || '未知地點'}
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <p className="text-lg font-extrabold text-green-600">
                        ${item.pricePerDay} <span className="text-xs font-medium text-gray-400">/ day</span>
                      </p>
                      <button className="rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-900 border border-gray-200 group-hover:bg-green-600 group-hover:text-white group-hover:border-green-600 transition-colors">
                        Rent Now
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
