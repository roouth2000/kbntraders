import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Building2, User, Mail, Lock, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface RegisterPageProps {
  onRegister?: (data: { name: string; email: string; companyName: string }) => void;
  onGoToLogin?: () => void;
  onGoToLanding?: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onRegister: propRegister,
  onGoToLogin,
  onGoToLanding,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !companyName || !password) {
      toast.error('All fields are required.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);

    if (propRegister) {
      propRegister({ name, email, companyName });
      setIsSubmitting(false);
      return;
    }

    const success = await register({
      name,
      email,
      companyName,
      password,
      role,
    });

    setIsSubmitting(false);

    if (success) {
      navigate('/dashboard', { replace: true });
    }
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
            Create Your Enterprise Account
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Start issuing invoices and managing double-entry ledgers in 2 minutes
          </p>
        </div>

        <div className="bg-white py-6 sm:py-8 px-4 sm:px-8 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 w-full">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Organization / Company Name"
              placeholder="e.g. KBN Global Trading Co."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              icon={<Building2 className="w-4 h-4" />}
              required
            />

            <Input
              label="Your Full Name"
              placeholder="e.g. Vincent Rompies"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<User className="w-4 h-4" />}
              required
            />

            <Input
              label="Business Email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Account Password"
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Initial Account Role
              </label>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`p-2.5 sm:p-3 rounded-xl border text-left cursor-pointer transition-all active:scale-[0.98] ${
                    role === 'user'
                      ? 'border-teal-500 bg-teal-50/50 ring-2 ring-teal-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900">Trader / User</p>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">Standard ledger access</p>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`p-2.5 sm:p-3 rounded-xl border text-left cursor-pointer transition-all active:scale-[0.98] ${
                    role === 'admin'
                      ? 'border-teal-500 bg-teal-50/50 ring-2 ring-teal-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900">Administrator</p>
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">Full control & security</p>
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="w-full bg-[#0d9488] hover:bg-[#0f766e] py-2.5 font-bold mt-2 min-h-[44px] active:scale-[0.98]"
            >
              {isSubmitting ? 'Registering...' : 'Create Finova Account'}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            <span>Already have an account? </span>
            {onGoToLogin ? (
              <button
                onClick={onGoToLogin}
                className="font-bold text-teal-600 hover:text-teal-700 cursor-pointer"
              >
                Sign In
              </button>
            ) : (
              <Link to="/login" className="font-bold text-teal-600 hover:text-teal-700">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
