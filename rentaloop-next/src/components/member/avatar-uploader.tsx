'use client';

import { useState, useRef, useTransition } from 'react';
import Image from 'next/image';
import { uploadAvatar } from '@/app/actions/upload-avatar';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface AvatarUploaderProps {
    initialImage: string | null;
    userName: string | null;
}

export function AvatarUploader({ initialImage, userName }: AvatarUploaderProps) {
    const [image, setImage] = useState(initialImage);
    const [isPending, startTransition] = useTransition();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Optimistic preview
        const objectUrl = URL.createObjectURL(file);
        setImage(objectUrl);

        const formData = new FormData();
        formData.append('file', file);

        startTransition(async () => {
            const result = await uploadAvatar(formData);
            if (result.success) {
                toast.success('Avatar updated successfully');
                setImage(result.url);
                router.refresh();
            } else {
                toast.error('Failed to update avatar');
                // Revert to initial
                setImage(initialImage);
            }
        });
    };

    return (
        <div className="relative group cursor-pointer inline-block" onClick={() => fileInputRef.current?.click()}>
            <div className="size-32 rounded-full overflow-hidden ring-4 ring-primary/20 bg-gray-200 transition-all group-hover:ring-primary/50 relative">
                {image ? (
                    <Image
                        src={image}
                        alt={userName || 'User'}
                        width={128}
                        height={128}
                        className="object-cover w-full h-full"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400 bg-gray-100">
                        {userName?.[0]?.toUpperCase() || 'U'}
                    </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-white text-3xl font-bold">photo_camera</span>
                </div>

                {/* Loading Overlay */}
                {isPending && (
                    <div className="absolute inset-0 bg-white/60 dark:bg-black/60 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />
        </div>
    );
}
