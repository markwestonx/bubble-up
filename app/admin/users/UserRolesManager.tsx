'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

interface UserRole {
  id: string;
  user_id: string;
  project: string;
  role: 'admin' | 'editor' | 'contributor' | 'read_only';
}

interface Props {
  userId: string;
  userEmail: string;
  onClose: () => void;
}

export default function UserRolesManager({ userId, userEmail, onClose }: Props) {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [projects, setProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'editor' | 'contributor' | 'read_only'>('contributor');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadRoles();
    loadProjects();
  }, [userId]);

  const loadRoles = async () => {
    try {
      const response = await fetch(`/api/admin/user-roles?userId=${userId}`);
      const data = await response.json();

      if (response.ok && data.roles) {
        // Sort roles by project name alphabetically
        const sortedRoles = data.roles.sort((a: UserRole, b: UserRole) =>
          a.project.localeCompare(b.project)
        );
        setRoles(sortedRoles);
      } else {
        setError(data.error || 'Failed to load roles');
      }
    } catch (err) {
      setError('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      // Fetch from Supabase directly
      const { supabase } = await import('@/lib/supabase');
      const { data: backlogData } = await supabase
        .from('backlog_items')
        .select('project');

      if (backlogData && backlogData.length > 0) {
        const uniqueProjects = Array.from(new Set(backlogData.map((item: any) => item.project)));
        setProjects(uniqueProjects as string[]);
      } else {
        // Fallback to all known projects
        setProjects(['AI Governor', 'BubbleUp', 'GTM Spike', 'Horizon Xceed', 'ISO27001', 'Sales Genie']);
      }
    } catch (err) {
      // Fallback to all known projects
      setProjects(['AI Governor', 'BubbleUp', 'GTM Spike', 'Horizon Xceed', 'ISO27001', 'Sales Genie']);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedProject) {
      setError('Please select a project');
      return;
    }

    setAssigning(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/user-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          project: selectedProject,
          role: selectedRole,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await loadRoles();
        setSelectedProject('');
      } else {
        setError(data.error || 'Failed to assign role');
      }
    } catch (err) {
      setError('Failed to assign role');
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveRole = async (project: string) => {
    if (!confirm(`Remove ${userEmail}'s access to ${project}?`)) return;

    try {
      const response = await fetch(`/api/admin/user-roles?userId=${userId}&project=${encodeURIComponent(project)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadRoles();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to remove role');
      }
    } catch (err) {
      setError('Failed to remove role');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'editor': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'contributor': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'read_only': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'editor': return 'Editor';
      case 'contributor': return 'Contributor';
      case 'read_only': return 'Read Only';
      default: return role;
    }
  };

  const availableProjects = projects.filter(
    p => !roles.some(r => r.project === p)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Manage Project Roles</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{userEmail}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Assign New Role */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Assign New Role</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Project</option>
                <option value="ALL">All Projects</option>
                {availableProjects.filter(p => p !== 'ALL').map((project) => (
                  <option key={project} value={project}>{project}</option>
                ))}
              </select>

              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as 'admin' | 'editor' | 'contributor' | 'read_only')}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="read_only">Read Only (View Only)</option>
                <option value="contributor">Contributor (Create & Edit Own)</option>
                <option value="editor">Editor (Edit All Items)</option>
                <option value="admin">Admin (Full Access)</option>
              </select>

              <button
                onClick={handleAssignRole}
                disabled={assigning || !selectedProject}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                {assigning ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>

          {/* Current Roles */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Current Project Access</h3>
            {loading ? (
              <p className="text-gray-600 dark:text-gray-400 text-sm">Loading roles...</p>
            ) : roles.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-sm">No project roles assigned yet</p>
            ) : (
              <div className="space-y-2">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900 dark:text-gray-100">{role.project}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(role.role)}`}>
                        {getRoleDisplayName(role.role)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveRole(role.project)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      title="Remove access"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Role Descriptions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">Role Permissions</h4>
            <div className="space-y-1 text-sm text-blue-800 dark:text-blue-400">
              <div><strong>Admin:</strong> Full access to all projects, users, and settings</div>
              <div><strong>Editor:</strong> Can create and edit all backlog items in the project</div>
              <div><strong>Contributor:</strong> Can create new items and edit only items they created</div>
              <div><strong>Read Only:</strong> View-only access (cannot make any changes)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
