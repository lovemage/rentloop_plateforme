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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ring-1 ring-neutral-200 dark:ring-neutral-800">
                <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center sticky top-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur z-10 transition-colors">
                    <h3 className="text-xl font-bold">會員詳情</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 space-y-8 text-neutral-800 dark:text-neutral-200">

                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 sm:col-span-1">
                            <div className="text-sm text-neutral-500 font-bold mb-1">姓名</div>
                            <div>{member.name} ({member.realName || '未實名'})</div>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <div className="text-sm text-neutral-500 font-bold mb-1">Email</div>
                            <div>{member.email}</div>
                        </div>
                        <div>
                            <div className="text-sm text-neutral-500 font-bold mb-1">電話</div>
                            <div>{member.phone || '-'}</div>
                        </div>
                        <div>
                            <div className="text-sm text-neutral-500 font-bold mb-1">所在城市</div>
                            <div>{member.hostCity || '-'}</div>
                        </div>
                        <div>
                            <div className="text-sm text-neutral-500 font-bold mb-1">加入時間</div>
                            <div>{member.createdAt ? new Date(member.createdAt).toLocaleDateString() : '-'}</div>
                        </div>
                        <div>
                            <div className="text-sm text-neutral-500 font-bold mb-1">狀態</div>
                            <div className={`font-bold ${member.isBlocked ? 'text-red-500' : 'text-green-500'}`}>
                                {member.isBlocked ? '已封鎖' : '正常'}
                            </div>
                        </div>
                    </div>

                    {/* KYC Section */}
                    <div className="border-t border-neutral-100 dark:border-neutral-800 pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-lg">KYC 身份認證</h4>
                            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${member.kycStatus === 'approved' ? 'bg-green-100 text-green-700' :
                                    member.kycStatus === 'pending' ? 'bg-orange-100 text-orange-700' :
                                        'bg-gray-100 text-gray-500'
                                }`}>
                                {member.kycStatus === 'approved' ? '已通過' : member.kycStatus === 'pending' ? '審核中' : member.kycStatus || '未申請'}
                            </span>
                        </div>

                        {member.kycStatus === 'pending' && (
                            <div className="flex gap-2 mb-4">
                                <button
                                    onClick={() => handleKyc('approved')}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700"
                                >
                                    通過審核
                                </button>
                                <button
                                    onClick={() => handleKyc('rejected')}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700"
                                >
                                    退回申請
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-neutral-50 dark:bg-neutral-800 p-2 rounded-xl">
                                <div className="text-xs font-bold mb-2 text-center text-neutral-500">正面</div>
                                {member.kycFront ? (
                                    <div className="relative aspect-[16/10] w-full">
                                        <Image src={member.kycFront} alt="KYC Front" fill className="object-contain rounded-lg" unoptimized />
                                        <a href={member.kycFront} target="_blank" className="absolute bottom-1 right-1 bg-black/50 text-white p-1 rounded text-xs">查看原圖</a>
                                    </div>
                                ) : (
                                    <div className="h-32 flex items-center justify-center text-neutral-400 text-xs">無圖片</div>
                                )}
                            </div>
                            <div className="bg-neutral-50 dark:bg-neutral-800 p-2 rounded-xl">
                                <div className="text-xs font-bold mb-2 text-center text-neutral-500">反面</div>
                                {member.kycBack ? (
                                    <div className="relative aspect-[16/10] w-full">
                                        <Image src={member.kycBack} alt="KYC Back" fill className="object-contain rounded-lg" unoptimized />
                                        <a href={member.kycBack} target="_blank" className="absolute bottom-1 right-1 bg-black/50 text-white p-1 rounded text-xs">查看原圖</a>
                                    </div>
                                ) : (
                                    <div className="h-32 flex items-center justify-center text-neutral-400 text-xs">無圖片</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Admin Note */}
                    <div className="border-t border-neutral-100 dark:border-neutral-800 pt-6">
                        <h4 className="font-bold text-lg mb-2">管理員備註</h4>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full h-24 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="在此輸入備註（僅管理員可見）"
                        />
                        <div className="flex justify-end mt-2">
                            <button
                                onClick={handleSaveNote}
                                disabled={isSaving}
                                className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-bold disabled:opacity-50"
                            >
                                {isSaving ? '儲存中...' : '儲存備註'}
                            </button>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="border-t border-neutral-100 dark:border-neutral-800 pt-6">
                        <h4 className="font-bold text-lg mb-4 text-red-600">危險區域</h4>
                        <div className="flex gap-3">
                            <button
                                onClick={handleBlock}
                                className={`px-4 py-2 text-sm font-bold rounded-lg border ${member.isBlocked
                                        ? 'border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                                        : 'border-orange-200 text-orange-600 bg-orange-50 hover:bg-orange-100'
                                    }`}
                            >
                                {member.isBlocked ? '解除封鎖' : '封鎖用戶'}
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50"
                            >
                                刪除用戶
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
