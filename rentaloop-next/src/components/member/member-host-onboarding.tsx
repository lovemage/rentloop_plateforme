"use client";

import { useMemo, useState, useTransition } from "react";
import { uploadKycImage } from "@/app/actions/kyc-upload";
import { upsertMyProfile } from "@/app/actions/member-profile";
import { taiwanCities } from "@/lib/taiwan-cities";

type ProfileShape = {
  hostStatus: string | null;
  hostCity: string | null;
  hostDistrict: string | null;
  kycIdFrontUrl: string | null;
  kycIdBackUrl: string | null;
  hostRulesAccepted: boolean | null;
};

const hostRules = [
  "出租前須確認商品狀況、配件完整並提供正確照片與描述。",
  "租借期間如有損壞、遺失，需依平台規範與雙方協議進行賠償處理。",
  "不得上架違法、侵權或有安全疑慮之物品。",
  "須於約定時間內交付與收回物品，並保持良好溝通回覆。",
  "平台得因風險控管需要，要求補充文件或暫停上架權限。",
];

async function uploadSide(file: File, side: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("side", side);
  return uploadKycImage(formData);
}

export function MemberHostOnboarding({ initialProfile }: { initialProfile: ProfileShape | null }) {
  const [isPending, startTransition] = useTransition();
  const [frontUrl, setFrontUrl] = useState(initialProfile?.kycIdFrontUrl ?? "");
  const [backUrl, setBackUrl] = useState(initialProfile?.kycIdBackUrl ?? "");

  const [notice, setNotice] = useState<string | null>(null);

  const [hostCity, setHostCity] = useState(initialProfile?.hostCity ?? "");
  const [hostDistrict, setHostDistrict] = useState(initialProfile?.hostDistrict ?? "");
  const [rulesAccepted, setRulesAccepted] = useState(!!initialProfile?.hostRulesAccepted);
  const [privacyAccepted, setPrivacyAccepted] = useState(!!initialProfile?.hostRulesAccepted); // Initialize based on rules accepted or false? Better distinct. Assume false if not persisted or use rulesAccepted as proxy? 
  // Schema doesn't have privacyAccepted field. But usually implies rules. 
  // Let's init false to force check.


  const [status, setStatus] = useState(initialProfile?.hostStatus ?? "none");
  const isLocked = status === "pending" || status === "approved";

  const canSubmit = useMemo(() => {
    return Boolean(hostCity && rulesAccepted && frontUrl && backUrl && privacyAccepted);
  }, [hostCity, rulesAccepted, frontUrl, backUrl, privacyAccepted]);

  // Upload error state
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFront = (file: File) => {
    setUploadError(null);
    startTransition(async () => {
      const res = await uploadSide(file, "front");
      if (res.success) {
        setFrontUrl(res.url);
      } else {
        const errorMsg = res.error === "UPLOAD_FAILED"
          ? "身分證正面上傳失敗，請稍後再試"
          : "上傳發生錯誤";
        setUploadError(errorMsg);
        console.error("KYC Front upload failed:", res.error);
      }
    });
  };

  const handleBack = (file: File) => {
    setUploadError(null);
    startTransition(async () => {
      const res = await uploadSide(file, "back");
      if (res.success) {
        setBackUrl(res.url);
      } else {
        const errorMsg = res.error === "UPLOAD_FAILED"
          ? "身分證背面上傳失敗，請稍後再試"
          : "上傳發生錯誤";
        setUploadError(errorMsg);
        console.error("KYC Back upload failed:", res.error);
      }
    });
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    if (isLocked) return;

    startTransition(async () => {
      await upsertMyProfile({
        hostStatus: "pending",
        hostCity,
        hostDistrict,
        kycIdFrontUrl: frontUrl,
        kycIdBackUrl: backUrl,
        hostRulesAccepted: rulesAccepted,
      });

      setStatus("pending");
      setNotice("已送出租貸會員申請，我們將於 72 小時內人工完成驗證。");
    });
  };

  return (
    <section className="rounded-2xl bg-surface-light dark:bg-surface-dark p-6 shadow-sm ring-1 ring-border-light dark:ring-border-dark">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-xl font-bold">租貸會員申請</h2>
          <p className="mt-1 text-sm text-text-sub">完成身份認證與規則同意後，即可開啟上架功能。</p>
        </div>
        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold border ${status === 'approved'
          ? 'bg-green-100 text-green-700 border-green-200'
          : status === 'pending'
            ? 'bg-orange-100 text-orange-700 border-orange-200'
            : status === 'rejected'
              ? 'bg-red-100 text-red-700 border-red-200'
              : 'bg-gray-100 text-gray-600 border-gray-200'
          }`}>
          <span className="material-symbols-outlined text-sm">verified_user</span>
          {status === 'approved' ? '已通過' : status === 'pending' ? '審核中' : status === 'rejected' ? '已退回' : '未申請'}
        </div>
      </div>

      {notice ? (
        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-bold text-text-main">
          {notice}
        </div>
      ) : null}

      {status === 'pending' ? (
        <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700">
          申請已送出，請耐心等候審核結果（預計 72 小時內）。
        </div>
      ) : null}

      {status === 'approved' ? (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
          恭喜！你已通過租貸會員認證，可前往上架商品。
        </div>
      ) : null}

      {status === 'rejected' ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          你的申請已被退回，請確認資料與證件照片清晰後重新送出。
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-5">
          <h3 className="text-sm font-bold">租貸規則</h3>
          <ul className="mt-3 space-y-2 text-sm text-text-main">
            {hostRules.map((rule) => (
              <li key={rule} className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
          <label className="mt-4 flex items-start gap-3 rounded-xl bg-primary/10 p-4 border border-primary/20">
            <input
              type="checkbox"
              checked={rulesAccepted}
              onChange={(e) => setRulesAccepted(e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm font-bold">我已閱讀並同意租貸規則</span>
          </label>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-5">
            <h3 className="text-sm font-bold">租貸區域</h3>
            <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-xs font-bold text-text-sub">縣市</span>
                <div className="relative">
                  <select
                    value={hostCity}
                    onChange={(e) => setHostCity(e.target.value)}
                    disabled={isLocked}
                    className="h-12 w-full appearance-none rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark px-4 pr-10 text-sm"
                  >
                    <option value="" disabled>
                      請選擇縣市
                    </option>
                    {taiwanCities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-sub pointer-events-none">
                    expand_more
                  </span>
                </div>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs font-bold text-text-sub">區域</span>
                <input
                  value={hostDistrict}
                  onChange={(e) => setHostDistrict(e.target.value)}
                  disabled={isLocked}
                  className="h-12 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark px-4 text-sm"
                  placeholder="例如：大安區"
                />
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-5">
            <h3 className="text-sm font-bold">身份認證（身分證）</h3>
            <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-xs font-bold text-text-sub">正面</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={isLocked}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFront(f);
                  }}
                />
                {frontUrl ? <a className="text-xs font-bold text-primary hover:underline" href={frontUrl} target="_blank">已上傳</a> : null}
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs font-bold text-text-sub">反面</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={isLocked}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleBack(f);
                  }}
                />
                {backUrl ? <a className="text-xs font-bold text-primary hover:underline" href={backUrl} target="_blank">已上傳</a> : null}
              </label>
            </div>
            {/* Upload Error Message */}
            {uploadError && (
              <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{uploadError}</span>
              </div>
            )}
            {isPending && (
              <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-base animate-spin">sync</span>
                <span>上傳中，請稍候...</span>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-5 mt-4">
            <h3 className="text-sm font-bold">隱私權與注意事項</h3>
            <ul className="mt-3 space-y-2 text-sm text-text-main list-disc pl-5">
              <li>Rentaloop 不會使用您的個資作為除審核外其他用途</li>
              <li>上傳檔案將存放在私有加密雲端空間</li>
              <li>上傳證件建議加註 Rentaloop 認證使用</li>
              <li>
                有任何問題歡迎參閱我們
                <a href="/privacy" className="text-primary hover:underline ml-1" target="_blank" rel="noopener noreferrer">
                  隱私權政策頁面
                </a>
              </li>
            </ul>
            <label className="mt-4 flex items-start gap-3 rounded-xl bg-primary/10 p-4 border border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors">
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                disabled={isLocked}
                className="mt-1 accent-primary"
              />
              <span className="text-sm font-bold">我已閱讀並同意上述隱私權條款與注意事項</span>
            </label>
          </div>



          <div className="flex flex-col gap-3 items-end">
            <div className="text-xs text-red-500 font-medium">
              {!hostCity && <span>• 請選擇縣市<br /></span>}
              {!rulesAccepted && <span>• 請勾選同意租貸規則<br /></span>}
              {(!frontUrl || !backUrl) && <span>• 請上傳身分證正反面照片<br /></span>}
              {!privacyAccepted && <span>• 請勾選同意隱私權條款<br /></span>}
            </div>

            <button
              type="button"
              disabled={!canSubmit || isPending}
              onClick={handleSubmit}
              className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-text-main hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {status === 'rejected' ? '重新送出申請' : '送出租貸會員申請'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
