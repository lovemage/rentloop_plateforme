'use client';

import { useState } from 'react';
import Image from 'next/image';
import { toggleBlockMember, updateAdminNote, deleteMember, updateKycStatus } from '@/app/actions/admin-members';
import toast from 'react-hot-toast';

interface MemberData {
    id: string;
    name: string | null;
    email: string;
    role: string | null;
    isBlocked: boolean | null;
    adminNotes: string | null;
    kycStatus: string | null;
    kycFront: string | null;
    kycBack: string | null;
    realName: string | null;
    phone: string | null;
    hostCity: string | null;
    createdAt: Date | null;
}

interface ModalProps {
    member: MemberData;
    onClose: () => void;
    onRefresh: () => void;
}

export function MemberEditModal({ member, onClose, onRefresh }: ModalProps) {
    const [note, setNote] = useState(member.adminNotes || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveNote = async () => {
        setIsSaving(true);
        try {
            await updateAdminNote(member.id, note);
            toast.success('備註已更新');
            onRefresh();
        } catch (e) {
            toast.error('更新失敗');
        } finally {
            setIsSaving(false);
        }
    };

    const handleBlock = async () => {
        if (!confirm(member.isBlocked ? '確定要解鎖此用戶嗎？' : '確定要封鎖此用戶嗎？')) return;
        try {
            await toggleBlockMember(member.id, !member.isBlocked);
            toast.success(member.isBlocked ? '已解鎖' : '已封鎖');
            onRefresh();
            onClose();
        } catch (e) {
            toast.error('操作失敗');
        }
    };

    const handleDelete = async () => {
        if (!confirm('確定要永久刪除此用戶嗎？此操作無法復原！')) return;
        try {
            await deleteMember(member.id);
            toast.success('用戶已刪除');
            onRefresh();
            onClose();
        } catch (e) {
            toast.error('刪除失敗');
        }
    };

    const handleKyc = async (status: 'approved' | 'rejected') => {
        if (!confirm(`確定要${status === 'approved' ? '通過' : '退回'} KYC 審核嗎？`)) return;
        try {
            await updateKycStatus(member.id, status);
            toast.success('KYC 狀態已更新');
            onRefresh();
            // onClose(); // Keep open to see result? Or close.
        } catch (e) {
            toast.error('操作失敗');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur">
            <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl">
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-500 text-white">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-white/80">會員管理</p>
                        <h3 className="text-2xl font-bold leading-tight">會員詳情</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
                        aria-label="關閉"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 space-y-8 text-gray-900">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-100 bg-gray-50/60 p-5 sm:grid-cols-2">
                        <InfoField label="姓名" value={`${member.name || '未命名'}（${member.realName || '未實名'}）`} />
                        <InfoField label="Email" value={member.email} />
                        <InfoField label="電話" value={member.phone || '-'} />
                        <InfoField label="所在城市" value={member.hostCity || '-'} />
                        <InfoField label="加入時間" value={member.createdAt ? new Date(member.createdAt).toLocaleDateString() : '-'} />
                        <InfoField
                            label="帳號狀態"
                            value={
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${member.isBlocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                                    {member.isBlocked ? '已封鎖' : '正常'}
                                </span>
                            }
                        />
                    </div>

                    {/* KYC Section */}
                    <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
                            <div>
                                <h4 className="text-lg font-bold text-gray-900">KYC 身份認證</h4>
                                <p className="text-sm text-gray-500">審核身份證上傳資料，維持平台安全性</p>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${member.kycStatus === 'approved'
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : member.kycStatus === 'pending'
                                    ? 'bg-orange-100 text-orange-700 border border-orange-200'
                                    : 'bg-gray-100 text-gray-500 border border-gray-200'
                                }`}>
                                {member.kycStatus === 'approved' ? '已通過' : member.kycStatus === 'pending' ? '審核中' : member.kycStatus || '未申請'}
                            </span>
                        </div>

                        <div className="space-y-4 p-5">
                            {member.kycStatus === 'pending' && (
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={() => handleKyc('approved')}
                                        className="rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white transition-all duration-200 hover:bg-green-700 hover:-translate-y-0.5 active:scale-95"
                                    >
                                        通過審核
                                    </button>
                                    <button
                                        onClick={() => handleKyc('rejected')}
                                        className="rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition-all duration-200 hover:bg-red-100 hover:-translate-y-0.5 active:scale-95"
                                    >
                                        退回申請
                                    </button>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <KycCard label="身分證正面" imageUrl={member.kycFront} />
                                <KycCard label="身分證反面" imageUrl={member.kycBack} />
                            </div>
                        </div>
                    </section>

                    {/* Admin Note */}
                    <section className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-lg font-bold text-gray-900">管理員備註</h4>
                                <p className="text-sm text-gray-500">僅供後台團隊查看的備註內容</p>
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Internal</span>
                        </div>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full rounded-2xl border border-gray-200 bg-gray-50/80 p-4 text-sm text-gray-900 shadow-inner focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
                            placeholder="在此輸入備註（僅管理員可見）"
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={handleSaveNote}
                                disabled={isSaving}
                                className="rounded-xl bg-gray-900 px-5 py-2 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-black disabled:opacity-50"
                            >
                                {isSaving ? '儲存中...' : '儲存備註'}
                            </button>
                        </div>
                    </section>

                    {/* Danger Zone */}
                    <section className="rounded-2xl border border-red-100 bg-red-50/40 p-5 space-y-3">
                        <h4 className="text-lg font-bold text-red-600">危險區域</h4>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={handleBlock}
                                className={`rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${member.isBlocked
                                    ? 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                    : 'bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-200'
                                    }`}
                            >
                                {member.isBlocked ? '解除封鎖' : '封鎖用戶'}
                            </button>
                            <button
                                onClick={handleDelete}
                                className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-600 transition-all duration-200 hover:bg-red-50 hover:-translate-y-0.5 active:scale-95"
                            >
                                刪除用戶
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

function InfoField({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-widest text-gray-500">{label}</div>
            <div className="text-sm font-semibold text-gray-900">{value || '-'}</div>
        </div>
    );
}

function KycCard({ label, imageUrl }: { label: string; imageUrl: string | null }) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-3">
            <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-gray-500">
                {label}
                {imageUrl && (
                    <a href={imageUrl} target="_blank" className="text-[11px] font-semibold text-green-700 hover:underline">
                        查看原圖
                    </a>
                )}
            </div>
            {imageUrl ? (
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <Image src={imageUrl} alt={label} fill className="object-contain" unoptimized />
                </div>
            ) : (
                <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-gray-300 text-xs text-gray-400">
                    無圖片
                </div>
            )}
        </div>
    );
}
