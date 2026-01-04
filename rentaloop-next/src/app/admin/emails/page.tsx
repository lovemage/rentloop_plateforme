'use client';

import { useState, useEffect, useCallback } from "react";
import { getEmailTemplates, updateEmailTemplate } from "@/app/actions/admin-emails";
import { Mail, Edit, Save, X, Info } from "lucide-react";
import toast from "react-hot-toast";

interface EmailTemplate {
    key: string;
    subject: string;
    body: string;
    description: string | null;
    variables: string | null;
    updatedAt: Date | null;
}

export default function EmailTemplatesPage() {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [editSubject, setEditSubject] = useState("");
    const [editBody, setEditBody] = useState("");

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getEmailTemplates();
            setTemplates(data);
        } catch (error) {
            console.error(error);
            toast.error("載入失敗");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleEdit = (template: EmailTemplate) => {
        setSelectedTemplate(template);
        setEditSubject(template.subject);
        setEditBody(template.body);
    };

    const handleClose = () => {
        setSelectedTemplate(null);
    };

    const handleSave = async () => {
        if (!selectedTemplate) return;
        setIsSaving(true);
        try {
            await updateEmailTemplate(selectedTemplate.key, editSubject, editBody);
            toast.success("模板已更新");
            fetchData();
            handleClose();
        } catch (error) {
            toast.error("更新失敗");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="relative">
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">信件模板管理</h2>
                    <p className="text-sm text-gray-500 mt-1">自訂系統發送的各類通知信件內容</p>
                </div>

                {loading ? (
                    <div>載入中...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {templates.map((template) => (
                            <div
                                key={template.key}
                                onClick={() => handleEdit(template)}
                                className="group relative bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-green-200 transition-all cursor-pointer"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-green-50 rounded-lg text-green-600 group-hover:bg-green-100 transition-colors">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <button className="text-gray-400 group-hover:text-green-600">
                                        <Edit className="w-5 h-5" />
                                    </button>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">{template.description || template.key}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2">{template.subject}</p>
                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                                    <span>{template.key}</span>
                                    <span>{template.updatedAt ? new Date(template.updatedAt).toLocaleDateString() : '-'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Editing Drawer */}
            {selectedTemplate && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 z-40 transition-opacity backdrop-blur-sm"
                        onClick={handleClose}
                    />

                    {/* Drawer Panel */}
                    <div className="fixed inset-y-0 right-0 z-50 w-full md:w-[600px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        {/* Header */}
                        <div className="h-16 px-6 border-b border-gray-200 flex items-center justify-between bg-white">
                            <h3 className="text-lg font-bold">編輯模板：{selectedTemplate.description}</h3>
                            <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">

                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 flex gap-3">
                                <Info className="w-5 h-5 flex-shrink-0" />
                                <div>
                                    <div className="font-bold mb-1">可用變數</div>
                                    <p className="opacity-80">
                                        在內容中使用 <code className="bg-blue-100 px-1 rounded">{`{{變數名稱}}`}</code> 來插入動態資料。
                                        此模板可用變數：{selectedTemplate.variables || "無"}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">信件主旨</label>
                                <input
                                    type="text"
                                    value={editSubject}
                                    onChange={(e) => setEditSubject(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none"
                                />
                            </div>

                            <div className="space-y-2 flex-1 flex flex-col">
                                <label className="text-sm font-bold text-gray-700">信件內容 (支援 HTML)</label>
                                <textarea
                                    value={editBody}
                                    onChange={(e) => setEditBody(e.target.value)}
                                    className="w-full h-[400px] px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none font-mono text-sm leading-relaxed"
                                />
                                <p className="text-xs text-gray-500 text-right">系統會自動附上網站 Logo 與頁尾。</p>
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-200 bg-white flex justify-end gap-3">
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {isSaving ? "儲存中..." : "儲存設定"}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
