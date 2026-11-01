import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Lock, KeyRound, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const urlEmail = searchParams.get('email');
    const urlToken = searchParams.get('token');
    if (urlEmail) setEmail(urlEmail);
    if (urlToken) setToken(urlToken);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !token || !newPassword) {
      toast.error('All fields are required.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    const success = await resetPassword(email, token, newPassword);
    setIsLoading(false);

    if (success) {
      navigate('/login');
    }
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
            Set New Password
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Choose a strong, secure password for your organization ledger account.
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white py-6 sm:py-8 px-4 sm:px-8 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 w-full">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Verification Reset Token"
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste 64-char token or enter received key"
              icon={<KeyRound className="w-4 h-4" />}
              required
            />

            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              placeholder="Minimum 6 characters"
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              placeholder="Re-enter password"
              required
            />

            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="w-full bg-[#0d9488] hover:bg-[#0f766e] py-2.5 font-bold min-h-[44px] active:scale-[0.98]"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {isLoading ? 'Resetting Password...' : 'Save & Update Password'}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            <span>Remembered current password? </span>
            <Link to="/login" className="font-bold text-teal-600 hover:text-teal-700">
              Sign In Instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
