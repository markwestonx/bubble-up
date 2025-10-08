'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  X,
  FileText,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Code,
  Bug,
  TrendingUp,
  MessageSquare,
  List,
  Target,
  Settings,
  Zap,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  Save
} from 'lucide-react';

interface Documentation {
  id: string;
  story_id: string;
  doc_type: string;
  title: string;
  content: string;
  author: string;
  author_email?: string;
  created_at: string;
  tags: string[];
  links: Array<{url: string; title: string}>;
  related_stories: string[];
  category: string;
  priority: string;
  version_number: number;
}

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyId: string;
  storyTitle: string;
  canEdit: boolean;
  canDelete: boolean;
}

const DOC_TYPE_ICONS: Record<string, { icon: React.FC<any>; color: string; bg: string; label: string }> = {
  design: { icon: Lightbulb, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Design' },
  plan: { icon: List, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Plan' },
  progress: { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100', label: 'Progress' },
  next_steps: { icon: Target, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Next Steps' },
  testing: { icon: CheckCircle, color: 'text-teal-600', bg: 'bg-teal-100', label: 'Testing' },
  requirements: { icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-100', label: 'Requirements' },
  feedback: { icon: MessageSquare, color: 'text-pink-600', bg: 'bg-pink-100', label: 'Feedback' },
  build_log: { icon: Settings, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Build Log' },
  test_result: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Test Result' },
  decision_log: { icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Decision' },
  technical_note: { icon: Code, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Technical Note' },
  error: { icon: Bug, color: 'text-red-600', bg: 'bg-red-100', label: 'Error' },
  success: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Success' }
};

export default function DocumentationModal({ isOpen, onClose, storyId, storyTitle, canEdit, canDelete }: DocumentationModalProps) {
  const [documentation, setDocumentation] = useState<Documentation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Documentation | null>(null);
  const [formData, setFormData] = useState({
    doc_type: 'progress' as string,
    title: '',
    content: '',
    tags: '',
    category: 'general',
    priority: 'medium'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDocumentation();
    }
  }, [isOpen, storyId]);

  const loadDocumentation = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get auth token from Supabase client
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/documentation?story_id=${storyId}&limit=100`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load documentation');
      }

      setDocumentation(data.documentation || []);
    } catch (err: any) {
      console.error('Error loading documentation:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (doc?: Documentation) => {
    if (doc) {
      setEditingDoc(doc);
      setFormData({
        doc_type: doc.doc_type,
        title: doc.title,
        content: doc.content,
        tags: doc.tags.join(', '),
        category: doc.category,
        priority: doc.priority
      });
    } else {
      setEditingDoc(null);
      setFormData({
        doc_type: 'progress',
        title: '',
        content: '',
        tags: '',
        category: 'general',
        priority: 'medium'
      });
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingDoc(null);
    setFormData({
      doc_type: 'progress',
      title: '',
      content: '',
      tags: '',
      category: 'general',
      priority: 'medium'
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      // Get auth token from Supabase client
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Not authenticated');
      }

      const tags = formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const payload = {
        story_id: storyId,
        doc_type: formData.doc_type,
        title: formData.title,
        content: formData.content,
        tags,
        category: formData.category,
        priority: formData.priority
      };

      let response;
      if (editingDoc) {
        // Update existing (creates new version)
        response = await fetch(`/api/documentation?id=${editingDoc.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        // Create new
        response = await fetch('/api/documentation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify(payload)
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save documentation');
      }

      await loadDocumentation();
      handleCloseForm();
    } catch (err: any) {
      console.error('Error saving documentation:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this documentation entry?')) {
      return;
    }

    setError(null);

    try {
      // Get auth token from Supabase client
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/documentation?id=${docId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete documentation');
      }

      await loadDocumentation();
    } catch (err: any) {
      console.error('Error deleting documentation:', err);
      setError(err.message);
    }
  };

  if (!isOpen) return null;

  const filteredDocs = selectedType
    ? documentation.filter(doc => doc.doc_type === selectedType)
    : documentation;

  const docTypeCount = documentation.reduce((acc, doc) => {
    acc[doc.doc_type] = (acc[doc.doc_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Documentation
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {storyTitle} (Story #{storyId})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                onClick={() => handleOpenForm()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Documentation
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedType(null)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                selectedType === null
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All ({documentation.length})
            </button>
            {Object.entries(docTypeCount).map(([type, count]) => {
              const config = DOC_TYPE_ICONS[type] || DOC_TYPE_ICONS.technical_note;
              const Icon = config.icon;
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    selectedType === type
                      ? `${config.bg} ${config.color}`
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {config.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">Error loading documentation</h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && filteredDocs.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No documentation yet
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Documentation entries will appear here as they are created
              </p>
            </div>
          )}

          {!loading && !error && filteredDocs.length > 0 && (
            <div className="space-y-4">
              {filteredDocs.map((doc) => {
                const config = DOC_TYPE_ICONS[doc.doc_type] || DOC_TYPE_ICONS.technical_note;
                const Icon = config.icon;
                const isExpanded = expandedDoc === doc.id;

                return (
                  <div
                    key={doc.id}
                    className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                  >
                    {/* Doc Header */}
                    <button
                      onClick={() => setExpandedDoc(isExpanded ? null : doc.id)}
                      className="w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                    >
                      <div className={`${config.bg} p-2 rounded-lg flex-shrink-0`}>
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {doc.title}
                          </h4>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${config.bg} ${config.color}`}>
                            {config.label}
                          </span>
                          {doc.tags.length > 0 && (
                            <div className="flex gap-1">
                              {doc.tags.slice(0, 3).map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                              {doc.tags.length > 3 && (
                                <span className="px-2 py-0.5 text-xs text-gray-500">
                                  +{doc.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{doc.author}</span>
                          <span>•</span>
                          <span>{new Date(doc.created_at).toLocaleString()}</span>
                          {doc.version_number > 1 && (
                            <>
                              <span>•</span>
                              <span>v{doc.version_number}</span>
                            </>
                          )}
                        </div>
                        {!isExpanded && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                            {doc.content}
                          </p>
                        )}
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                        {/* Action buttons */}
                        {(canEdit || canDelete) && (
                          <div className="flex gap-2 mb-4">
                            {canEdit && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenForm(doc);
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 rounded transition-colors"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                                Edit
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(doc.id);
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 rounded transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </button>
                            )}
                          </div>
                        )}

                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {doc.content}
                          </p>
                        </div>

                        {/* Links */}
                        {doc.links.length > 0 && (
                          <div className="mt-4">
                            <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              Links
                            </h5>
                            <div className="space-y-1">
                              {doc.links.map((link, idx) => (
                                <a
                                  key={idx}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  {link.title || link.url}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Related Stories */}
                        {doc.related_stories.length > 0 && (
                          <div className="mt-4">
                            <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              Related Stories
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {doc.related_stories.map((sid) => (
                                <span
                                  key={sid}
                                  className="px-2 py-1 text-xs font-mono bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded"
                                >
                                  #{sid}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredDocs.length} {filteredDocs.length === 1 ? 'entry' : 'entries'}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
            {/* Form Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {editingDoc ? 'Edit Documentation' : 'Add Documentation'}
              </h3>
              <button
                onClick={handleCloseForm}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Doc Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={formData.doc_type}
                  onChange={(e) => setFormData({ ...formData, doc_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(DOC_TYPE_ICONS).map(([type, config]) => (
                    <option key={type} value={type}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter title..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter documentation content..."
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="api, backend, completed"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Category and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">General</option>
                    <option value="implementation">Implementation</option>
                    <option value="architecture">Architecture</option>
                    <option value="deployment">Deployment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Form Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
              <button
                onClick={handleCloseForm}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.title || !formData.content}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {editingDoc ? 'Update' : 'Create'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
