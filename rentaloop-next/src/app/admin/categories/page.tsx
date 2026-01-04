'use client'

import { useState, useEffect } from 'react';
import { FolderTree, Plus, Edit2, Trash2, ChevronRight, ChevronDown, X } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/app/actions/categories';
import type { Category } from '@/app/actions/categories';

// Types
type CategoryNode = Category & {
    children?: CategoryNode[];
};

// --- Simple Modal Component ---
function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}

// --- Recursive Tree Item Component ---
function CategoryItem({
    node,
    level = 0,
    onAddChild,
    onEdit,
    onDelete
}: {
    node: CategoryNode;
    level?: number;
    onAddChild: (parent: CategoryNode) => void;
    onEdit: (node: CategoryNode) => void;
    onDelete: (id: string) => void;
}) {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className="select-none">
            <div
                className={`flex items-center gap-2 py-2 px-3 rounded-lg group transition-colors hover:bg-gray-50 border border-transparent hover:border-gray-100 mb-1`}
                style={{ marginLeft: `${level * 24}px` }}
            >
                {/* Expand Toggle */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`p-1 rounded hover:bg-gray-200 text-gray-400 ${hasChildren ? 'visible' : 'invisible'}`}
                >
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>

                {/* Level Indicator Badge */}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${level === 0 ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        level === 1 ? 'bg-purple-50 text-purple-600 border-purple-100' :
                            'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                    L{level + 1}
                </span>

                {/* Name */}
                <span className="font-medium text-gray-700">{node.name}</span>

                {/* Slug (Optional) */}
                {node.slug && <span className="text-xs text-gray-400 font-mono">/{node.slug}</span>}

                {/* Actions (Show on Hover) */}
                <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {level < 2 && ( // Limit depth to 3 levels (0, 1, 2)
                        <button
                            onClick={() => onAddChild(node)}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                            title="新增子分類"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={() => onEdit(node)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="編輯"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(node.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="刪除"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Children */}
            {isExpanded && node.children && (
                <div className="relative">
                    {/* Vertical Guide Line */}
                    <div
                        className="absolute top-0 bottom-2 w-px bg-gray-200"
                        style={{ left: `${(level * 24) + 15}px` }}
                    />
                    {node.children.map(child => (
                        <CategoryItem
                            key={child.id}
                            node={child}
                            level={level + 1}
                            onAddChild={onAddChild}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// --- Main Page Component ---
export default function CategoriesPage() {
    const [categoriesData, setCategoriesData] = useState<CategoryNode[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [editingNode, setEditingNode] = useState<CategoryNode | null>(null);
    const [parentNode, setParentNode] = useState<CategoryNode | null>(null);

    // Form State
    const [formData, setFormData] = useState({ name: '', slug: '' });

    // Fetch Data
    const loadData = async () => {
        setLoading(true);
        const result = await getCategories();
        if (result.success && result.data) {
            // Build Tree
            const buildTree = (items: Category[]) => {
                const map = new Map<string, CategoryNode>();
                const roots: CategoryNode[] = [];

                // Initialize map
                items.forEach(item => map.set(item.id, { ...item, children: [] }));

                // Connect nodes
                items.forEach(item => {
                    if (item.parentId && map.has(item.parentId)) {
                        map.get(item.parentId)!.children!.push(map.get(item.id)!);
                    } else {
                        roots.push(map.get(item.id)!);
                    }
                });
                return roots;
            };
            setCategoriesData(buildTree(result.data));
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    // Handlers
    const handleOpenCreateRoot = () => {
        setModalMode('create');
        setParentNode(null);
        setEditFormData({ name: '', slug: '' });
        setIsModalOpen(true);
    };

    const handleOpenCreateChild = (parent: CategoryNode) => {
        setModalMode('create');
        setParentNode(parent);
        setEditFormData({ name: '', slug: '' });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (node: CategoryNode) => {
        setModalMode('edit');
        setEditingNode(node);
        setEditFormData({ name: node.name, slug: node.slug || '' });
        setIsModalOpen(true);
    };

    const setEditFormData = (data: { name: string, slug: string }) => {
        setFormData(data);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) return;

        if (modalMode === 'create') {
            await createCategory({
                name: formData.name,
                slug: formData.slug || null,
                parentId: parentNode?.id || null,
                level: parentNode ? (parentNode.level || 0) + 1 : 1,
            });
        } else if (modalMode === 'edit' && editingNode) {
            await updateCategory(editingNode.id, {
                name: formData.name,
                slug: formData.slug || null,
            });
        }

        setIsModalOpen(false);
        loadData(); // Reload tree
    };

    const handleDelete = async (id: string) => {
        if (confirm('確定要刪除此分類嗎？這可能會影響其下的子分類。')) {
            await deleteCategory(id);
            loadData();
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">分類架構</h2>
                    <p className="text-sm text-gray-500 mt-1">管理商品的分類樹狀結構 (最多支援 3 層)</p>
                </div>
                <button
                    onClick={handleOpenCreateRoot}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    新增主分類
                </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 min-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center h-40 text-gray-400">Loading...</div>
                ) : categoriesData.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <FolderTree className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="text-gray-900 font-medium">尚無分類</h3>
                        <p className="text-gray-500 text-sm mt-1">點擊右上方按鈕新增第一個分類</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {categoriesData.map(node => (
                            <CategoryItem
                                key={node.id}
                                node={node}
                                onAddChild={handleOpenCreateChild}
                                onEdit={handleOpenEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalMode === 'create' ? `新增分類 ${parentNode ? `(於 ${parentNode.name} 之下)` : '(根目錄)'}` : '編輯分類'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">分類名稱 <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                            placeholder="例如：露營裝備"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">網址代稱 (Slug)</label>
                        <input
                            type="text"
                            value={formData.slug}
                            onChange={e => setFormData({ ...formData, slug: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                            placeholder="例如：camping-gear"
                        />
                        <p className="text-xs text-gray-500 mt-1">用於網址顯示，若留空將自動生成。</p>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-colors"
                        >
                            {modalMode === 'create' ? '建立' : '儲存變更'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
