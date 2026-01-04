import Link from "next/link";
import Image from "next/image";

type ItemCard = {
  id: string;
  title: string;
  images: string[] | null;
  pickupLocation: string | null;
  pricePerDay: number | null;
  deposit: number | null;
};

function Card({ item }: { item: ItemCard }) {
  return (
    <Link
      href={`/products/${item.id}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-green-200"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        {item.images && item.images[0] ? (
          <Image src={item.images[0]} alt={item.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-bold text-gray-900 line-clamp-2 group-hover:text-green-700 transition-colors">{item.title}</h3>
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
          <span className="material-symbols-outlined text-[16px]">location_on</span>
          {item.pickupLocation || "未知地點"}
        </div>
        <div className="mt-auto flex items-center justify-between pt-4">
          <p className="text-lg font-extrabold text-green-600">
            ${item.pricePerDay ?? 0} <span className="text-xs font-medium text-gray-400">/ day</span>
          </p>
          <span className="rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-900 border border-gray-200 group-hover:bg-green-600 group-hover:text-white group-hover:border-green-600 transition-colors">
            查看
          </span>
        </div>
      </div>
    </Link>
  );
}

export function MemberTrackingLists({
  viewed,
  favorites,
  redisConfigured,
}: {
  viewed: ItemCard[];
  favorites: ItemCard[];
  redisConfigured: boolean;
}) {
  return (
    <section className="rounded-2xl bg-surface-light dark:bg-surface-dark p-6 shadow-sm ring-1 ring-border-light dark:ring-border-dark">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">瀏覽與關注</h2>
          <p className="mt-1 text-sm text-text-sub">同步你的瀏覽紀錄與關注商品（由 Redis 儲存）。</p>
        </div>
        {!redisConfigured ? (
          <div className="text-xs font-bold text-red-600">Redis 尚未設定</div>
        ) : null}
      </div>

      <div className="mt-6 space-y-8">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-main">最近瀏覽</h3>
            <span className="text-xs text-text-sub">{viewed.length}</span>
          </div>
          {viewed.length ? (
            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {viewed.map((i) => (
                <Card key={i.id} item={i} />
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-border-light p-6 text-sm text-text-sub">
              目前尚無瀏覽紀錄。
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-main">關注清單</h3>
            <span className="text-xs text-text-sub">{favorites.length}</span>
          </div>
          {favorites.length ? (
            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {favorites.map((i) => (
                <Card key={i.id} item={i} />
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-border-light p-6 text-sm text-text-sub">
              目前尚無關注商品。
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
