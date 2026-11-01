import React, { useState, useEffect } from 'react';
import { ExternalLink, Terminal, Shield, RefreshCw, CheckCircle2, Server, Key, Database, BookOpen } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/api';

export const ApiDocsView: React.FC = () => {
  const { user } = useAuth();
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'swagger-frame' | 'endpoints'>('overview');

  const checkHealth = async () => {
    setIsLoadingHealth(true);
    try {
      const res = await apiClient.get('/health');
      setHealthStatus(res.data);
    } catch (err: any) {
      setHealthStatus({
        status: 'error',
        message: 'Backend server is temporarily unreachable or offline on port 5000.',
      });
    } finally {
      setIsLoadingHealth(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const endpoints = [
    {
      method: 'POST',
      path: '/api/auth/register',
      desc: 'Register new user with hashed password and initial role',
      auth: false,
      role: 'Public',
    },
    {
      method: 'POST',
      path: '/api/auth/login',
      desc: 'Authenticate user, issue JWT access token and set HttpOnly refresh cookie',
      auth: false,
      role: 'Public',
    },
    {
      method: 'POST',
      path: '/api/auth/refresh-token',
      desc: 'Exchange HttpOnly refresh cookie for a new valid JWT access token',
      auth: false,
      role: 'Public / Cookie',
    },
    {
      method: 'GET',
      path: '/api/auth/me',
      desc: 'Retrieve profile details of the currently authenticated JWT session',
      auth: true,
      role: 'Authenticated',
    },
    {
      method: 'POST',
      path: '/api/auth/forgot-password',
      desc: 'Dispatch password reset email or generate recovery verification token',
      auth: false,
      role: 'Public',
    },
    {
      method: 'POST',
      path: '/api/auth/reset-password',
      desc: 'Reset password using verified recovery token',
      auth: false,
      role: 'Public',
    },
    {
      method: 'PUT',
      path: '/api/auth/profile',
      desc: 'Update user name, company name, avatar, or default accounting currency',
      auth: true,
      role: 'Authenticated',
    },
    {
      method: 'PUT',
      path: '/api/auth/change-password',
      desc: 'Verify old password with bcrypt and update to new password',
      auth: true,
      role: 'Authenticated',
    },
    {
      method: 'GET',
      path: '/api/auth/users',
      desc: 'List all registered organization users (Role-based authorization)',
      auth: true,
      role: 'Admin Only',
    },
    {
      method: 'GET',
      path: '/api/ledgers/entries',
      desc: 'Fetch general ledger journal entries with debit/credit balance',
      auth: true,
      role: 'Authenticated',
    },
    {
      method: 'POST',
      path: '/api/ledgers/entries',
      desc: 'Create new double-entry ledger journal record',
      auth: true,
      role: 'Authenticated',
    },
    {
      method: 'GET',
      path: '/api/invoices',
      desc: 'Retrieve sales invoices or purchase bills with pagination and status filters',
      auth: true,
      role: 'Authenticated',
    },
    {
      method: 'POST',
      path: '/api/invoices',
      desc: 'Record a new sales invoice or vendor purchase voucher with tax calculation',
      auth: true,
      role: 'Authenticated',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-teal-600" />
            Swagger API Documentation & Explorer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            OpenAPI 3.0 specifications for KBN Traders & Finova Global RESTful endpoints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="http://localhost:5000/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#0d9488] hover:bg-[#0f766e] transition-colors shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Native Swagger UI</span>
          </a>
        </div>
      </div>

      {/* Backend Status Banner */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-3.5 h-3.5 rounded-full ${
              healthStatus?.status === 'ok' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                Backend Status: {healthStatus?.status === 'ok' ? 'Online & Healthy' : 'Probing...'}
              </span>
              <Badge variant="neutral" className="text-[10px] py-0 font-mono">
                Port 5000
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500">
              Database Engine: {healthStatus?.database?.engine || 'MySQL / Resilient Memory Store'}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={checkHealth}
          disabled={isLoadingHealth}
          className="text-xs font-semibold"
        >
          <RefreshCw className={`w-3 h-3 mr-1 ${isLoadingHealth ? 'animate-spin' : ''}`} />
          Check Health
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'overview'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          API Architecture & Security
        </button>
        <button
          onClick={() => setActiveTab('endpoints')}
          className={`pb-3 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'endpoints'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Endpoint Reference ({endpoints.length})
        </button>
        <button
          onClick={() => setActiveTab('swagger-frame')}
          className={`pb-3 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'swagger-frame'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Embedded Swagger UI
        </button>
      </div>

      {/* Tab 1: Architecture & Security */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 space-y-2 border-teal-100 bg-teal-50/20">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center mb-1">
                <Key className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Dual-Token JWT Security</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Short-lived Access Tokens (15m) held purely in memory (Zustand). Long-lived Refresh Tokens (7d) stored securely in HttpOnly, SameSite cookies to protect against XSS and token exfiltration.
              </p>
            </Card>

            <Card className="p-4 space-y-2 border-emerald-100 bg-emerald-50/20">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1">
                <Shield className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Role-Based Authorization</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Granular middleware checks role permissions (e.g. <span className="font-mono text-emerald-700">admin</span> vs <span className="font-mono text-slate-700">user</span>) across protected endpoints such as user management and financial audits.
              </p>
            </Card>

            <Card className="p-4 space-y-2 border-sky-100 bg-sky-50/20">
              <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center mb-1">
                <Database className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">MySQL & phpMyAdmin</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Full relational schemas for users, refresh tokens, password resets, ledgers, and billing invoices. Includes resilient automatic memory fallback for development continuity.
              </p>
            </Card>
          </div>

          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Environment Configuration Keys</h3>
            <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl font-mono text-xs overflow-x-auto space-y-1">
              <p className="text-slate-400"># Backend (backend/.env)</p>
              <p><span className="text-teal-400">PORT</span>=5000</p>
              <p><span className="text-teal-400">NODE_ENV</span>=development</p>
              <p><span className="text-teal-400">FRONTEND_URL</span>=http://localhost:5173</p>
              <p><span className="text-teal-400">DB_HOST</span>=localhost | <span className="text-teal-400">DB_USER</span>=root | <span className="text-teal-400">DB_NAME</span>=kbntraders_db</p>
              <p><span className="text-teal-400">JWT_ACCESS_SECRET</span>=*** (32+ char high-entropy secret)</p>
              <p><span className="text-teal-400">JWT_REFRESH_SECRET</span>=*** (32+ char high-entropy secret)</p>
              <p><span className="text-teal-400">COOKIE_SECRET</span>=*** (Signed cookie validation)</p>
              <p><span className="text-teal-400">RESET_TOKEN_EXPIRES_IN</span>=1h</p>
              <p className="text-slate-400 mt-2"># Frontend (.env)</p>
              <p><span className="text-emerald-400">VITE_API_BASE_URL</span>=http://localhost:5000/api</p>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Endpoints */}
      {activeTab === 'endpoints' && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Endpoint</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Auth / Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {endpoints.map((ep, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                          ep.method === 'GET'
                            ? 'bg-blue-100 text-blue-700'
                            : ep.method === 'POST'
                            ? 'bg-emerald-100 text-emerald-700'
                            : ep.method === 'PUT'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {ep.method}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                      {ep.path}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {ep.desc}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          ep.role.includes('Admin')
                            ? 'danger'
                            : ep.role.includes('Authenticated')
                            ? 'teal'
                            : 'neutral'
                        }
                      >
                        {ep.role}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 3: Embedded Swagger Frame */}
      {activeTab === 'swagger-frame' && (
        <Card className="p-0 overflow-hidden">
          <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>Embedded View: http://localhost:5000/api/docs</span>
            <a
              href="http://localhost:5000/api/docs"
              target="_blank"
              rel="noreferrer"
              className="text-teal-600 hover:text-teal-800 font-bold flex items-center gap-1"
            >
              Open in new tab <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <iframe
            src="http://localhost:5000/api/docs"
            title="Swagger Documentation"
            className="w-full h-[700px] border-none bg-white"
          />
        </Card>
      )}
    </div>
  );
};
