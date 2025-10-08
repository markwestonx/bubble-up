'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Users, UserPlus, Shield, Mail, Trash2, Edit2, Save, X, ChevronDown, ChevronRight, FolderOpen, KeyRound, User } from 'lucide-react';

interface User {
  id: string;
  email: string;
  created_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  project: string;
  role: 'admin' | 'editor' | 'read_write' | 'read_only';
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [projects, setProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [currentUserIsAdmin, setCurrentUserIsAdmin] = useState(false);
  const [viewMode, setViewMode] = useState<'users' | 'projects'>('users');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [addingRoleForUser, setAddingRoleForUser] = useState<string | null>(null);
  const [newRoleProject, setNewRoleProject] = useState('');
  const [newRoleRole, setNewRoleRole] = useState('read_write');

  // Invite form state
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('read_write');
  const [inviteProjects, setInviteProjects] = useState<string[]>(['BubbleUp']);
  const [inviting, setInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadData();
    loadProjects();
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
      const isAdmin = Boolean(roles && roles.length > 0 && roles[0].role === 'admin');
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

  const loadProjects = async () => {
    try {
      const supabase = createClient();
      const { data: backlogData } = await supabase
        .from('backlog_items')
        .select('project');

      if (backlogData && backlogData.length > 0) {
        const uniqueProjects = Array.from(new Set(backlogData.map((item: any) => item.project)));
        setProjects(uniqueProjects as string[]);
      }
    } catch (err) {
      console.error('Error loading projects:', err);
    }
  };

  const updateRole = async (roleId: string, newRole: string) => {
    try {
      const roleToUpdate = roles.find(r => r.id === roleId);
      if (!roleToUpdate) return;

      const response = await fetch('/api/admin/user-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: roleToUpdate.user_id,
          project: roleToUpdate.project,
          role: newRole
        })
      });

      if (response.ok) {
        setRoles(roles.map(r => r.id === roleId ? { ...r, role: newRole as any } : r));
        setEditingRole(null);
        setInviteMessage({ type: 'success', text: 'Role updated successfully' });
      } else {
        const data = await response.json();
        setInviteMessage({ type: 'error', text: `Failed to update role: ${data.error}` });
      }
    } catch (err) {
      setInviteMessage({ type: 'error', text: 'Failed to update role' });
    }
  };

  const deleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role assignment?')) return;

    try {
      const roleToDelete = roles.find(r => r.id === roleId);
      if (!roleToDelete) return;

      const response = await fetch(`/api/admin/user-roles?userId=${roleToDelete.user_id}&project=${encodeURIComponent(roleToDelete.project)}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setRoles(roles.filter(r => r.id !== roleId));
        setInviteMessage({ type: 'success', text: 'Role deleted successfully' });
      } else {
        const data = await response.json();
        setInviteMessage({ type: 'error', text: `Failed to delete role: ${data.error}` });
      }
    } catch (err) {
      setInviteMessage({ type: 'error', text: 'Failed to delete role' });
    }
  };

  const getUserEmail = (userId: string) => {
    return users.find(u => u.id === userId)?.email || 'Unknown';
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  // Group roles by user
  const userRolesMap = roles.reduce((acc, role) => {
    const email = getUserEmail(role.user_id);
    if (!acc[email]) {
      acc[email] = [];
    }
    acc[email].push(role);
    return acc;
  }, {} as Record<string, UserRole[]>);

  // Group roles by project
  const projectRolesMap = roles.reduce((acc, role) => {
    if (!acc[role.project]) {
      acc[role.project] = [];
    }
    acc[role.project].push(role);
    return acc;
  }, {} as Record<string, UserRole[]>);

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteMessage(null);

    if (inviteProjects.length === 0) {
      setInviteMessage({ type: 'error', text: 'Please select at least one project' });
      return;
    }

    setInviting(true);

    try {
      const response = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          projects: inviteProjects
        })
      });

      const data = await response.json();

      if (response.ok) {
        const message = data.tempPassword
          ? `User created! Email: ${data.email}\nTemporary Password: ${data.tempPassword}\n\nPlease share this with the user. They must change it on first login.`
          : data.message || 'Invite sent successfully!';

        setInviteMessage({ type: 'success', text: message });
        setInviteEmail('');
        setInviteProjects(['BubbleUp']);
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

  const toggleProjectSelection = (project: string) => {
    setInviteProjects(prev =>
      prev.includes(project)
        ? prev.filter(p => p !== project)
        : [...prev, project]
    );
  };

  const handleResetPassword = async (email: string) => {
    if (!confirm(`Send password reset email to ${email}?`)) return;

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        setInviteMessage({ type: 'error', text: `Failed to send reset email: ${error.message}` });
      } else {
        setInviteMessage({ type: 'success', text: `Password reset email sent to ${email}` });
      }
    } catch (err) {
      setInviteMessage({ type: 'error', text: 'Failed to send password reset email' });
    }
  };

  const handleAddRole = async (userEmail: string) => {
    if (!newRoleProject.trim()) {
      setInviteMessage({ type: 'error', text: 'Please select a project' });
      return;
    }

    try {
      const user = users.find(u => u.email === userEmail);
      if (!user) {
        setInviteMessage({ type: 'error', text: 'User not found' });
        return;
      }

      // Use admin API endpoint instead of direct Supabase client
      const response = await fetch('/api/admin/user-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          project: newRoleProject,
          role: newRoleRole
        })
      });

      const data = await response.json();

      if (response.ok) {
        setInviteMessage({ type: 'success', text: `Role added successfully for ${newRoleProject}` });
        await loadData(); // Reload all data to refresh roles list
        setAddingRoleForUser(null);
        setNewRoleProject('');
        setNewRoleRole('read_write');
      } else {
        setInviteMessage({ type: 'error', text: `Failed to add role: ${data.error}` });
      }
    } catch (err) {
      setInviteMessage({ type: 'error', text: 'Failed to add role' });
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
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
            </div>
            <button
              onClick={() => router.push('/profile')}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <User className="h-5 w-5" />
              <span>Profile</span>
            </button>
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
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="read_write">Read/Write</option>
                  <option value="read_only">Read Only</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Projects ({inviteProjects.length} selected)
                </label>
                <div className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                  {/* ALL project option */}
                  <div
                    onClick={() => toggleProjectSelection('ALL')}
                    className="flex items-center px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer rounded"
                  >
                    <input
                      type="checkbox"
                      checked={inviteProjects.includes('ALL')}
                      onChange={() => {}}
                      className="mr-2 pointer-events-none"
                    />
                    <span className="text-gray-900 dark:text-gray-100 font-medium">ALL</span>
                  </div>

                  {/* Individual project options */}
                  {projects.map((project) => (
                    <div
                      key={project}
                      onClick={() => toggleProjectSelection(project)}
                      className="flex items-center px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer rounded"
                    >
                      <input
                        type="checkbox"
                        checked={inviteProjects.includes(project)}
                        onChange={() => {}}
                        className="mr-2 pointer-events-none"
                      />
                      <span className="text-gray-900 dark:text-gray-100">{project}</span>
                    </div>
                  ))}

                  {projects.length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                      No projects found
                    </div>
                  )}
                </div>
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
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                {viewMode === 'users' ? <Users className="h-5 w-5" /> : <FolderOpen className="h-5 w-5" />}
                {viewMode === 'users' ? 'User Management' : 'Project Management'}
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

            {/* View Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('users')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'users'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                View by Users
              </button>
              <button
                onClick={() => setViewMode('projects')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'projects'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                View by Projects
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {viewMode === 'users' ? (
              // Users View
              Object.keys(userRolesMap).length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No users found
                </div>
              ) : (
                Object.entries(userRolesMap)
                  .sort(([emailA], [emailB]) => emailA.localeCompare(emailB))
                  .map(([email, userRoles]) => (
                  <div key={email} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <div className="px-6 py-4 flex items-center justify-between">
                      <button
                        onClick={() => toggleExpanded(email)}
                        className="flex items-center gap-3 flex-1"
                      >
                        {expandedItems.has(email) ? (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        )}
                        <Mail className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{email}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                          {userRoles.length} {userRoles.length === 1 ? 'role' : 'roles'}
                        </span>
                      </button>
                      <button
                        onClick={() => handleResetPassword(email)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Send password reset email"
                      >
                        <KeyRound className="h-4 w-4" />
                        Reset Password
                      </button>
                    </div>

                    {expandedItems.has(email) && (
                      <div className="px-6 pb-4 pl-16 space-y-2">
                        {userRoles.map((role) => (
                          <div key={role.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className="flex items-center gap-4">
                              <div>
                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {role.project}
                                </div>
                              </div>
                              <div>
                                {editingRole === role.id ? (
                                  <select
                                    defaultValue={role.role}
                                    onChange={(e) => updateRole(role.id, e.target.value)}
                                    onBlur={() => setEditingRole(null)}
                                    autoFocus
                                    className="text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-2 py-1"
                                  >
                                    <option value="admin">Admin</option>
                                    <option value="editor">Editor</option>
                                    <option value="read_write">Read/Write</option>
                                    <option value="read_only">Read Only</option>
                                  </select>
                                ) : (
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    role.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                                    role.role === 'editor' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                    role.role === 'read_write' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                  }`}>
                                    {role.role === 'read_write' ? 'Read/Write' : role.role === 'read_only' ? 'Read Only' : role.role.charAt(0).toUpperCase() + role.role.slice(1)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
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
                          </div>
                        ))}

                        {/* Add Role Form/Button */}
                        {addingRoleForUser === email ? (
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="space-y-2">
                              <select
                                value={newRoleProject}
                                onChange={(e) => setNewRoleProject(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                              >
                                <option value="">Select Project</option>
                                <option value="ALL">ALL</option>
                                {projects.filter(p => !userRoles.some(r => r.project === p)).map((project) => (
                                  <option key={project} value={project}>{project}</option>
                                ))}
                              </select>
                              <select
                                value={newRoleRole}
                                onChange={(e) => setNewRoleRole(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded"
                              >
                                <option value="admin">Admin</option>
                                <option value="editor">Editor</option>
                                <option value="read_write">Read/Write</option>
                                <option value="read_only">Read Only</option>
                              </select>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleAddRole(email)}
                                  className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                >
                                  Add Role
                                </button>
                                <button
                                  onClick={() => {
                                    setAddingRoleForUser(null);
                                    setNewRoleProject('');
                                    setNewRoleRole('read_write');
                                  }}
                                  className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAddingRoleForUser(email)}
                            className="w-full p-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg border border-dashed border-blue-300 dark:border-blue-700 transition-colors"
                          >
                            + Add Role
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )
            ) : (
              // Projects View
              Object.keys(projectRolesMap).length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No projects found
                </div>
              ) : (
                Object.entries(projectRolesMap)
                  .sort(([projectA], [projectB]) => {
                    // Put 'ALL' first, then sort alphabetically
                    if (projectA === 'ALL') return -1;
                    if (projectB === 'ALL') return 1;
                    return projectA.localeCompare(projectB);
                  })
                  .map(([project, projectRoles]) => (
                  <div key={project} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <button
                      onClick={() => toggleExpanded(project)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-3">
                        {expandedItems.has(project) ? (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        )}
                        <FolderOpen className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{project}</span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {projectRoles.length} {projectRoles.length === 1 ? 'user' : 'users'}
                      </span>
                    </button>

                    {expandedItems.has(project) && (
                      <div className="px-6 pb-4 pl-16 space-y-2">
                        {projectRoles.map((role) => (
                          <div key={role.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className="flex items-center gap-4">
                              <div>
                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {getUserEmail(role.user_id)}
                                </div>
                              </div>
                              <div>
                                {editingRole === role.id ? (
                                  <select
                                    defaultValue={role.role}
                                    onChange={(e) => updateRole(role.id, e.target.value)}
                                    onBlur={() => setEditingRole(null)}
                                    autoFocus
                                    className="text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-2 py-1"
                                  >
                                    <option value="admin">Admin</option>
                                    <option value="editor">Editor</option>
                                    <option value="read_write">Read/Write</option>
                                    <option value="read_only">Read Only</option>
                                  </select>
                                ) : (
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    role.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                                    role.role === 'editor' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                    role.role === 'read_write' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                  }`}>
                                    {role.role === 'read_write' ? 'Read/Write' : role.role === 'read_only' ? 'Read Only' : role.role.charAt(0).toUpperCase() + role.role.slice(1)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
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
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            ← Back to Backlog
          </button>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Note:</strong> Users can reset their own password from the Profile page, or you can send a password reset email.
          </p>
        </div>
      </div>
    </div>
  );
}
