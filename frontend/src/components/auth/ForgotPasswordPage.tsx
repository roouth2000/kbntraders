import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, KeyRound, CheckCircle2, Copy } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('vintwork@gmail.com');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    const result = await forgotPassword(email);
    setIsLoading(false);

    if (result.success) {
      setIsSubmitted(true);
      if (result.resetToken) setResetToken(result.resetToken);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-[#f4f7f8] flex flex-col justify-center py-6 sm:py-12 px-3 sm:px-6 lg:px-8 w-full">
      {/* Back to Login */}
      <div className="w-full max-w-md mx-auto mb-4">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-700 transition-colors py-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </div>

      <div className="w-full max-w-md mx-auto">
        {/* Brand Header */}
        <div className="text-center mb-6 sm:mb-8">
          <Link to="/" className="inline-flex items-center justify-center gap-2 mb-2 sm:mb-3">
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center">
              <div className="w-3.5 sm:w-4 h-6 sm:h-7 bg-teal-500 rounded-full rotate-[-15deg] transform -translate-x-0.5"></div>
              <div className="w-3.5 sm:w-4 h-6 sm:h-7 bg-teal-300 rounded-full rotate-[-15deg] transform translate-x-0.5 opacity-90"></div>
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">Finova</span>
          </Link>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 break-words">
            Reset Your Password
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Enter your registered email address to receive password recovery instructions.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white py-6 sm:py-8 px-4 sm:px-8 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 w-full">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                placeholder="name@company.com"
                required
              />

              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="w-full bg-[#0d9488] hover:bg-[#0f766e] py-2.5 font-bold min-h-[44px] active:scale-[0.98]"
              >
                <KeyRound className="w-4 h-4 mr-2 shrink-0" />
                {isLoading ? 'Generating Link...' : 'Send Reset Instructions'}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div className="text-xs text-teal-900">
                  <p className="font-bold">Reset link dispatched!</p>
                  <p className="mt-1 text-teal-700">
                    If <span className="font-semibold">{email}</span> matches an existing account, reset credentials have been issued.
                  </p>
                </div>
              </div>

              {resetToken && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-slate-700">Test Recovery Token:</span>
                    <button
                      onClick={() => copyToClipboard(resetToken)}
                      className="text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-1 cursor-pointer py-1"
                    >
                      <Copy className="w-3 h-3" />
                      Copy Token
                    </button>
                  </div>
                  <code className="block p-2 bg-white rounded border border-slate-200 text-[11px] font-mono break-all text-slate-600">
                    {resetToken}
                  </code>
                </div>
              )}

              <div className="pt-2 flex flex-col gap-2">
                <Button
                  type="button"
                  variant="primary"
                  className="w-full bg-[#0d9488] hover:bg-[#0f766e] min-h-[44px] active:scale-[0.98]"
                  onClick={() =>
                    navigate(
                      `/reset-password?token=${resetToken || ''}&email=${encodeURIComponent(email)}`
                    )
                  }
                >
                  Proceed to Reset Form
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  className="w-full min-h-[44px] active:scale-[0.98]"
                  onClick={() => setIsSubmitted(false)}
                >
                  Try Another Email
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center text-xs text-slate-500">
            <span>Remembered your password? </span>
            <Link to="/login" className="font-bold text-teal-600 hover:text-teal-700">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
