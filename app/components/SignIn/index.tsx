'use client';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Field } from '@base-ui/react/field';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { login } from '@/app/lib/actions/actionAuth';
import { z } from 'zod';

const schema = z.object({
  email: z.email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(64, 'Password must be under 64 characters'),
});

type FormData = z.infer<typeof schema>;

export default function SignIn() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(data: FormData) {
    const result = await login(data.email, data.password);
    if (result && !result.success) {
      setError('password', { message: result.error || 'Invalid email or password' });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 w-full">
      {/* EMAIL */}
      <Field.Root className="flex flex-col gap-1">
        <Field.Label>Email</Field.Label>
        <Field.Control
          {...register('email')}
          name="email"
          type="email"
          placeholder="email"
          required
          className={`p-2 border ${errors.email ? 'focus:outline-red-500 border-red-500' : 'focus:outline-white'}`}
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
            className={`p-2 pr-10 border w-full ${errors.password ? 'focus:outline-red-500 border-red-500' : 'focus:outline-white'}`}
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

      <button
        type="submit"
        className="flex justify-center items-center bg-foreground hover:bg-foreground/80 hover:data-disabled:bg-gray-50 active:bg-foreground/60 active:data-disabled:bg-gray-50 active:data-disabled:shadow-none active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] m-0 px-3 border border-gray-200 rounded-md outline-0 focus-visible:outline-2 focus-visible:outline-blue-800 h-8 sm:h-9 font-medium text-gray-900 text-xs sm:text-sm cursor-pointer select-none transition-colors"
      >
        Sign in
      </button>
    </form>
  );
}
