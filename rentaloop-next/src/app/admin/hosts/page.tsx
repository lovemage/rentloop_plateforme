import Link from "next/link";
import { listHostApplications } from "@/app/actions/admin-host";

function statusCopy(status: string | null) {
  if (status === "approved") return { label: "已通過", cls: "bg-green-100 text-green-700 border-green-200" };
  if (status === "pending") return { label: "審核中", cls: "bg-orange-100 text-orange-700 border-orange-200" };
  if (status === "rejected") return { label: "已退回", cls: "bg-red-100 text-red-700 border-red-200" };
  return { label: "未申請", cls: "bg-gray-100 text-gray-600 border-gray-200" };
}

export default async function HostApplicationsPage() {
  const result = await listHostApplications();
  const rows = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">租貸會員審核</h2>
          <p className="text-sm text-gray-500 mt-1">審核租貸會員申請（pending → approved / rejected）</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700">會員</th>
                <th className="px-6 py-4 font-semibold text-gray-700">狀態</th>
                <th className="px-6 py-4 font-semibold text-gray-700">租貸區域</th>
                <th className="px-6 py-4 font-semibold text-gray-700">規則</th>
                <th className="px-6 py-4 font-semibold text-gray-700">KYC</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((r) => {
                const status = statusCopy(r.hostStatus);
                const kycOk = Boolean(r.kycIdFrontUrl && r.kycIdBackUrl);
                return (
                  <tr key={r.userId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{r.name || "-"}</div>
                        <div className="text-xs text-gray-500">{r.email || "-"}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.cls}`}> {status.label} </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {(r.hostCity || "") + (r.hostDistrict ? r.hostDistrict : "") || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${r.hostRulesAccepted ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-600 border-gray-200"}`}> {r.hostRulesAccepted ? "已同意" : "未同意"} </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${kycOk ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-600 border-gray-200"}`}> {kycOk ? "齊全" : "缺少"} </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/hosts/${r.userId}`} className="text-green-700 font-semibold hover:underline">
                        檢視 / 審核
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {rows.length === 0 ? (
                <tr>
                  <td className="px-6 py-10 text-center text-gray-400" colSpan={6}>
                    目前沒有租貸會員申請。
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
