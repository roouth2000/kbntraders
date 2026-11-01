import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f4f7f8] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center max-w-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-xl shadow-teal-600/20 mb-4 animate-pulse">
            <span className="text-2xl font-black tracking-tight">F</span>
          </div>
          <div className="w-8 h-8 border-3 border-teal-600/30 border-t-teal-600 rounded-full animate-spin mb-4" />
          <h3 className="text-lg font-bold text-slate-800">Finova Ledger</h3>
          <p className="text-sm text-slate-500 mt-1">Verifying secure authentication session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role?.toLowerCase() !== requiredRole.toLowerCase()) {
    return (
      <div className="min-h-screen bg-[#f4f7f8] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl shadow-slate-200/60 border border-slate-100 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
          <p className="text-sm text-slate-600 mt-2">
            This module requires <span className="font-semibold text-rose-600 uppercase">{requiredRole}</span> privileges. Your current role is <span className="font-semibold text-slate-800 uppercase">{user?.role}</span>.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button
              variant="secondary"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return children ? <>{children}</> : null;
};
