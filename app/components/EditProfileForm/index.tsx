'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfile } from '@/app/lib/actions/actionProfile';
import { getGradientFromName } from '@/app/lib/avatar';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(30, 'Name must be 30 characters or less'),
  userName: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be 20 characters or less')
    .regex(/^[a-zA-Z0-9]+$/, 'Username can only contain letters and numbers')
    .toLowerCase(),
  bio: z.string().max(200, 'Bio must be 200 characters or less').optional().nullable(),
  job: z.string().max(15, 'Job must be 15 characters or less').optional().nullable(),
});

type FormData = z.infer<typeof schema>;

import EditProfileHeader from './EditProfileHeader';
import ProfileImageSection from './ProfileImageSection';
import ImageUrlInputs from './ImageUrlInputs';
import ProfileFormFields from './ProfileFormFields';

interface UserProfileData {
  id: string;
  name?: string | null;
  userName?: string | null;
  bio?: string | null;
  job?: string | null;
  avatar?: string | null;
  coverImage?: string | null;
}

export default function EditProfileForm({ initialUser }: { initialUser: UserProfileData }) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError: setFieldError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialUser.name || '',
      userName: initialUser.userName || '',
      bio: initialUser.bio || '',
      job: initialUser.job || '',
    },
  });

  const name = watch('name');
  const userName = watch('userName');
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

  const onSubmit = async (data: FormData) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await updateProfile({
        name: data.name,
        userName: data.userName,
        bio: data.bio || '',
        job: data.job || '',
        avatar,
        coverImage,
      });

      if (!res.success) {
        if (res.error === 'Username already taken') {
          setFieldError('userName', { message: 'Username already taken' });
        } else if (res.error === 'Name is required') {
          setFieldError('name', { message: 'Name is required' });
        } else if (res.error?.toLowerCase().includes('username')) {
          setFieldError('userName', { message: res.error });
        } else {
          setError(res.error || 'Failed to update profile');
        }
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4">
          {error && (
            <div className="bg-red-500/10 p-3 border border-red-500/50 rounded-lg font-medium text-red-400 text-sm">
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
            isSubmitting={isSubmitting}
            isUploading={isUploading}
            register={register}
            errors={errors}
          />
        </form>
      </div>
    </div>
  );
}
