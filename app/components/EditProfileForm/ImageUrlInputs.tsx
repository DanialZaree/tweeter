'use client';

import { CldUploadWidget } from 'next-cloudinary';
import { Upload, Loader2 } from 'lucide-react';

interface ImageUrlInputsProps {
  avatar: string;
  coverImage: string;
  uploadPreset?: string;
  isUploadingAvatar?: boolean;
  isUploadingCover?: boolean;
  setIsUploadingAvatar?: (val: boolean) => void;
  setIsUploadingCover?: (val: boolean) => void;
  setAvatar: (val: string) => void;
  setCoverImage: (val: string) => void;
  triggerAvatarUpload: (openCloudinary?: () => void) => void;
  triggerCoverUpload: (openCloudinary?: () => void) => void;
}

export default function ImageUrlInputs({
  avatar,
  coverImage,
  uploadPreset,
  isUploadingAvatar,
  isUploadingCover,
  setIsUploadingAvatar,
  setIsUploadingCover,
  setAvatar,
  setCoverImage,
  triggerAvatarUpload,
  triggerCoverUpload,
}: ImageUrlInputsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border border-white/10 rounded-xl bg-white/5">
      <div>
        <label className="flex items-center justify-between mb-1.5 font-medium text-xs sm:text-sm text-white/70">
          <span>Avatar Image / GIF (max 10MB)</span>
          {isUploadingAvatar && <span className="text-sky-400 text-xs">Uploading...</span>}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={avatar}
            disabled={isUploadingAvatar}
            onChange={(e) => setAvatar(e.target.value)}
            placeholder="Paste URL or upload image/GIF"
            className="flex-1 bg-black/50 px-3 py-2 border border-white/20 focus:border-sky-500 disabled:opacity-50 rounded-lg text-xs sm:text-sm focus:outline-none truncate transition-colors"
          />
          <CldUploadWidget
            uploadPreset={uploadPreset || 'my_avatar_preset'}
            onSuccess={(result: any) => {
              if (result?.info?.secure_url) {
                setAvatar(result.info.secure_url);
              }
              setIsUploadingAvatar?.(false);
            }}
            onError={() => setIsUploadingAvatar?.(false)}
          >
            {({ open }) => (
              <button
                type="button"
                disabled={isUploadingAvatar}
                onClick={() => triggerAvatarUpload(open)}
                className="hover:bg-white/20 p-2 border border-white/20 disabled:opacity-50 rounded-lg text-white bg-white/10 transition-colors cursor-pointer"
                title="Upload Image File"
              >
                {isUploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              </button>
            )}
          </CldUploadWidget>
        </div>
      </div>

      <div>
        <label className="flex items-center justify-between mb-1.5 font-medium text-xs sm:text-sm text-white/70">
          <span>Cover Image / GIF (max 10MB)</span>
          {isUploadingCover && <span className="text-sky-400 text-xs">Uploading...</span>}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={coverImage}
            disabled={isUploadingCover}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="Paste URL or use upload button above"
            className="flex-1 bg-black/50 px-3 py-2 border border-white/20 focus:border-sky-500 disabled:opacity-50 rounded-lg text-xs sm:text-sm focus:outline-none truncate transition-colors"
          />
          <CldUploadWidget
            uploadPreset={uploadPreset || 'my_avatar_preset'}
            onSuccess={(result: any) => {
              if (result?.info?.secure_url) {
                setCoverImage(result.info.secure_url);
              }
              setIsUploadingCover?.(false);
            }}
            onError={() => setIsUploadingCover?.(false)}
          >
            {({ open }) => (
              <button
                type="button"
                disabled={isUploadingCover}
                onClick={() => triggerCoverUpload(open)}
                className="hover:bg-white/20 p-2 border border-white/20 disabled:opacity-50 rounded-lg text-white bg-white/10 transition-colors cursor-pointer"
                title="Upload Image File"
              >
                {isUploadingCover ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              </button>
            )}
          </CldUploadWidget>
        </div>
      </div>
    </div>
  );
}
