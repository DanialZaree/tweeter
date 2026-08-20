'use client';
import { registerUser, sendRegistrationOtp } from '@/app/lib/actions/actionAuth';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Field } from '@base-ui/react/field';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import OAuthButtons from '../OAuthButtons';
import Otp from '../Otp';
import { z } from 'zod';

const schema = z
  .object({
    userName: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username must be less than 20 characters')
      .regex(/^[a-zA-Z0-9]+$/, 'Username can only contain letters and numbers')
      .toLowerCase(),
    email: z
      .string()
      .email('Invalid email address')
      .max(50, 'Email must be less than 50 characters')
      .toLowerCase(),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(64, 'Password must be under 64 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function SignUp() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const [sendOtp, setSendOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pendingData, setPendingData] = useState<Omit<FormData, 'confirmPassword'> | null>(null);

  const email = watch('email');

  async function onSubmit(data: FormData) {
    const { confirmPassword, ...submissionData } = data;

    const result = await sendRegistrationOtp(submissionData);
    if (result && !result.success) {
      if (result.error === 'email already exists') {
        setError('email', { message: 'Email already exists' });
      } else if (result.error === 'username already exists') {
        setError('userName', { message: 'Username already taken' });
      } else {
        setError('userName', { message: result.error || 'Something went wrong, try again' });
      }
      return;
    }
    setPendingData(submissionData);
    setSendOtp(true);
  }

  async function handleVerifyOtp(code: string) {
    if (!pendingData) {
      return {
        success: false,
        error: 'Registration details missing. Please try signing up again.',
      };
    }

    const res = await registerUser(pendingData, code);
    if (res && !res.success) {
      return { success: false, error: res.error || 'Verification failed' };
    }
    return { success: true };
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 w-full">
      {!sendOtp ? (
        <>
          <OAuthButtons />

          {/* USERNAME */}
          <Field.Root className="flex flex-col gap-1">
            <Field.Label>Username</Field.Label>
            <Field.Control
              {...register('userName')}
              name="userName"
              required
              placeholder="username"
              className="p-2 border"
            />
            {errors.userName && <p className="text-red-500 text-sm">{errors.userName.message}</p>}
          </Field.Root>

          {/* EMAIL */}
          <Field.Root className="flex flex-col gap-1">
            <Field.Label>Email</Field.Label>
            <Field.Control
              {...register('email')}
              name="email"
              type="email"
              required
              placeholder="email"
              className="p-2 border"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </Field.Root>

          {/* PASSWORD WITH TOGGLE */}
          <Field.Root className="relative flex flex-col gap-1">
            <Field.Label>Password</Field.Label>

            <div className="relative">
              <Field.Control
                {...register('password')}
                name="password"
                placeholder="password"
                type={showPassword ? 'text' : 'password'}
                required
                className="p-2 pr-10 border w-full"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="top-1/2 right-2 absolute text-gray-500 -translate-y-1/2 cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </Field.Root>

          {/* CONFIRM PASSWORD */}
          <Field.Root className="relative flex flex-col gap-1">
            <Field.Label>Confirm Password</Field.Label>
            <div className="relative">
              <Field.Control
                {...register('confirmPassword')}
                name="confirmPassword"
                placeholder="confirm password"
                type={showPassword ? 'text' : 'password'}
                required
                className="p-2 pr-10 border w-full"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="top-1/2 right-2 absolute text-gray-500 -translate-y-1/2 cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
            )}
          </Field.Root>

          <button
            type="submit"
            className="flex justify-center items-center bg-foreground hover:bg-foreground/80 hover:data-disabled:bg-gray-50 active:bg-foreground/60 active:data-disabled:bg-gray-50 active:data-disabled:shadow-none active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] m-0 px-3 border border-gray-200 rounded-md outline-0 focus-visible:outline-2 focus-visible:outline-blue-800 h-8 sm:h-9 font-medium text-gray-900 text-xs sm:text-sm transition-colors cursor-pointer select-none"
          >
            Create account
          </button>
        </>
      ) : (
        <Otp
          email={email}
          onVerifySuccess={handleVerifyOtp}
          onResendCode={() => pendingData && sendRegistrationOtp(pendingData)}
          onChangeEmail={() => setSendOtp(false)}
        />
      )}
    </form>
  );
}
