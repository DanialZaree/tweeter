'use client';

import { CldUploadWidget } from 'next-cloudinary';
import { Upload } from 'lucide-react';

interface ImageUrlInputsProps {
  avatar: string;
  coverImage: string;
  uploadPreset?: string;
  setAvatar: (val: string) => void;
  setCoverImage: (val: string) => void;
  triggerAvatarUpload: (openCloudinary?: () => void) => void;
  triggerCoverUpload: (openCloudinary?: () => void) => void;
}

export default function ImageUrlInputs({
  avatar,
  coverImage,
  uploadPreset,
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
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            placeholder="Paste URL or upload image/GIF"
            className="flex-1 bg-black/50 px-3 py-2 border border-white/20 focus:border-sky-500 rounded-lg text-xs sm:text-sm focus:outline-none truncate transition-colors"
          />
          <CldUploadWidget
            uploadPreset={uploadPreset || 'my_avatar_preset'}
            onSuccess={(result: any) => {
              if (result?.info?.secure_url) {
                setAvatar(result.info.secure_url);
              }
            }}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={() => triggerAvatarUpload(open)}
                className="hover:bg-white/20 p-2 border border-white/20 rounded-lg text-white bg-white/10 transition-colors cursor-pointer"
                title="Upload Image File"
              >
                <Upload className="w-4 h-4" />
              </button>
            )}
          </CldUploadWidget>
        </div>
      </div>

      <div>
        <label className="flex items-center justify-between mb-1.5 font-medium text-xs sm:text-sm text-white/70">
          <span>Cover Image / GIF (max 10MB)</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="Paste URL or use upload button above"
            className="flex-1 bg-black/50 px-3 py-2 border border-white/20 focus:border-sky-500 rounded-lg text-xs sm:text-sm focus:outline-none truncate transition-colors"
          />
          <CldUploadWidget
            uploadPreset={uploadPreset || 'my_avatar_preset'}
            onSuccess={(result: any) => {
              if (result?.info?.secure_url) {
                setCoverImage(result.info.secure_url);
              }
            }}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={() => triggerCoverUpload(open)}
                className="hover:bg-white/20 p-2 border border-white/20 rounded-lg text-white bg-white/10 transition-colors cursor-pointer"
                title="Upload Image File"
              >
                <Upload className="w-4 h-4" />
              </button>
            )}
          </CldUploadWidget>
        </div>
      </div>
    </div>
  );
}
