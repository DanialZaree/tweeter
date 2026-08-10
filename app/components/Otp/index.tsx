'use client';

import { useState, useEffect, useTransition, useRef } from 'react';
import { OTPInput, OTPStatus } from '@/components/motion/otp-input';
import { handleSendOtp, verifyOtp } from '@/app/lib/actions/actionAuth';
import { RotateCcw, Loader2 } from 'lucide-react';

interface OtpProps {
  email?: string;
  length?: number;
  onVerifySuccess?: (
    code: string,
  ) => Promise<{ success: boolean; error?: string } | void> | void;
  onResendCode?: () => void;
  onChangeEmail?: () => void;
}

export default function Otp({
  email = '',
  length = 4,
  onVerifySuccess,
  onResendCode,
  onChangeEmail,
}: OtpProps) {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<OTPStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [timer, setTimer] = useState(60);
  const [isPending, startTransition] = useTransition();
  const [isResending, setIsResending] = useState(false);
  const isResendingRef = useRef(false);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const resetFeedback = () => {
    setStatus('idle');
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleChange = (val: string) => {
    setCode(val);
    if (status === 'error') setStatus('idle');
  };

  const handleComplete = (value: string) => {
    resetFeedback();

    startTransition(async () => {
      if (onVerifySuccess) {
        const res = await onVerifySuccess(value);
        if (res && !res.success) {
          setStatus('error');
          setErrorMessage(res.error || 'Verification failed');
        } else {
          setStatus('success');
          setSuccessMessage('Code verified!');
        }
        return;
      }

      if (!email) {
        setStatus('success');
        setSuccessMessage('Code verified!');
        return;
      }

      const res = await verifyOtp(email, value);
      if (res?.success) {
        setStatus('success');
        setSuccessMessage(res.message || 'Code verified successfully!');
      } else {
        setStatus('error');
        setErrorMessage(res?.error || 'Invalid verification code');
      }
    });
  };

  const handleResend = async () => {
    if (timer > 0 || isPending || isResending || isResendingRef.current) return;

    isResendingRef.current = true;
    setTimer(60);
    setCode('');
    resetFeedback();
    setIsResending(true);

    try {
      if (onResendCode) {
        await onResendCode();
      } else if (email) {
        await handleSendOtp(email);
      }
      setSuccessMessage('A new code has been sent.');
    } catch (err) {
      setStatus('error');
      setErrorMessage('Failed to resend code');
    } finally {
      setIsResending(false);
      isResendingRef.current = false;
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto p-5 border border-surface rounded-xl shadow-xl">
      <div className="text-center">
        <h3 className="text-base font-semibold text-white">Enter Verification Code</h3>
        <p className="text-xs text-zinc-400 mt-1">
          {email ? (
            <>
              We sent a code to <span className="text-zinc-200">{email}</span>
            </>
          ) : (
            'Check your device for the passcode'
          )}
        </p>
      </div>

      <OTPInput
        length={length}
        value={code}
        onChange={handleChange}
        onComplete={handleComplete}
        status={status}
        errorMessage={errorMessage}
        successMessage={successMessage}
        disabled={isPending || isResending || status === 'success'}
        autoFocus
      />

      {(isPending || isResending) && (
        <div className="flex items-center gap-2 text-xs text-blue-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          {isResending ? 'Sending new code...' : 'Verifying code...'}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 w-full pt-2 border-t border-zinc-800/80 text-xs">
        <button
          type="button"
          disabled={isPending || isResending}
          onClick={onChangeEmail}
          className="text-zinc-400 hover:text-zinc-200 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          Change Email
        </button>

        <button
          type="button"
          disabled={timer > 0 || isPending || isResending}
          onClick={handleResend}
          className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 disabled:text-zinc-500 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {timer > 0 ? `Resend code in ${timer}s` : 'Resend Code'}
        </button>
      </div>
    </div>
  );
}

export { Otp };
