import Link from "next/link";
import Image from "next/image";
import { getHostApplication, setHostStatus } from "@/app/actions/admin-host";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function HostApplicationDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const result = await getHostApplication(userId);
  const data = result.success ? result.data : null;

  if (!data) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">租貸會員申請</h2>
        <div className="rounded-xl bg-white border border-gray-200 p-6 text-gray-500">找不到申請資料</div>
        <Link href="/admin/hosts" className="text-green-700 font-semibold hover:underline">← 返回列表</Link>
      </div>
    );
  }

  async function approve() {
    "use server";
    await setHostStatus(userId, "approved");
    revalidatePath("/admin/hosts");
    revalidatePath(`/admin/hosts/${userId}`);
    redirect("/admin/hosts");
  }

  async function reject() {
    "use server";
    await setHostStatus(userId, "rejected");
    revalidatePath("/admin/hosts");
    revalidatePath(`/admin/hosts/${userId}`);
    redirect("/admin/hosts");
  }

  const kycOk = Boolean(data.kycIdFrontUrl && data.kycIdBackUrl);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/hosts" className="text-sm text-gray-500 hover:text-gray-900">← 返回列表</Link>
          <h2 className="mt-2 text-xl font-bold text-gray-900">租貸會員審核</h2>
          <p className="text-sm text-gray-500">檢視申請資料與 KYC，並進行核准/拒絕。</p>
        </div>
        <div className="flex items-center gap-3">
          <form action={reject}>
            <button className="px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm font-bold transition-all duration-200 hover:bg-red-100 hover:-translate-y-0.5 active:scale-95 focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:outline-none">
              拒絕
            </button>
          </form>
          <form action={approve}>
            <button className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-bold transition-all duration-200 hover:bg-green-700 hover:-translate-y-0.5 active:scale-95 shadow-sm focus-visible:ring-2 focus-visible:ring-green-200 focus-visible:outline-none">
              核准
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
          <h3 className="text-sm font-bold text-gray-700">會員資料</h3>
          <div className="text-sm text-gray-800"><span className="font-semibold">姓名：</span>{data.name || "-"}</div>
          <div className="text-sm text-gray-800"><span className="font-semibold">Email：</span>{data.email || "-"}</div>
          <div className="text-sm text-gray-800"><span className="font-semibold">真實姓名：</span>{data.realName || "-"}</div>
          <div className="text-sm text-gray-800"><span className="font-semibold">電話：</span>{data.phone || "-"}</div>
          <div className="text-sm text-gray-800"><span className="font-semibold">所在地：</span>{(data.city || "") + (data.district || "") || "-"}</div>
          <div className="text-sm text-gray-800"><span className="font-semibold">地址：</span>{data.address || "-"}</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
          <h3 className="text-sm font-bold text-gray-700">租貸申請</h3>
          <div className="text-sm text-gray-800"><span className="font-semibold">狀態：</span>{data.hostStatus || "-"}</div>
          <div className="text-sm text-gray-800"><span className="font-semibold">租貸區域：</span>{(data.hostCity || "") + (data.hostDistrict || "") || "-"}</div>
          <div className="text-sm text-gray-800"><span className="font-semibold">規則同意：</span>{data.hostRulesAccepted ? "是" : "否"}</div>
          <div className="text-sm text-gray-800"><span className="font-semibold">KYC：</span>{kycOk ? "齊全" : "缺少"}</div>
        </div>
      </div>

      {/* KYC Images Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-sm font-bold text-gray-700 mb-4">KYC 身分證照片</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Front ID */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-xs font-bold text-gray-600 mb-3">身分證正面</div>
            {data.kycIdFrontUrl ? (
              <a
                href={data.kycIdFrontUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block relative aspect-[3/2] w-full rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity cursor-zoom-in"
              >
                <Image
                  src={data.kycIdFrontUrl}
                  alt="身分證正面"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </a>
            ) : (
              <div className="aspect-[3/2] w-full rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-400">
                未提供
              </div>
            )}
          </div>

          {/* Back ID */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-xs font-bold text-gray-600 mb-3">身分證反面</div>
            {data.kycIdBackUrl ? (
              <a
                href={data.kycIdBackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block relative aspect-[3/2] w-full rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity cursor-zoom-in"
              >
                <Image
                  src={data.kycIdBackUrl}
                  alt="身分證反面"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </a>
            ) : (
              <div className="aspect-[3/2] w-full rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-400">
                未提供
              </div>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-4">* 點擊圖片可在新視窗中檢視完整大小</p>
      </div>
    </div>
  );
}

