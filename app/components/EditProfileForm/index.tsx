'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfile } from '@/app/lib/actions/actionProfile';
import { getGradientFromName } from '@/app/lib/avatar';

import EditProfileHeader from './EditProfileHeader';
import ProfileImageSection from './ProfileImageSection';
import ImageUrlInputs from './ImageUrlInputs';
import ProfileFormFields from './ProfileFormFields';

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
  const [isUploading, setIsUploading] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const isCloudinaryConfigured =
    Boolean(cloudName) &&
    cloudName !== 'your_cloud_name' &&
    Boolean(uploadPreset) &&
    uploadPreset !== 'my_avatar_preset';

  const triggerAvatarUpload = (openCloudinary?: () => void) => {
    if (isCloudinaryConfigured && openCloudinary) {
      try {
        openCloudinary();
        return;
      } catch (e) {
        console.warn('Cloudinary upload failed, falling back to local file picker:', e);
      }
    }
    avatarInputRef.current?.click();
  };

  const triggerCoverUpload = (openCloudinary?: () => void) => {
    if (isCloudinaryConfigured && openCloudinary) {
      try {
        openCloudinary();
        return;
      } catch (e) {
        console.warn('Cloudinary upload failed, falling back to local file picker:', e);
      }
    }
    coverInputRef.current?.click();
  };

  const bgGradient = getGradientFromName(userName || initialUser.userName);

  const uploadToCloudinary = async (file: File): Promise<string> => {
    if (!cloudName || cloudName === 'your_cloud_name') {
      throw new Error('Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in your .env file.');
    }
    if (!uploadPreset) {
      throw new Error('Please set NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in your .env file.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error?.message || 'Failed to upload image to Cloudinary.');
    }

    return data.secure_url;
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE_BYTES) {
      setError('File size must be under 10MB');
      return;
    }

    try {
      setIsUploading(true);
      const cloudinaryUrl = await uploadToCloudinary(file);
      setter(cloudinaryUrl);
      setIsUploading(false);
    } catch (err: any) {
      setIsUploading(false);
      console.error('Error uploading file to Cloudinary:', err);
      setError(err.message || 'Failed to upload image to Cloudinary');
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
        <EditProfileHeader isSubmitting={isSubmitting} isUploading={isUploading} />

        <form id="edit-profile-form" onSubmit={handleSubmit} className="p-4 space-y-6">
          {error && (
            <div className="p-3 border border-red-500/50 rounded-lg bg-red-500/10 font-medium text-red-400 text-sm">
              {error}
            </div>
          )}

          <ProfileImageSection
            name={name}
            avatar={avatar}
            coverImage={coverImage}
            bgGradient={bgGradient}
            uploadPreset={uploadPreset}
            setAvatar={setAvatar}
            setCoverImage={setCoverImage}
            avatarInputRef={avatarInputRef}
            coverInputRef={coverInputRef}
            triggerAvatarUpload={triggerAvatarUpload}
            triggerCoverUpload={triggerCoverUpload}
            handleFileUpload={handleFileUpload}
          />

          <ImageUrlInputs
            avatar={avatar}
            coverImage={coverImage}
            uploadPreset={uploadPreset}
            setAvatar={setAvatar}
            setCoverImage={setCoverImage}
            triggerAvatarUpload={triggerAvatarUpload}
            triggerCoverUpload={triggerCoverUpload}
          />

          <ProfileFormFields
            name={name}
            userName={userName}
            bio={bio}
            job={job}
            isSubmitting={isSubmitting}
            isUploading={isUploading}
            setName={setName}
            setUserName={setUserName}
            setBio={setBio}
            setJob={setJob}
          />
        </form>
      </div>
    </div>
  );
}
