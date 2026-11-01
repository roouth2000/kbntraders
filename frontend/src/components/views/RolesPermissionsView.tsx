import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  UserPlus,
  RotateCcw,
  Save,
  CheckCircle2,
  Lock,
  Search,
  Check,
  Building2,
  Receipt,
  CreditCard,
  BookOpen,
  Apple,
  BarChart3,
  Settings,
  X,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { api } from '../../services/api';
import {
  RoleDefinition,
  PermissionModule,
  TeamMember,
} from '../../types';

export const RolesPermissionsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'members'>('matrix');
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [permissionModules, setPermissionModules] = useState<PermissionModule[]>([]);
  const [selectedRoleKey, setSelectedRoleKey] = useState<string>('manager');
  const [activePermissions, setActivePermissions] = useState<string[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [searchMemberQuery, setSearchMemberQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Invite Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePassword, setInvitePassword] = useState('Password123!');
  const [inviteRole, setInviteRole] = useState('cashier');
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Load initial data from API with fallback
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [rolesRes, catalogRes, usersRes] = await Promise.all([
        api.getRoles(),
        api.getPermissionCatalog(),
        api.getTeamMembers(),
      ]);

      const fetchedRoles = rolesRes.data?.data || [];
      const fetchedModules = catalogRes.data?.data?.modules || [];
      const fetchedUsers = usersRes.data?.data || [];

      setRoles(fetchedRoles);
      setPermissionModules(fetchedModules);
      setTeamMembers(fetchedUsers);

      const defaultRole = fetchedRoles.find((r: RoleDefinition) => r.key === 'manager') || fetchedRoles[0];
      if (defaultRole) {
        setSelectedRoleKey(defaultRole.key);
        setActivePermissions(defaultRole.permissions || []);
      }
    } catch (_err) {
      // Fallback baseline in case backend is offline
      loadMockFallback();
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockFallback = () => {
    const fallbackRoles: RoleDefinition[] = [
      {
        key: 'admin',
        name: 'Super Administrator',
        badge: 'Full Access',
        color: 'emerald',
        description: 'Complete unrestricted access across fruit auctions, billing, rate adjustments, and governance.',
        isSystem: true,
        permissions: ['*'],
        userCount: 1,
      },
      {
        key: 'manager',
        name: 'Mandi Operations Manager',
        badge: 'Operations Lead',
        color: 'teal',
        description: 'Manages wholesale billing, produce pricing, customer registries, payments, and ledger statements.',
        isSystem: false,
        permissions: [
          'invoices:read', 'invoices:create', 'invoices:edit', 'invoices:export',
          'customers:read', 'customers:create', 'customers:edit',
          'payments:read', 'payments:create', 'payments:edit',
          'ledgers:read', 'ledgers:export',
          'varieties:read', 'varieties:create', 'varieties:edit',
          'reports:dashboard', 'reports:variety', 'reports:financial',
        ],
        userCount: 1,
      },
      {
        key: 'cashier',
        name: 'Cashier & Counter Billing',
        badge: 'Billing Counter',
        color: 'sky',
        description: 'Creates produce invoices at the mandi scale, logs cash/UPI collections, and checks dues.',
        isSystem: false,
        permissions: [
          'invoices:read', 'invoices:create',
          'customers:read', 'customers:create',
          'payments:read', 'payments:create',
          'ledgers:read',
          'varieties:read',
          'reports:dashboard',
        ],
        userCount: 1,
      },
      {
        key: 'user',
        name: 'Standard Staff Member',
        badge: 'Staff',
        color: 'slate',
        description: 'Basic access to create invoices and check buyer accounts with limited rate modification permissions.',
        isSystem: false,
        permissions: [
          'invoices:read', 'invoices:create',
          'customers:read',
          'payments:read', 'payments:create',
          'ledgers:read',
          'varieties:read',
          'reports:dashboard',
        ],
        userCount: 0,
      },
      {
        key: 'viewer',
        name: 'Financial Auditor / Viewer',
        badge: 'Read Only',
        color: 'amber',
        description: 'Read-only access for external accountants and auditors to review financial reports.',
        isSystem: false,
        permissions: [
          'invoices:read',
          'customers:read',
          'payments:read',
          'ledgers:read',
          'varieties:read',
          'reports:dashboard',
        ],
        userCount: 0,
      },
    ];

    setRoles(fallbackRoles);
    setSelectedRoleKey('manager');
    setActivePermissions(fallbackRoles[1].permissions);
  };

  const handleSelectRole = (roleKey: string) => {
    setSelectedRoleKey(roleKey);
    const role = roles.find((r) => r.key === roleKey);
    if (role) {
      setActivePermissions(role.permissions || []);
    }
    setSaveSuccessMessage(null);
  };

  const handleTogglePermission = (permissionKey: string) => {
    if (selectedRoleKey === 'admin') return; // Admin has permanent all permissions

    setActivePermissions((prev) => {
      if (prev.includes(permissionKey)) {
        return prev.filter((p) => p !== permissionKey);
      } else {
        return [...prev, permissionKey];
      }
    });
    setSaveSuccessMessage(null);
  };

  const handleToggleModuleAll = (module: PermissionModule) => {
    if (selectedRoleKey === 'admin') return;

    const moduleKeys = module.permissions.map((p) => p.key);
    const allSelected = moduleKeys.every((k) => activePermissions.includes(k));

    if (allSelected) {
      // Deselect all in module
      setActivePermissions((prev) => prev.filter((k) => !moduleKeys.includes(k)));
    } else {
      // Select all in module
      setActivePermissions((prev) => Array.from(new Set([...prev, ...moduleKeys])));
    }
    setSaveSuccessMessage(null);
  };

  const handleSelectAllGlobal = () => {
    if (selectedRoleKey === 'admin') return;
    const allKeys: string[] = [];
    permissionModules.forEach((m) => {
      m.permissions.forEach((p) => allKeys.push(p.key));
    });
    setActivePermissions(allKeys);
    setSaveSuccessMessage(null);
  };

  const handleDeselectAllGlobal = () => {
    if (selectedRoleKey === 'admin') return;
    setActivePermissions([]);
    setSaveSuccessMessage(null);
  };

  const handleResetToDefault = async () => {
    if (selectedRoleKey === 'admin') return;
    try {
      const res = await api.resetRolePermissions(selectedRoleKey);
      const resetPerms = res.data?.data?.permissions || [];
      setActivePermissions(resetPerms);
      setSaveSuccessMessage(`Reset ${selectedRoleKey} permissions to default`);
      setTimeout(() => setSaveSuccessMessage(null), 3000);
    } catch (_err) {
      // Local fallback reset
      const role = roles.find((r) => r.key === selectedRoleKey);
      if (role) setActivePermissions(role.permissions || []);
    }
  };

  const handleSavePermissions = async () => {
    setIsSaving(true);
    setSaveSuccessMessage(null);
    try {
      await api.updateRolePermissions(selectedRoleKey, activePermissions);

      // Update local role state
      setRoles((prev) =>
        prev.map((r) =>
          r.key === selectedRoleKey ? { ...r, permissions: activePermissions } : r
        )
      );

      setSaveSuccessMessage(`Permissions successfully saved for ${selectedRole?.name || selectedRoleKey}!`);
      setTimeout(() => setSaveSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(`Failed to save permissions: ${err?.message || 'Server error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUserRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.updateUserRole(userId, newRole);
      setTeamMembers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      // Reload roles to refresh user count
      const rolesRes = await api.getRoles();
      if (rolesRes.data?.data) setRoles(rolesRes.data.data);
    } catch (err: any) {
      alert(`Error updating role: ${err?.message || 'Server error'}`);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const nextStatus = !currentStatus;
      await api.toggleUserStatus(userId, nextStatus);
      setTeamMembers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isActive: nextStatus } : u))
      );
    } catch (err: any) {
      alert(`Error updating user status: ${err?.message || 'Server error'}`);
    }
  };

  const handleCreateTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) {
      setInviteError('Please provide staff name and valid email');
      return;
    }

    setIsSubmittingInvite(true);
    setInviteError(null);

    try {
      const res = await api.createTeamMember({
        name: inviteName.trim(),
        email: inviteEmail.trim(),
        password: invitePassword,
        role: inviteRole,
      });

      if (res.data?.data) {
        const newMember: TeamMember = {
          id: res.data.data.id,
          name: res.data.data.name,
          email: res.data.data.email,
          role: res.data.data.role,
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        setTeamMembers((prev) => [newMember, ...prev]);
      }

      // Refresh roles count
      const rolesRes = await api.getRoles();
      if (rolesRes.data?.data) setRoles(rolesRes.data.data);

      setIsInviteModalOpen(false);
      setInviteName('');
      setInviteEmail('');
      setInvitePassword('Password123!');
      setActiveTab('members');
    } catch (err: any) {
      setInviteError(err?.response?.data?.message || err?.message || 'Failed to create team member');
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  const selectedRole = roles.find((r) => r.key === selectedRoleKey);

  const getModuleIcon = (moduleId: string) => {
    switch (moduleId) {
      case 'invoices':
        return <Receipt className="w-5 h-5 text-teal-600" />;
      case 'customers':
        return <Building2 className="w-5 h-5 text-sky-600" />;
      case 'payments':
        return <CreditCard className="w-5 h-5 text-emerald-600" />;
      case 'ledgers':
        return <BookOpen className="w-5 h-5 text-indigo-600" />;
      case 'varieties':
        return <Apple className="w-5 h-5 text-rose-600" />;
      case 'reports':
        return <BarChart3 className="w-5 h-5 text-amber-600" />;
      case 'admin':
        return <Settings className="w-5 h-5 text-purple-600" />;
      default:
        return <Shield className="w-5 h-5 text-slate-600" />;
    }
  };

  const filteredMembers = teamMembers.filter((m) => {
    if (!searchMemberQuery) return true;
    const q = searchMemberQuery.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.role.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Roles & Permissions Governance
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Configure role-based access control (RBAC), customize module permissions, and manage staff accounts.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsInviteModalOpen(true)}
            className="bg-[#0d9488] hover:bg-[#0f766e] text-white shadow-xs font-semibold"
          >
            <UserPlus className="w-4 h-4 mr-1.5" />
            <span>Invite Team Member</span>
          </Button>
        </div>
      </div>

      {/* Navigation View Switcher */}
      <div className="flex items-center gap-3 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`pb-3 px-1 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
            activeTab === 'matrix'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Role Permissions Matrix</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`pb-3 px-1 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
            activeTab === 'members'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Team Members Directory</span>
            <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {teamMembers.length}
            </span>
          </div>
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <span className="ml-3 text-sm text-slate-500 font-medium">Loading permissions hierarchy...</span>
        </div>
      ) : activeTab === 'matrix' ? (
        /* TAB 1: PERMISSIONS MATRIX */
        <div className="space-y-6">
          {/* Role Selector Strip */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Select Role to Inspect & Customize
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {roles.map((role) => {
                const isSelected = selectedRoleKey === role.key;
                return (
                  <button
                    key={role.key}
                    onClick={() => handleSelectRole(role.key)}
                    className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-white border-teal-500 ring-2 ring-teal-500/20 shadow-sm'
                        : 'bg-white hover:bg-slate-50/80 border-slate-200/90 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {role.badge}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-slate-900 truncate">{role.name}</p>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {role.description}
                    </p>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{role.permissions?.length || 0} permissions</span>
                      <span>{role.userCount || 0} staff</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Role Control & Save Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {selectedRole?.name}
                </h3>
                {selectedRole?.isSystem && (
                  <Badge variant="teal" size="sm">System Immutable</Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedRoleKey === 'admin'
                  ? 'The Super Administrator account retains comprehensive access across all modules.'
                  : `Currently active: ${activePermissions.length} of ${permissionModules.reduce((acc, m) => acc + m.permissions.length, 0)} permissions.`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {selectedRoleKey !== 'admin' && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAllGlobal}
                    className="text-xs text-slate-600 hover:text-slate-900"
                  >
                    Select All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeselectAllGlobal}
                    className="text-xs text-slate-600 hover:text-slate-900"
                  >
                    Deselect All
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleResetToDefault}
                    className="text-xs font-semibold"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                    Reset Defaults
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={isSaving}
                    onClick={handleSavePermissions}
                    className="bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold"
                  >
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    {isSaving ? 'Saving...' : 'Save Matrix'}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Success Banner */}
          {saveSuccessMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-800 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveSuccessMessage}</span>
            </div>
          )}

          {/* Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {permissionModules.map((module) => {
              const moduleKeys = module.permissions.map((p) => p.key);
              const allChecked = moduleKeys.every((k) => activePermissions.includes(k));
              const someChecked = moduleKeys.some((k) => activePermissions.includes(k));

              return (
                <div
                  key={module.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 flex flex-col justify-between"
                >
                  <div>
                    {/* Module Header */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-slate-50 rounded-xl">
                          {getModuleIcon(module.id)}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{module.name}</h4>
                          <p className="text-[11px] text-slate-500">{module.description}</p>
                        </div>
                      </div>

                      {selectedRoleKey !== 'admin' && (
                        <button
                          onClick={() => handleToggleModuleAll(module)}
                          className="text-[11px] font-bold text-teal-600 hover:text-teal-700 cursor-pointer shrink-0 pt-1"
                        >
                          {allChecked ? 'Deselect All' : 'Select All'}
                        </button>
                      )}
                    </div>

                    {/* Permissions Item List */}
                    <div className="divide-y divide-slate-100 mt-2">
                      {module.permissions.map((perm) => {
                        const isGranted =
                          selectedRoleKey === 'admin' || activePermissions.includes(perm.key);
                        const isDisabled = selectedRoleKey === 'admin';

                        return (
                          <div
                            key={perm.key}
                            onClick={() => !isDisabled && handleTogglePermission(perm.key)}
                            className={`py-3 flex items-start justify-between gap-3 transition-colors ${
                              isDisabled
                                ? 'cursor-default opacity-90'
                                : 'cursor-pointer hover:bg-slate-50/80 rounded-lg px-1.5'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-slate-800">
                                  {perm.label}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">
                                  {perm.key}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {perm.description}
                              </p>
                            </div>

                            {/* Toggle Switch */}
                            <div className="shrink-0 pt-0.5">
                              <div
                                className={`w-10 h-5.5 flex items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                                  isGranted ? 'bg-[#0d9488]' : 'bg-slate-200'
                                }`}
                              >
                                <div
                                  className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-200 ease-in-out flex items-center justify-center ${
                                    isGranted ? 'translate-x-4.5' : 'translate-x-0'
                                  }`}
                                >
                                  {isDisabled && (
                                    <Lock className="w-2.5 h-2.5 text-slate-400" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Module Footer Status */}
                  <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      {selectedRoleKey === 'admin'
                        ? 'Full control'
                        : `${module.permissions.filter((p) => activePermissions.includes(p.key)).length} of ${module.permissions.length} active`}
                    </span>
                    {allChecked && (
                      <span className="text-teal-600 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Enabled
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* TAB 2: TEAM MEMBERS DIRECTORY */
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search staff by name, email, or role..."
                value={searchMemberQuery}
                onChange={(e) => setSearchMemberQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                Showing {filteredMembers.length} of {teamMembers.length} staff
              </span>
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                            alt={member.name}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{member.name}</p>
                            <p className="text-[11px] text-slate-400">ID: {member.id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {member.email}
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={member.role}
                          onChange={(e) => handleUserRoleChange(member.id, e.target.value)}
                          className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-teal-500 cursor-pointer shadow-2xs"
                        >
                          <option value="admin">Super Administrator</option>
                          <option value="manager">Mandi Operations Manager</option>
                          <option value="cashier">Cashier & Counter Billing</option>
                          <option value="user">Standard Staff</option>
                          <option value="viewer">Financial Auditor</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            member.isActive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              member.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          {member.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleUserStatus(member.id, member.isActive)}
                          className={`text-xs ${
                            member.isActive
                              ? 'text-rose-600 hover:text-rose-700 hover:bg-rose-50'
                              : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {member.isActive ? 'Suspend' : 'Activate'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredMembers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No team members matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Invite Team Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Invite Team Member</h3>
                  <p className="text-xs text-slate-500">Provide staff details and assign an initial role</p>
                </div>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeamMember} className="space-y-4 mt-4">
              {inviteError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                  {inviteError}
                </div>
              )}

              <Input
                label="Full Name"
                placeholder="e.g. Rashid Khan"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                required
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="e.g. rashid.mandi@gmail.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />

              <Input
                label="Temporary Password"
                type="password"
                value={invitePassword}
                onChange={(e) => setInvitePassword(e.target.value)}
                required
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Initial Assigned Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full bg-white border border-slate-200/90 rounded-xl py-2.5 px-3.5 text-sm text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15"
                >
                  <option value="cashier">Cashier & Counter Billing (Recommended)</option>
                  <option value="manager">Mandi Operations Manager</option>
                  <option value="user">Standard Staff</option>
                  <option value="viewer">Financial Auditor (Read Only)</option>
                  <option value="admin">Super Administrator</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setIsInviteModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSubmittingInvite}
                  className="bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold"
                >
                  {isSubmittingInvite ? 'Creating...' : 'Confirm & Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

