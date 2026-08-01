'use client';

import { RefObject } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import Avatar from '@/app/components/ui/Avatar';
import { Camera, X, Loader2 } from 'lucide-react';

interface ProfileImageSectionProps {
  name: string;
  avatar: string;
  coverImage: string;
  bgGradient: string;
  uploadPreset?: string;
  isUploadingAvatar: boolean;
  isUploadingCover: boolean;
  setIsUploadingAvatar: (val: boolean) => void;
  setIsUploadingCover: (val: boolean) => void;
  setAvatar: (val: string) => void;
  setCoverImage: (val: string) => void;
  avatarInputRef: RefObject<HTMLInputElement | null>;
  coverInputRef: RefObject<HTMLInputElement | null>;
  triggerAvatarUpload: (openCloudinary?: () => void) => void;
  triggerCoverUpload: (openCloudinary?: () => void) => void;
  handleFileUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void,
    isAvatar?: boolean
  ) => void;
}

export default function ProfileImageSection({
  name,
  avatar,
  coverImage,
  bgGradient,
  uploadPreset,
  isUploadingAvatar,
  isUploadingCover,
  setIsUploadingAvatar,
  setIsUploadingCover,
  setAvatar,
  setCoverImage,
  avatarInputRef,
  coverInputRef,
  triggerAvatarUpload,
  triggerCoverUpload,
  handleFileUpload,
}: ProfileImageSectionProps) {
  return (
    <div className="relative border border-white/10 rounded-xl overflow-hidden bg-white/5">
      <div
        className={`relative w-full h-40 sm:h-48 bg-cover bg-center ${
          !coverImage ? `bg-linear-to-br ${bgGradient}` : ''
        }`}
        style={coverImage ? { backgroundImage: `url(${coverImage})` } : {}}
      >
        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 backdrop-blur-xs">
          <input
            type="file"
            ref={coverInputRef}
            accept="image/*"
            onChange={(e) => handleFileUpload(e, setCoverImage, false)}
            className="hidden"
          />
          <CldUploadWidget
            uploadPreset={uploadPreset || 'my_avatar_preset'}
            onSuccess={(result: any) => {
              if (result?.info?.secure_url) {
                setCoverImage(result.info.secure_url);
              }
              setIsUploadingCover(false);
            }}
            onError={() => setIsUploadingCover(false)}
          >
            {({ open }) => (
              <button
                type="button"
                disabled={isUploadingCover}
                onClick={() => triggerCoverUpload(open)}
                className="flex items-center gap-2 bg-black/60 hover:bg-black/80 disabled:opacity-75 px-3.5 py-2 rounded-full font-medium text-white text-xs sm:text-sm transition-colors cursor-pointer"
              >
                {isUploadingCover ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                <span>{isUploadingCover ? 'Uploading Cover...' : coverImage ? 'Change Cover' : 'Upload Cover'}</span>
              </button>
            )}
          </CldUploadWidget>
          {coverImage && !isUploadingCover && (
            <button
              type="button"
              onClick={() => setCoverImage('')}
              className="hover:bg-red-500/80 p-2 rounded-full text-white bg-black/60 transition-colors cursor-pointer"
              title="Remove Cover Image"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-end justify-between px-4 pb-4">
        <div className="-mt-12 sm:-mt-14 relative group">
          <div className="rounded-full w-24 sm:w-28 h-24 sm:h-28 overflow-hidden border-4 border-black relative">
            <Avatar name={name || 'User'} image={avatar} size={112} />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-90 transition-opacity">
              <input
                type="file"
                ref={avatarInputRef}
                accept="image/*"
                onChange={(e) => handleFileUpload(e, setAvatar, true)}
                className="hidden"
              />
              {isUploadingAvatar ? (
                <div className="flex items-center gap-1.5 font-medium text-white text-xs">
                  <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
                </div>
              ) : (
                <>
                  <CldUploadWidget
                    uploadPreset={uploadPreset || 'my_avatar_preset'}
                    onSuccess={(result: any) => {
                      if (result?.info?.secure_url) {
                        setAvatar(result.info.secure_url);
                      }
                      setIsUploadingAvatar(false);
                    }}
                    onError={() => setIsUploadingAvatar(false)}
                  >
                    {({ open }) => (
                      <button
                        type="button"
                        disabled={isUploadingAvatar}
                        onClick={() => triggerAvatarUpload(open)}
                        className="hover:bg-white/30 p-2.5 rounded-full text-white transition-colors cursor-pointer"
                        title="Upload Avatar Image"
                      >
                        <Camera className="w-5 h-5" />
                      </button>
                    )}
                  </CldUploadWidget>
                  {avatar && (
                    <button
                      type="button"
                      onClick={() => setAvatar('')}
                      className="hover:bg-red-500/80 p-1.5 rounded-full text-white transition-colors cursor-pointer"
                      title="Remove Avatar Image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
