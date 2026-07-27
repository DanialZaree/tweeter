'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Avatar from '@/app/components/ui/Avatar';
import { updateProfile } from '@/app/lib/actions/actionProfile';
import { getGradientFromName } from '@/app/lib/avatar';
import { ArrowLeft, Loader2, Camera, X, Upload } from 'lucide-react';

interface UserProfileData {
  id: string;
  name: string;
  userName: string;
  bio?: string | null;
  job?: string | null;
  avatar?: string | null;
  coverImage?: string | null;
}

export default function EditProfileForm({ initialUser }: { initialUser: UserProfileData }) {
  const router = useRouter();

  const [name, setName] = useState(initialUser.name || '');
  const [userName, setUserName] = useState(initialUser.userName || '');
  const [bio, setBio] = useState(initialUser.bio || '');
  const [job, setJob] = useState(initialUser.job || '');
  const [avatar, setAvatar] = useState(initialUser.avatar || '');
  const [coverImage, setCoverImage] = useState(initialUser.coverImage || '');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const bgGradient = getGradientFromName(userName || initialUser.userName);

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const compressImage = (
    file: File,
    maxWidth: number,
    maxHeight: number,
    quality = 0.85
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void,
    isAvatar = false
  ) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_SIZE_BYTES) {
      setError('File size must be under 2MB');
      return;
    }

    try {
      const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
      if (isGif) {
        // Preserve GIF animation by reading raw file as Data URL
        const dataUrl = await readFileAsDataURL(file);
        setter(dataUrl);
      } else {
        const maxWidth = isAvatar ? 400 : 1200;
        const maxHeight = isAvatar ? 400 : 600;
        const compressedDataUrl = await compressImage(file, maxWidth, maxHeight, 0.85);
        setter(compressedDataUrl);
      }
    } catch (err) {
      console.error('Error processing image file:', err);
      setError('Failed to process image file');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await updateProfile({
        name,
        userName,
        bio,
        job,
        avatar,
        coverImage,
      });

      if (!res.success) {
        setError(res.error || 'Failed to update profile');
        setIsSubmitting(false);
        return;
      }

      router.push('/profile');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-black w-full min-h-screen text-white">
      <div className="mx-auto border-white/10 sm:border-x w-full max-w-2xl min-h-screen">
        {/* Header */}
        <div className="top-0 z-10 sticky flex items-center justify-between bg-black/80 backdrop-blur-md px-4 py-3 border-white/10 border-b">
          <div className="flex items-center gap-4">
            <Link
              href="/profile"
              className="hover:bg-white/10 p-2 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-bold text-lg sm:text-xl">Edit profile</h1>
          </div>

          <button
            type="submit"
            form="edit-profile-form"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-white hover:bg-white/90 disabled:opacity-50 px-4 py-1.5 rounded-full font-bold text-black text-sm transition-colors cursor-pointer"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Save
          </button>
        </div>

        <form id="edit-profile-form" onSubmit={handleSubmit} className="p-4 space-y-6">
          {error && (
            <div className="p-3 border border-red-500/50 rounded-lg bg-red-500/10 font-medium text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Banner & Avatar Interactive Section */}
          <div className="relative border border-white/10 rounded-xl overflow-hidden bg-white/5">
            {/* Cover Banner */}
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
                  onChange={(e) => handleFileUpload(e, setCoverImage)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="flex items-center gap-2 bg-black/60 hover:bg-black/80 px-3.5 py-2 rounded-full font-medium text-white text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>{coverImage ? 'Change Cover' : 'Upload Cover'}</span>
                </button>
                {coverImage && (
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

            {/* Avatar Row */}
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
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="hover:bg-white/30 p-2.5 rounded-full text-white transition-colors cursor-pointer"
                      title="Upload Avatar Image"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
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
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Image URLs Input Section (Optional manual URL or Base64 preview) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border border-white/10 rounded-xl bg-white/5">
            <div>
              <label className="flex items-center justify-between mb-1.5 font-medium text-xs sm:text-sm text-white/70">
                <span>Avatar Image / GIF (max 2MB)</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="Paste URL or upload image/GIF"
                  className="flex-1 bg-black/50 px-3 py-2 border border-white/20 focus:border-sky-500 rounded-lg text-xs sm:text-sm focus:outline-none truncate transition-colors"
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="hover:bg-white/20 p-2 border border-white/20 rounded-lg text-white bg-white/10 transition-colors cursor-pointer"
                  title="Upload Image File"
                >
                  <Upload className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="flex items-center justify-between mb-1.5 font-medium text-xs sm:text-sm text-white/70">
                <span>Cover Image / GIF (max 2MB)</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="Paste URL or use upload button above"
                  className="flex-1 bg-black/50 px-3 py-2 border border-white/20 focus:border-sky-500 rounded-lg text-xs sm:text-sm focus:outline-none truncate transition-colors"
                />
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="hover:bg-white/20 p-2 border border-white/20 rounded-lg text-white bg-white/10 transition-colors cursor-pointer"
                  title="Upload Image File"
                >
                  <Upload className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label className="block mb-1.5 font-medium text-xs sm:text-sm text-white/70">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your display name"
              className="w-full bg-black/50 px-3.5 py-2.5 border border-white/20 focus:border-sky-500 rounded-lg text-sm focus:outline-none transition-colors"
            />
          </div>

          {/* Username Field */}
          <div>
            <label className="block mb-1.5 font-medium text-xs sm:text-sm text-white/70">
              Username <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="top-2.5 left-3.5 absolute text-white/40 text-sm">@</span>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="username"
                className="w-full bg-black/50 pr-3.5 pl-8 py-2.5 border border-white/20 focus:border-sky-500 rounded-lg text-sm focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Bio Field */}
          <div>
            <label className="block mb-1.5 font-medium text-xs sm:text-sm text-white/70">
              Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the world about yourself..."
              className="w-full bg-black/50 px-3.5 py-2.5 border border-white/20 focus:border-sky-500 rounded-lg text-sm focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Job Field */}
          <div>
            <label className="block mb-1.5 font-medium text-xs sm:text-sm text-white/70">
              Occupation / Job
            </label>
            <input
              type="text"
              value={job}
              onChange={(e) => setJob(e.target.value)}
              placeholder="Developer, Designer, Writer..."
              className="w-full bg-black/50 px-3.5 py-2.5 border border-white/20 focus:border-sky-500 rounded-lg text-sm focus:outline-none transition-colors"
            />
          </div>

          {/* Buttons Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <Link
              href="/profile"
              className="hover:bg-white/10 px-5 py-2 border border-white/20 rounded-full font-bold text-sm transition-colors text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 px-6 py-2 rounded-full font-bold text-white text-sm transition-colors cursor-pointer"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

