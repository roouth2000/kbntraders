import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Lock, Mail, ShieldCheck, UserCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../context/AuthContext';

interface LoginPageProps {
  onLogin?: (email: string, password: string) => void;
  onDemoLogin?: () => void;
  onGoToRegister?: () => void;
  onGoToLanding?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLogin: propLogin,
  onDemoLogin: propDemoLogin,
  onGoToRegister,
  onGoToLanding,
}) => {
  const [email, setEmail] = useState('vintwork@gmail.com');
  const [password, setPassword] = useState('Password123!');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSuccessfulAuth = () => {
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    navigate(from, { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (propLogin) {
      propLogin(email, password);
      setIsSubmitting(false);
      return;
    }

    const success = await login(email, password);
    setIsSubmitting(false);
    if (success) {
      handleSuccessfulAuth();
    }
  };

  const handleDemo = async (role: 'admin' | 'user') => {
    if (propDemoLogin) {
      propDemoLogin();
      return;
    }
    await demoLogin(role);
    handleSuccessfulAuth();
  };

  return (
    <div className="min-h-screen bg-[#f4f7f8] flex flex-col justify-center py-6 sm:py-12 px-3 sm:px-6 lg:px-8 w-full">
      {/* Back to landing */}
      <div className="w-full max-w-md mx-auto mb-4">
        {onGoToLanding ? (
          <button
            onClick={onGoToLanding}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-700 transition-colors cursor-pointer py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Landing Page</span>
          </button>
        ) : (
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-700 transition-colors py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Landing Page</span>
          </Link>
        )}
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
            Sign in to KBN Traders Suite
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Access your sales, purchases, and real-time ledger intelligence
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white py-6 sm:py-8 px-4 sm:px-8 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 w-full">
          {/* Quick Demo Access Bar */}
          <div className="mb-5 sm:mb-6 p-3 sm:p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/60">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-teal-900">Instant Demo Access</p>
              <span className="text-[10px] uppercase font-bold text-teal-600 bg-teal-100/70 px-1.5 py-0.5 rounded">
                1-Click
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handleDemo('admin')}
                className="bg-[#0d9488] hover:bg-[#0f766e] text-[11px] sm:text-xs font-bold justify-center py-2 px-1 sm:px-2.5 truncate active:scale-[0.98] min-h-[36px]"
              >
                <ShieldCheck className="w-3.5 h-3.5 mr-1 shrink-0" />
                <span className="truncate">Admin Demo</span>
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleDemo('user')}
                className="text-[11px] sm:text-xs font-bold justify-center py-2 px-1 sm:px-2.5 truncate active:scale-[0.98] min-h-[36px]"
              >
                <UserCheck className="w-3.5 h-3.5 mr-1 shrink-0" />
                <span className="truncate">User Demo</span>
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              required
            />

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 border-slate-300"
                />
                <span className="text-slate-600">Remember me</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-teal-600 hover:text-teal-700 font-semibold"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="w-full bg-[#0d9488] hover:bg-[#0f766e] py-2.5 font-bold min-h-[44px] active:scale-[0.98]"
            >
              {isSubmitting ? 'Verifying...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            <span>Don't have an organization account? </span>
            {onGoToRegister ? (
              <button
                onClick={onGoToRegister}
                className="font-bold text-teal-600 hover:text-teal-700 cursor-pointer"
              >
                Register here
              </button>
            ) : (
              <Link to="/register" className="font-bold text-teal-600 hover:text-teal-700">
                Register here
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
