'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Users, UserPlus, Shield, Mail, Trash2, Edit2, Save, X } from 'lucide-react';

interface User {
  id: string;
  email: string;
  created_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  project: string;
  role: 'Admin' | 'Editor' | 'Contributor' | 'Read Only';
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [currentUserIsAdmin, setCurrentUserIsAdmin] = useState(false);

  // Invite form state
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('Contributor');
  const [inviteProject, setInviteProject] = useState('BubbleUp');
  const [inviting, setInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const supabase = createClient();

      // Check if current user is admin
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Query user role - check if user has admin role
      const { data: roleData } = await supabase
        .from('user_project_roles')
        .select('role')
        .eq('user_id', user.id)
        .or(`project.eq.BubbleUp,project.eq.ALL`);

      // Type assertion to work around Supabase TypeScript inference issues
      const roles = roleData as Array<{ role: string }> | null;
      const isAdmin = Boolean(roles && roles.length > 0 && roles[0].role === 'Admin');
      setCurrentUserIsAdmin(isAdmin);

      if (!isAdmin) {
        router.push('/');
        return;
      }

      // Load all users
      const usersResponse = await fetch('/api/users');
      const { users: allUsers } = await usersResponse.json();
      setUsers(allUsers || []);

      // Load all roles
      const { data: allRoles } = await supabase
        .from('user_project_roles')
        .select('*')
        .order('created_at', { ascending: false });

      setRoles(allRoles || []);
      setLoading(false);
    } catch (err) {
      console.error('Error loading admin data:', err);
      setLoading(false);
    }
  };

  const updateRole = async (roleId: string, newRole: string) => {
    const supabase = createClient();
    // Type assertion needed for Supabase update
    const result = await (supabase
      .from('user_project_roles')
      .update({ role: newRole })
      .eq('id', roleId) as any);

    const { error } = result;

    if (!error) {
      setRoles(roles.map(r => r.id === roleId ? { ...r, role: newRole as any } : r));
      setEditingRole(null);
    }
  };

  const deleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role assignment?')) return;

    const supabase = createClient();
    const { error } = await supabase
      .from('user_project_roles')
      .delete()
      .eq('id', roleId);

    if (!error) {
      setRoles(roles.filter(r => r.id !== roleId));
    }
  };

  const getUserEmail = (userId: string) => {
    return users.find(u => u.id === userId)?.email || 'Unknown';
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteMessage(null);
    setInviting(true);

    try {
      const response = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          project: inviteProject
        })
      });

      const data = await response.json();

      if (response.ok) {
        setInviteMessage({ type: 'success', text: data.message || 'Invite sent successfully!' });
        setInviteEmail('');
        setShowInviteForm(false);
        loadData(); // Reload users and roles
      } else {
        setInviteMessage({ type: 'error', text: data.error || 'Failed to send invite' });
      }
    } catch (err) {
      setInviteMessage({ type: 'error', text: 'Failed to send invite' });
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!currentUserIsAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Manage users and their project roles</p>
        </div>

        {inviteMessage && (
          <div className={`mb-6 p-4 rounded-lg ${
            inviteMessage.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
          }`}>
            {inviteMessage.text}
          </div>
        )}

        {/* Invite User Form */}
        {showInviteForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Invite New User
              </h2>
              <button onClick={() => setShowInviteForm(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleInviteUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg"
                >
                  <option value="Admin">Admin</option>
                  <option value="Editor">Editor</option>
                  <option value="Contributor">Contributor</option>
                  <option value="Read Only">Read Only</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project</label>
                <input
                  type="text"
                  value={inviteProject}
                  onChange={(e) => setInviteProject(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg"
                  placeholder="BubbleUp"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={inviting}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Mail className="h-4 w-4" />
                  {inviting ? 'Sending...' : 'Send Invite'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowInviteForm(false)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Roles
            </h2>
            {!showInviteForm && (
              <button
                onClick={() => setShowInviteForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                Invite User
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {roles.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No role assignments found
                    </td>
                  </tr>
                ) : (
                  roles.map((role) => (
                    <tr key={role.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {getUserEmail(role.user_id)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {role.project}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingRole === role.id ? (
                          <select
                            defaultValue={role.role}
                            onChange={(e) => updateRole(role.id, e.target.value)}
                            className="text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-2 py-1"
                          >
                            <option value="Admin">Admin</option>
                            <option value="Editor">Editor</option>
                            <option value="Contributor">Contributor</option>
                            <option value="Read Only">Read Only</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            role.role === 'Admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                            role.role === 'Editor' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            role.role === 'Contributor' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}>
                            {role.role}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          {editingRole === role.id ? (
                            <button
                              onClick={() => setEditingRole(null)}
                              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                              title="Cancel"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => setEditingRole(role.id)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200"
                              title="Edit role"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteRole(role.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-200"
                            title="Delete role"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
          <p><strong>Note:</strong> To add new users or reset passwords, use the Supabase Admin Dashboard.</p>
        </div>
      </div>
    </div>
  );
}
