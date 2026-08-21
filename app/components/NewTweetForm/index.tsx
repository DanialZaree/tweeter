'use client';

import { useState } from 'react';

import { createTweet, createReply } from '@/app/lib/actions/tweet';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@base-ui/react/form';
import { Button } from '@base-ui/react/button';
import { useDrawerStore } from '@/app/store/useDrawerStore';
import { useCharLimitStore } from '@/app/store/useCharLimitStore';
import { Loader2, Image as ImageIcon, X } from 'lucide-react';
import CharLimit from '../CharLimit';
import { useFileUpload } from '@/hooks/use-file-upload';

import { useRouter } from 'next/navigation';

const schema = z.object({
  tweet: z.string().trim().min(1, 'Tweet is required').max(500, 'Max character is 500'),
});

type FormData = z.infer<typeof schema>;

export default function NewTweetForm({
  parentId,
  retweetOfId,
  onSuccess,
}: {
  parentId?: string;
  retweetOfId?: string | null;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { closeDrawer } = useDrawerStore();
  const { updateChar } = useCharLimitStore();

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [fileState, { getInputProps, openFileDialog, removeFile, clearFiles }] = useFileUpload({
    multiple: false,
    accept: 'image/*',
    maxSize: 8 * 1024 * 1024,
  });

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

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

  async function onSubmit(data: FormData) {
    let result;
    setUploadError(null);

    try {
      let mediaUrl = null;
      if (fileState.files.length > 0 && fileState.files[0].file instanceof File) {
        setIsUploading(true);
        try {
          mediaUrl = await uploadToCloudinary(fileState.files[0].file);
        } catch (err: any) {
          setUploadError(err.message || 'Failed to upload image');
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }

      if (parentId) {
        result = await createReply(parentId, data.tweet, mediaUrl);
      } else {
        const formData = new FormData();
        formData.append('content', data.tweet);
        if (retweetOfId) {
          formData.append('retweetOfId', retweetOfId);
        }
        if (mediaUrl) {
          formData.append('mediaUrl', mediaUrl);
        }
        result = await createTweet(formData);
      }
      if (result.success) {
        reset();
        clearFiles();
        updateChar(0);
        router.refresh();
        if (onSuccess) {
          onSuccess();
        } else if (!parentId) {
          closeDrawer();
        }
      } else {
        console.error(result.error);
        setUploadError(result.error || 'Failed to create tweet');
      }
    } catch (e) {
      console.error('there is a error', e);
      setUploadError('An unexpected error occurred');
      setIsUploading(false);
    }
  }

  function charLimitHandler(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const currentLength = event.target.value.length;
    updateChar(currentLength);
  }

  return (
    <Form className="flex flex-col gap-3 w-full max-w-2xl" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col items-start gap-1">
        <textarea
          {...register('tweet', {
            onChange: (e) => {
              charLimitHandler(e);
            },
          })}
          rows={parentId ? 3 : 7}
          placeholder={parentId ? 'Post your reply...' : 'Enter tweet'}
          maxLength={500}
          dir="auto"
          disabled={isSubmitting || isUploading}
          className={`${errors.tweet ? 'focus:outline-red-500 border-red-500' : 'focus:outline-white'} pt-3 pb-10 pl-3.5 pr-2 border border-border rounded-md focus:outline-2 focus:-outline-offset-1 w-full font-normal text-white text-base sm:text-lg resize-y disabled:opacity-50`}
        />

        {fileState.files.length > 0 && (
          <div className="relative w-max mt-2">
            <img
              src={fileState.files[0].preview}
              alt="preview"
              className="rounded-lg max-h-64 object-contain"
            />
            <button
              type="button"
              onClick={() => removeFile(fileState.files[0].id)}
              disabled={isUploading || isSubmitting}
              className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white hover:bg-black/70 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {fileState.errors.length > 0 && (
          <p className="text-red-500 text-sm mt-1">{fileState.errors[0]}</p>
        )}
        {uploadError && <p className="text-red-500 text-sm mt-1">{uploadError}</p>}

        <div className="flex justify-between items-center w-full mt-2">
          <div className="flex items-center text-blue-400">
            <button
              type="button"
              onClick={openFileDialog}
              disabled={isSubmitting || isUploading}
              className="p-2 hover:bg-blue-400/10 rounded-full transition-colors disabled:opacity-50"
              aria-label="Upload image"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <input {...getInputProps()} className="hidden" />
          </div>
          <CharLimit charLimit={500} />
        </div>
        {errors.tweet && <p className="text-red-800 text-sm">{errors.tweet.message}</p>}
      </div>
      <div className="pb-4 sm:pb-2 w-full">
        <Button
          type={'submit'}
          disabled={isSubmitting || isUploading}
          className="flex justify-center items-center gap-2 bg-foreground hover:bg-foreground/80 hover:data-disabled:bg-gray-50 active:bg-foreground/60 active:data-disabled:bg-gray-50 disabled:opacity-50 active:data-disabled:shadow-none active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] m-0 px-4 border border-gray-200 active:border-foreground/60 active:border-t-gray-300 active:data-disabled:border-t-gray-200 rounded-md outline-0 focus-visible:outline-2 focus-visible:outline-blue-800 focus-visible:-outline-offset-1 w-full h-10 font-inherit font-medium text-gray-900 data-disabled:text-gray-500 text-sm sm:text-base cursor-pointer disabled:cursor-not-allowed select-none"
        >
          {(isSubmitting || isUploading) && <Loader2 className="w-4 h-4 animate-spin" />}
          {isUploading
            ? 'Uploading Image...'
            : isSubmitting
              ? parentId
                ? 'Replying...'
                : 'Posting...'
              : parentId
                ? 'Reply'
                : 'Submit'}
        </Button>
      </div>
    </Form>
  );
}
