'use client';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Field } from '@base-ui/react/field';

interface ProfileFormFieldsProps {
  isSubmitting: boolean;
  isUploading: boolean;
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
}

export default function ProfileFormFields({
  isSubmitting,
  isUploading,
  register,
  errors,
}: ProfileFormFieldsProps) {
  return (
    <>
      <Field.Root className="flex flex-col gap-1">
        <Field.Label className="block font-medium text-white/70 text-xs sm:text-sm">
          Name <span className="text-red-400">*</span>
        </Field.Label>
        <Field.Control
          {...register('name')}
          name="name"
          placeholder="Your display name"
          className={`w-full bg-black/50 px-3.5 py-2.5 border ${errors.name ? 'border-red-500' : 'border-white/20 focus:border-sky-500'} rounded-lg text-sm focus:outline-none transition-colors`}
        />
        {errors.name && (
          <p className="mt-1 text-red-500 text-xs">{errors.name.message as string}</p>
        )}
      </Field.Root>

      <Field.Root className="flex flex-col gap-1">
        <Field.Label className="block font-medium text-white/70 text-xs sm:text-sm">
          Username <span className="text-red-400">*</span>
        </Field.Label>
        <div className="relative">
          <span className="top-2.5 left-3.5 absolute text-white/40 text-sm">@</span>
          <Field.Control
            {...register('userName')}
            name="userName"
            placeholder="username"
            className={`w-full bg-black/50 pr-3.5 pl-8 py-2.5 border ${errors.userName ? 'border-red-500' : 'border-white/20 focus:border-sky-500'} rounded-lg text-sm focus:outline-none transition-colors`}
          />
        </div>
        {errors.userName && (
          <p className="mt-1 text-red-500 text-xs">{errors.userName.message as string}</p>
        )}
      </Field.Root>

      <Field.Root className="flex flex-col gap-1">
        <Field.Label className="block font-medium text-white/70 text-xs sm:text-sm">
          Bio
        </Field.Label>
        <Field.Control
          render={<textarea rows={3} />}
          {...register('bio')}
          name="bio"
          placeholder="Tell the world about yourself..."
          className={`w-full bg-black/50 px-3.5 py-2.5 border ${errors.bio ? 'border-red-500' : 'border-white/20 focus:border-sky-500'} rounded-lg text-sm focus:outline-none transition-colors resize-none`}
        />
        {errors.bio && <p className="mt-1 text-red-500 text-xs">{errors.bio.message as string}</p>}
      </Field.Root>

      <Field.Root className="flex flex-col gap-1">
        <Field.Label className="block font-medium text-white/70 text-xs sm:text-sm">
          Occupation / Job
        </Field.Label>
        <Field.Control
          {...register('job')}
          name="job"
          placeholder="Developer, Designer, Writer..."
          className={`w-full bg-black/50 px-3.5 py-2.5 border ${errors.job ? 'border-red-500' : 'border-white/20 focus:border-sky-500'} rounded-lg text-sm focus:outline-none transition-colors`}
        />
        {errors.job && <p className="mt-1 text-red-500 text-xs">{errors.job.message as string}</p>}
      </Field.Root>

      <div className="flex justify-end items-center gap-3 pt-4 border-white/10 border-t">
        <Link
          href="/profile"
          className="hover:bg-white/10 px-5 py-2 border border-white/20 rounded-full font-bold text-center text-sm transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="flex items-center gap-2 bg-white hover:bg-white/90 disabled:opacity-50 px-6 py-2 rounded-full font-bold text-black text-sm cursor-pointer transition-colors"
        >
          {(isSubmitting || isUploading) && <Loader2 className="w-4 h-4 animate-spin" />}
          {isUploading ? 'Uploading...' : 'Save Changes'}
        </button>
      </div>
    </>
  );
}
