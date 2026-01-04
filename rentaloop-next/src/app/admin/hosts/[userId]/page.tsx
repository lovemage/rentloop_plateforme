import Link from "next/link";
import { getHostApplication, setHostStatus } from "@/app/actions/admin-host";

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
  }

  async function reject() {
    "use server";
    await setHostStatus(userId, "rejected");
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
        <div className="flex items-center gap-2">
          <form action={reject}>
            <button className="px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm font-bold hover:bg-red-100">
              拒絕
            </button>
          </form>
          <form action={approve}>
            <button className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-bold hover:bg-green-700">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <div className="text-xs font-bold text-gray-600 mb-2">身分證正面</div>
              {data.kycIdFrontUrl ? (
                <a href={data.kycIdFrontUrl} target="_blank" className="text-sm font-bold text-green-700 hover:underline">檢視圖片</a>
              ) : (
                <div className="text-sm text-gray-400">未提供</div>
              )}
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <div className="text-xs font-bold text-gray-600 mb-2">身分證反面</div>
              {data.kycIdBackUrl ? (
                <a href={data.kycIdBackUrl} target="_blank" className="text-sm font-bold text-green-700 hover:underline">檢視圖片</a>
              ) : (
                <div className="text-sm text-gray-400">未提供</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
