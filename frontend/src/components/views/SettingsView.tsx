import React, { useState } from 'react';
import { Save, RefreshCw, Database, Building, ShieldCheck, KeyRound, User as UserIcon, Check, Lock } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface SettingsViewProps {
  user?: User | null;
  onResetData?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user: propUser,
  onResetData,
}) => {
  const { user: authUser, updateProfile, changePassword } = useAuth();
  const currentUser = authUser || propUser;

  // Profile Form State
  const [name, setName] = useState(currentUser?.name || 'Vincent Rompies');
  const [companyName, setCompanyName] = useState(currentUser?.companyName || 'KBN Traders & Finova Global');
  const [currency, setCurrency] = useState(currentUser?.currency || 'USD');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // General Ledger defaults
  const [taxId, setTaxId] = useState('27AABCK1234F1Z8');
  const [defaultTaxRate, setDefaultTaxRate] = useState('10');
  const [defaultPaymentTerms, setDefaultPaymentTerms] = useState('Net 15 days');

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !companyName) {
      toast.error('Name and company name cannot be empty');
      return;
    }

    setIsUpdatingProfile(true);
    await updateProfile({
      name,
      companyName,
      currency,
    });
    setIsUpdatingProfile(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Please fill in both current and new passwords.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setIsChangingPassword(true);
    const success = await changePassword(currentPassword, newPassword);
    setIsChangingPassword(false);

    if (success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Account & Organization Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your user profile, change password credentials, and configure ledger rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={currentUser?.role === 'admin' || currentUser?.role === 'Admin' ? 'teal' : 'neutral'}>
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            Role: {currentUser?.role?.toUpperCase() || 'USER'}
          </Badge>
        </div>
      </div>

      {/* Profile Settings Card */}
      <Card className="space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <UserIcon className="w-5 h-5 text-teal-600" />
          <h3 className="text-base font-bold text-slate-800">User Profile & Identity</h3>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Vincent Rompies"
              required
            />

            <Input
              label="Email Address (Account Identifier)"
              value={currentUser?.email || 'vintwork@gmail.com'}
              disabled
              readOnly
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Legal Organization / Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. KBN Traders"
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase">
                Primary Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-teal-500"
              >
                <option value="USD">USD ($) - United States Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="INR">INR (₹) - Indian Rupee</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={isUpdatingProfile}
              className="bg-[#0d9488] hover:bg-[#0f766e]"
            >
              <Save className="w-4 h-4 mr-1.5" />
              {isUpdatingProfile ? 'Saving...' : 'Update Profile'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Change Password Card */}
      <Card className="space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <KeyRound className="w-5 h-5 text-teal-600" />
          <h3 className="text-base font-bold text-slate-800">Change Account Password</h3>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            placeholder="Enter current password"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              placeholder="Re-type new password"
              required
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="secondary"
              disabled={isChangingPassword}
            >
              <KeyRound className="w-4 h-4 mr-1.5" />
              {isChangingPassword ? 'Changing Password...' : 'Change Password'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Ledger & Tax Configurations */}
      <Card className="space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Building className="w-5 h-5 text-teal-600" />
          <h3 className="text-base font-bold text-slate-800">Default Billing & Tax Settings</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Tax Registration ID / GSTIN"
            value={taxId}
            onChange={(e) => setTaxId(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase">
              Default Sales Tax Rate
            </label>
            <select
              value={defaultTaxRate}
              onChange={(e) => setDefaultTaxRate(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-teal-500"
            >
              <option value="0">0% (Exempt)</option>
              <option value="5">5% (GST Lower)</option>
              <option value="10">10% (Finova Standard)</option>
              <option value="18">18% (Commercial VAT)</option>
            </select>
          </div>

          <Input
            label="Default Payment Terms"
            value={defaultPaymentTerms}
            onChange={(e) => setDefaultPaymentTerms(e.target.value)}
          />
        </div>
      </Card>

      {/* Data Reset */}
      {onResetData && (
        <Card className="space-y-3 border-rose-100 bg-rose-50/20">
          <div className="flex items-center gap-2 pb-2 border-b border-rose-100">
            <Database className="w-5 h-5 text-rose-500" />
            <h3 className="text-base font-bold text-slate-800">Database & Mock Data Management</h3>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Reset all sales, purchases, customer ledgers, and journal entries back to the clean Finova reference sample data.
          </p>

          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => {
              if (window.confirm('Reset all ledger data to default Finova state?')) {
                onResetData();
                toast.success('All ledger records have been reset to defaults.');
              }
            }}
          >
            <RefreshCw className="w-4 h-4 mr-1.5" />
            <span>Reset Ledger to Defaults</span>
          </Button>
        </Card>
      )}
    </div>
  );
};
