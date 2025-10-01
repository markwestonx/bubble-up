import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ListTodo,
  ChevronUp,
  ChevronDown,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  Filter,
  GripVertical,
  Plus,
  Save,
  X,
  Archive,
  Star
} from 'lucide-react';

// Epic/Phase type
type Epic = 'foundation' | 'agents' | 'fanatical' | 'integration' | 'infrastructure' | 'production' | 'content' | 'social' | 'crm' | 'analytics' | 'architecture';

// Priority levels
type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

// Status types
type Status = 'NOT_STARTED' | 'IN_PROGRESS' | 'BLOCKED' | 'TESTING' | 'DONE' | 'CLOSED';

// Backlog item interface
interface BacklogItem {
  id: string;
  epic: Epic;
  priority: Priority;
  status: Status;
  userStory: string;
  acceptanceCriteria: string[];
  effort: number; // Story points (1-13 Fibonacci)
  businessValue: number; // 1-10 scale
  dependencies: string[];
  technicalNotes: string;
  owner: string;
  isNext: boolean; // Star flag for "next up" prioritization
}

interface SortableRowProps {
  item: BacklogItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  getPriorityColor: (priority: Priority) => string;
  getStatusColor: (status: Status) => string;
  getStatusIcon: (status: Status) => JSX.Element;
  getEpicLabel: (epic: Epic) => string;
  onUpdate: (id: string, updates: Partial<BacklogItem>) => void;
}

function SortableRow({
  item,
  isExpanded,
  onToggleExpand,
  getPriorityColor,
  getStatusColor,
  getStatusIcon,
  getEpicLabel,
  onUpdate
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const [isEditingStory, setIsEditingStory] = useState(false);
  const [editedStory, setEditedStory] = useState(item.userStory);
  const [editingCriteria, setEditingCriteria] = useState<number | null>(null);
  const [editingTechNotes, setEditingTechNotes] = useState(false);
  const [editingDeps, setEditingDeps] = useState(false);
  const [editingOwner, setEditingOwner] = useState(false);
  const [editingEpic, setEditingEpic] = useState(false);
  const [editingPriority, setEditingPriority] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const [editingEffort, setEditingEffort] = useState(false);
  const [editingBusinessValue, setEditingBusinessValue] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleStoryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingStory(true);
  };

  const handleStoryBlur = () => {
    setIsEditingStory(false);
    if (editedStory !== item.userStory) {
      onUpdate(item.id, { userStory: editedStory });
    }
  };

  const handleStoryKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleStoryBlur();
    }
    if (e.key === 'Escape') {
      setEditedStory(item.userStory);
      setIsEditingStory(false);
    }
  };

  return (
    <>
      <tr
        ref={setNodeRef}
        style={style}
        className="hover:bg-gray-50 cursor-pointer transition-colors"
      >
        <td className="px-4 py-4 whitespace-nowrap">
          <div className="flex items-center space-x-2">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing touch-none"
            >
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
            <button onClick={onToggleExpand}>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
        </td>
        <td
          className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-900"
          onClick={onToggleExpand}
        >
          {item.id}
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
          {editingEpic ? (
            <select
              value={item.epic}
              onChange={(e) => {
                onUpdate(item.id, { epic: e.target.value as Epic });
                setEditingEpic(false);
              }}
              onBlur={() => setEditingEpic(false)}
              autoFocus
              className="px-2 py-1 text-xs font-medium border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="foundation">Foundation</option>
              <option value="integration">API Integration</option>
              <option value="agents">Agent Development</option>
              <option value="fanatical">Fanatical Prospecting</option>
              <option value="infrastructure">Infrastructure</option>
              <option value="architecture">Architecture & Design</option>
              <option value="content">Content Generation</option>
              <option value="social">Social Media</option>
              <option value="crm">CRM & Pipeline</option>
              <option value="analytics">Analytics & Insights</option>
              <option value="production">Production</option>
            </select>
          ) : (
            <span
              onClick={() => setEditingEpic(true)}
              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
            >
              {getEpicLabel(item.epic)}
            </span>
          )}
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
          {editingPriority ? (
            <select
              value={item.priority}
              onChange={(e) => {
                onUpdate(item.id, { priority: e.target.value as Priority });
                setEditingPriority(false);
              }}
              onBlur={() => setEditingPriority(false)}
              autoFocus
              className={`px-2 py-1 text-xs font-medium border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${getPriorityColor(item.priority)}`}
            >
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          ) : (
            <span
              onClick={() => setEditingPriority(true)}
              className={`inline-flex items-center px-2 py-1 rounded border text-xs font-medium cursor-pointer hover:opacity-75 ${getPriorityColor(item.priority)}`}
            >
              {item.priority}
            </span>
          )}
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
          {editingStatus ? (
            <select
              value={item.status}
              onChange={(e) => {
                onUpdate(item.id, { status: e.target.value as Status });
                setEditingStatus(false);
              }}
              onBlur={() => setEditingStatus(false)}
              autoFocus
              className={`px-2 py-1 text-xs font-medium rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(item.status)}`}
            >
              <option value="NOT_STARTED">NOT STARTED</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="TESTING">TESTING</option>
              <option value="BLOCKED">BLOCKED</option>
              <option value="DONE">DONE</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          ) : (
            <span
              onClick={() => setEditingStatus(true)}
              className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium cursor-pointer hover:opacity-75 ${getStatusColor(item.status)}`}
            >
              {getStatusIcon(item.status)}
              <span className="ml-1">{item.status.replace('_', ' ')}</span>
            </span>
          )}
        </td>
        <td className="px-4 py-4 text-sm text-gray-900">
          {isEditingStory ? (
            <input
              type="text"
              value={editedStory}
              onChange={(e) => setEditedStory(e.target.value)}
              onBlur={handleStoryBlur}
              onKeyDown={handleStoryKeyDown}
              autoFocus
              className="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <div
              onClick={handleStoryClick}
              className="cursor-text hover:bg-gray-100 px-2 py-1 rounded"
            >
              {item.userStory}
            </div>
          )}
        </td>
        <td className="px-2 py-4 whitespace-nowrap text-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdate(item.id, { isNext: !item.isNext });
            }}
            className="inline-flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded transition-colors"
            title={item.isNext ? "Remove from Next Up" : "Mark as Next Up"}
          >
            <Star
              className={`h-5 w-5 ${item.isNext ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
            />
          </button>
        </td>
        <td className="px-4 py-4 whitespace-nowrap text-center" onClick={onToggleExpand}>
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-800 text-sm font-medium">
            {item.effort}
          </span>
        </td>
        <td className="px-4 py-4 whitespace-nowrap text-center" onClick={onToggleExpand}>
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800 text-sm font-medium">
            {item.businessValue}
          </span>
        </td>
      </tr>

      {isExpanded && (
        <tr className="bg-gray-50">
          <td colSpan={9} className="px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Acceptance Criteria</h4>
                <ul className="space-y-2">
                  {item.acceptanceCriteria.map((criteria, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                      {editingCriteria === idx ? (
                        <input
                          type="text"
                          value={criteria}
                          onChange={(e) => {
                            const newCriteria = [...item.acceptanceCriteria];
                            newCriteria[idx] = e.target.value;
                            onUpdate(item.id, { acceptanceCriteria: newCriteria });
                          }}
                          onBlur={() => setEditingCriteria(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') setEditingCriteria(null);
                            if (e.key === 'Escape') setEditingCriteria(null);
                          }}
                          autoFocus
                          className="flex-1 px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div
                          onClick={() => setEditingCriteria(idx)}
                          className="flex-1 cursor-text hover:bg-gray-100 px-2 py-1 rounded"
                        >
                          {criteria}
                        </div>
                      )}
                    </li>
                  ))}
                  <li>
                    <button
                      onClick={() => {
                        const newCriteria = [...item.acceptanceCriteria, ''];
                        onUpdate(item.id, { acceptanceCriteria: newCriteria });
                        setEditingCriteria(newCriteria.length - 1);
                      }}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-800 mt-1"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add acceptance criteria
                    </button>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Technical Notes</h4>
                  {editingTechNotes ? (
                    <textarea
                      value={item.technicalNotes}
                      onChange={(e) => onUpdate(item.id, { technicalNotes: e.target.value })}
                      onBlur={() => setEditingTechNotes(false)}
                      autoFocus
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div
                      onClick={() => setEditingTechNotes(true)}
                      className="cursor-text hover:bg-gray-100 px-3 py-2 text-sm rounded min-h-[4rem] whitespace-pre-wrap"
                    >
                      {item.technicalNotes}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Dependencies</h4>
                  {editingDeps ? (
                    <input
                      type="text"
                      value={item.dependencies.join(', ')}
                      onChange={(e) => {
                        const deps = e.target.value.split(',').map(d => d.trim()).filter(d => d);
                        onUpdate(item.id, { dependencies: deps });
                      }}
                      onBlur={() => setEditingDeps(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setEditingDeps(false);
                        if (e.key === 'Escape') setEditingDeps(false);
                      }}
                      autoFocus
                      placeholder="Comma-separated IDs (e.g., 001, 015, 027)"
                      className="w-full px-3 py-2 text-sm font-mono border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div
                      onClick={() => setEditingDeps(true)}
                      className="cursor-text hover:bg-gray-100 px-3 py-2 text-sm font-mono rounded"
                    >
                      {item.dependencies.length > 0 ? item.dependencies.join(', ') : 'No dependencies - click to add'}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Owner</h4>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                    {editingOwner ? (
                      <input
                        type="text"
                        value={item.owner}
                        onChange={(e) => onUpdate(item.id, { owner: e.target.value })}
                        onBlur={() => setEditingOwner(false)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') setEditingOwner(false);
                          if (e.key === 'Escape') setEditingOwner(false);
                        }}
                        autoFocus
                        className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div
                        onClick={() => setEditingOwner(true)}
                        className="flex-1 cursor-text hover:bg-gray-100 px-2 py-1 text-sm rounded"
                      >
                        {item.owner}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Effort</h4>
                  {editingEffort ? (
                    <input
                      type="number"
                      min="1"
                      max="13"
                      value={item.effort}
                      onChange={(e) => onUpdate(item.id, { effort: parseInt(e.target.value) || 1 })}
                      onBlur={() => setEditingEffort(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setEditingEffort(false);
                        if (e.key === 'Escape') setEditingEffort(false);
                      }}
                      autoFocus
                      className="w-20 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                    />
                  ) : (
                    <div
                      onClick={() => setEditingEffort(true)}
                      className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-800 text-lg font-medium cursor-pointer hover:bg-purple-200"
                    >
                      {item.effort}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Story points (1-13)</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Business Value</h4>
                  {editingBusinessValue ? (
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={item.businessValue}
                      onChange={(e) => onUpdate(item.id, { businessValue: parseInt(e.target.value) || 1 })}
                      onBlur={() => setEditingBusinessValue(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setEditingBusinessValue(false);
                        if (e.key === 'Escape') setEditingBusinessValue(false);
                      }}
                      autoFocus
                      className="w-20 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                    />
                  ) : (
                    <div
                      onClick={() => setEditingBusinessValue(true)}
                      className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-800 text-lg font-medium cursor-pointer hover:bg-green-200"
                    >
                      {item.businessValue}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Value rating (1-10)</p>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export function BacklogPage() {
  const initialBacklogItems: BacklogItem[] = [
    // CRITICAL FOUNDATION ITEMS
    {
      id: '001',
      epic: 'foundation',
      priority: 'CRITICAL',
      status: 'DONE',
      userStory: 'As a developer, I need a working SQLite database so that agents can persist prospect data',
      acceptanceCriteria: [
        'SQLite database file created',
        'Schema with prospects, campaigns, messages tables',
        'Database connection working from both Python and Node.js',
        'Sample data inserted successfully'
      ],
      effort: 2,
      businessValue: 10,
      dependencies: [],
      technicalNotes: 'Using better-sqlite3 for Node.js and aiosqlite for Python',
      owner: 'Development'
    },
    {
      id: '002',
      epic: 'foundation',
      priority: 'CRITICAL',
      status: 'DONE',
      userStory: 'As a developer, I need Python 3.13.7 environment with LangChain so that I can build AI agents',
      acceptanceCriteria: [
        'Python 3.13.7 installed',
        'LangChain, FastAPI, aiosqlite dependencies installed',
        'Virtual environment configured',
        'Test script runs successfully'
      ],
      effort: 1,
      businessValue: 10,
      dependencies: [],
      technicalNotes: 'Avoid Python 3.14 beta - causes package compilation issues',
      owner: 'Development'
    },
    {
      id: '003',
      epic: 'foundation',
      priority: 'CRITICAL',
      status: 'DONE',
      userStory: 'As a system, I need Lead Discovery Agent running on port 8001 so that I can discover prospects',
      acceptanceCriteria: [
        'FastAPI server starts on port 8001',
        '/health endpoint responds',
        'Database connection established',
        'LinkedIn CSV import endpoint functional'
      ],
      effort: 3,
      businessValue: 10,
      dependencies: ['001', '002'],
      technicalNotes: 'FastAPI + async/await patterns for high concurrency',
      owner: 'Development'
    },
    {
      id: '004',
      epic: 'foundation',
      priority: 'CRITICAL',
      status: 'DONE',
      userStory: 'As a system, I need Outreach Agent running on port 8002 so that I can send emails',
      acceptanceCriteria: [
        'FastAPI server starts on port 8002',
        '/health endpoint responds',
        'Database connection established',
        'Email template engine functional'
      ],
      effort: 3,
      businessValue: 10,
      dependencies: ['001', '002'],
      technicalNotes: 'Jinja2 templates for email personalization',
      owner: 'Development'
    },
    {
      id: '005',
      epic: 'integration',
      priority: 'CRITICAL',
      status: 'BLOCKED',
      userStory: 'As Lead Discovery Agent, I need Companies House API key so that I can discover UK prospects',
      acceptanceCriteria: [
        'API key obtained from Companies House',
        'API integration tested',
        'Can search for companies by industry',
        'Can fetch company details and officers'
      ],
      effort: 2,
      businessValue: 9,
      dependencies: ['003'],
      technicalNotes: 'Free API with rate limits - implement caching',
      owner: 'Development'
    },
    {
      id: '006',
      epic: 'integration',
      priority: 'CRITICAL',
      status: 'BLOCKED',
      userStory: 'As Outreach Agent, I need SMTP credentials so that I can send emails to prospects',
      acceptanceCriteria: [
        'SMTP server configured (Gmail/SendGrid)',
        'Can send test emails',
        'Email authentication (SPF/DKIM) configured',
        'Delivery tracking enabled'
      ],
      effort: 2,
      businessValue: 9,
      dependencies: ['004'],
      technicalNotes: 'Gmail app passwords or SendGrid API - ensure deliverability',
      owner: 'Development'
    },

    // INFRASTRUCTURE EPIC
    {
      id: '007',
      epic: 'infrastructure',
      priority: 'MEDIUM',
      status: 'NOT_STARTED',
      userStory: 'As a DevOps engineer, I need Docker Compose configuration so that I can deploy the full stack easily',
      acceptanceCriteria: [
        'docker-compose.yml defines all 7 services',
        'Ollama (11434), PostgreSQL (5432), Redis (6379) configured',
        'API (3001), Agents (8001/8002), Dashboard (3002) configured',
        'Volumes for data persistence',
        'Health checks for all services',
        'Single command deployment works'
      ],
      effort: 5,
      businessValue: 7,
      dependencies: [],
      technicalNotes: 'Already exists - needs updating for SQLite option and current ports (3002 for dashboard)',
      owner: 'DevOps'
    },
    {
      id: '008',
      epic: 'infrastructure',
      priority: 'HIGH',
      status: 'NOT_STARTED',
      userStory: 'As a developer, I need environment variable management so that configuration is secure and flexible',
      acceptanceCriteria: [
        '.env.example template created',
        'All API keys documented',
        'Database URLs configurable',
        'Port configurations flexible',
        'Secrets not committed to git'
      ],
      effort: 2,
      businessValue: 8,
      dependencies: [],
      technicalNotes: 'Support both SQLite (dev) and PostgreSQL (prod) via env vars',
      owner: 'Development'
    },
    {
      id: '009',
      epic: 'infrastructure',
      priority: 'MEDIUM',
      status: 'NOT_STARTED',
      userStory: 'As a system administrator, I need logging and monitoring so that I can troubleshoot issues',
      acceptanceCriteria: [
        'Winston logging configured in Node.js',
        'Python logging with structured output',
        'Log levels configurable (DEBUG, INFO, WARN, ERROR)',
        'Logs persisted to files',
        'Error tracking with stack traces'
      ],
      effort: 3,
      businessValue: 6,
      dependencies: [],
      technicalNotes: 'Winston for Node, structlog for Python, consider ELK stack for production',
      owner: 'Development'
    },
    {
      id: '010',
      epic: 'infrastructure',
      priority: 'LOW',
      status: 'NOT_STARTED',
      userStory: 'As a team, I need CI/CD pipeline so that deployments are automated and reliable',
      acceptanceCriteria: [
        'GitHub Actions workflow configured',
        'Automated tests run on PR',
        'Docker images built and pushed',
        'Deployment to staging automated',
        'Production deployment requires approval'
      ],
      effort: 8,
      businessValue: 5,
      dependencies: ['007', '013'],
      technicalNotes: 'GitHub Actions + Azure Container Registry + Azure Container Apps',
      owner: 'DevOps'
    },
    {
      id: '011',
      epic: 'infrastructure',
      priority: 'MEDIUM',
      status: 'NOT_STARTED',
      userStory: 'As a system, I need health check endpoints so that monitoring can detect failures',
      acceptanceCriteria: [
        '/health endpoints on all services',
        '/health/ready for readiness checks',
        '/health/live for liveness checks',
        'Database connectivity checked',
        'Dependency health included'
      ],
      effort: 3,
      businessValue: 7,
      dependencies: ['003', '004'],
      technicalNotes: 'Already partially implemented - standardize across all services',
      owner: 'Development'
    },
    {
      id: '012',
      epic: 'infrastructure',
      priority: 'LOW',
      status: 'NOT_STARTED',
      userStory: 'As a DevOps engineer, I need database backup strategy so that data is never lost',
      acceptanceCriteria: [
        'Automated daily backups',
        'Backup retention policy (30 days)',
        'Backup restoration tested',
        'Point-in-time recovery capability',
        'Backup monitoring and alerts'
      ],
      effort: 5,
      businessValue: 6,
      dependencies: ['001'],
      technicalNotes: 'SQLite: .backup command, PostgreSQL: pg_dump, Azure Backup for production',
      owner: 'DevOps'
    },
    {
      id: '013',
      epic: 'infrastructure',
      priority: 'MEDIUM',
      status: 'NOT_STARTED',
      userStory: 'As a developer, I need automated testing infrastructure so that code quality is maintained',
      acceptanceCriteria: [
        'Jest configured for Node.js',
        'Pytest configured for Python',
        'Playwright for E2E tests',
        'Test coverage reporting',
        'Tests run in CI pipeline'
      ],
      effort: 5,
      businessValue: 7,
      dependencies: [],
      technicalNotes: 'Test files already exist in tests/ directory - need full integration',
      owner: 'Development'
    },
    {
      id: '014',
      epic: 'infrastructure',
      priority: 'LOW',
      status: 'NOT_STARTED',
      userStory: 'As a product owner, I need staging environment so that features can be tested before production',
      acceptanceCriteria: [
        'Staging environment deployed',
        'Separate database from production',
        'Same configuration as production',
        'Accessible to team for testing',
        'Data seeding scripts available'
      ],
      effort: 8,
      businessValue: 5,
      dependencies: ['007', '010'],
      technicalNotes: 'Azure Container Apps with staging slot, or separate resource group',
      owner: 'DevOps'
    },

    // HIGH PRIORITY AGENT DEVELOPMENT
    {
      id: '015',
      epic: 'agents',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      userStory: 'As a user, I need LinkedIn Sales Navigator CSV import so that I can bulk import prospects',
      acceptanceCriteria: [
        'Upload CSV endpoint functional',
        'Parse LinkedIn export format',
        'Validate and clean prospect data',
        'Store in database with qualification scores'
      ],
      effort: 5,
      businessValue: 9,
      dependencies: ['003'],
      technicalNotes: 'ToS-compliant approach - manual exports only',
      owner: 'Development'
    },
    {
      id: '016',
      epic: 'agents',
      priority: 'HIGH',
      status: 'NOT_STARTED',
      userStory: 'As Outreach Agent, I need AI email personalization so that emails feel human-written',
      acceptanceCriteria: [
        'LangChain integration for email generation',
        'Prospect data used for personalization',
        'Multiple template variations',
        '>80% human-like quality score'
      ],
      effort: 8,
      businessValue: 9,
      dependencies: ['004', '006'],
      technicalNotes: 'Use Ollama Mistral or OpenAI GPT-4',
      owner: 'Development'
    },
    {
      id: '017',
      epic: 'integration',
      priority: 'HIGH',
      status: 'NOT_STARTED',
      userStory: 'As Lead Discovery Agent, I need Apollo.io integration so that I can find prospect emails',
      acceptanceCriteria: [
        'Apollo.io API integrated',
        'Can enrich company data',
        'Can find contact emails',
        'Handles rate limits gracefully'
      ],
      effort: 5,
      businessValue: 8,
      dependencies: ['003', '015'],
      technicalNotes: 'Free tier available - 50 credits/month',
      owner: 'Development'
    },
    {
      id: '018',
      epic: 'agents',
      priority: 'HIGH',
      status: 'NOT_STARTED',
      userStory: 'As a system, I need Fanatical Hunter Agent so that Lead Discovery never stops finding prospects',
      acceptanceCriteria: [
        'Extends Lead Discovery Agent with relentless mode',
        'Continuous trigger event monitoring',
        'Quality + quantity balanced approach',
        'Competitive account intelligence',
        'Never-stop hunting protocol'
      ],
      effort: 8,
      businessValue: 9,
      dependencies: ['015', '027'],
      technicalNotes: 'Enhanced Lead Discovery Agent with fanatical prospecting capabilities',
      owner: 'Development'
    },
    {
      id: '019',
      epic: 'agents',
      priority: 'HIGH',
      status: 'NOT_STARTED',
      userStory: 'As a system, I need Multi-Channel Assault Agent so that outreach uses optimal channel sequences',
      acceptanceCriteria: [
        'Extends Outreach Agent with multi-channel orchestration',
        'Email, LinkedIn, phone coordination',
        'Systematic interruption engine',
        'Message personalization at scale',
        'Objection anticipation in initial outreach'
      ],
      effort: 13,
      businessValue: 9,
      dependencies: ['016', '027'],
      technicalNotes: 'Enhanced Outreach Agent with multi-channel fanatical capabilities',
      owner: 'Development'
    },
    {
      id: '020',
      epic: 'agents',
      priority: 'MEDIUM',
      status: 'NOT_STARTED',
      userStory: 'As a social selling system, I need Social Dominance Agent so that I can execute LinkedIn 5 Cs at scale',
      acceptanceCriteria: [
        'Connection automation with personalized requests',
        'Content curation engine',
        'Engagement amplification (likes, shares, comments)',
        'Trigger event detection from social signals',
        'Relationship warming through consistent interactions'
      ],
      effort: 13,
      businessValue: 8,
      dependencies: ['027', '015'],
      technicalNotes: 'Five Cs: Connecting, Content Creation, Content Curation, Conversations, Converting',
      owner: 'Development'
    },

    // ARCHITECTURE & DESIGN GOVERNANCE
    {
      id: '021',
      epic: 'architecture',
      priority: 'HIGH',
      status: 'NOT_STARTED',
      userStory: 'As a team, I need centralized architecture documentation so that all design decisions are traceable',
      acceptanceCriteria: [
        'Create /architecture folder with standard structure',
        'System architecture diagrams (C4 model)',
        'Agent interaction flows documented',
        'Database schema documentation',
        'API contract specifications',
        'Technology stack rationale'
      ],
      effort: 5,
      businessValue: 7,
      dependencies: [],
      technicalNotes: 'Use Mermaid diagrams for version control, store in /architecture folder',
      owner: 'Architecture'
    },
    {
      id: '022',
      epic: 'architecture',
      priority: 'HIGH',
      status: 'NOT_STARTED',
      userStory: 'As a developer, I need Architecture Decision Records (ADRs) so that I understand why choices were made',
      acceptanceCriteria: [
        'ADR template created',
        'Key decisions documented (SQLite vs PostgreSQL, LangChain framework, etc)',
        'Consequences and trade-offs captured',
        'Alternative approaches considered',
        'Numbered and dated ADR files in /architecture/decisions'
      ],
      effort: 3,
      businessValue: 6,
      dependencies: ['021'],
      technicalNotes: 'Follow Michael Nygard ADR template format',
      owner: 'Architecture'
    },
    {
      id: '023',
      epic: 'architecture',
      priority: 'MEDIUM',
      status: 'NOT_STARTED',
      userStory: 'As a team, I need regular architecture reviews so that design stays aligned with requirements',
      acceptanceCriteria: [
        'Bi-weekly architecture review meetings',
        'Review checklist created',
        'Design patterns consistency checked',
        'Technical debt identified and tracked',
        'Review minutes documented'
      ],
      effort: 2,
      businessValue: 6,
      dependencies: ['021', '022'],
      technicalNotes: 'Lightweight process - focus on major decisions and technical debt',
      owner: 'Architecture'
    },
    {
      id: '024',
      epic: 'architecture',
      priority: 'MEDIUM',
      status: 'NOT_STARTED',
      userStory: 'As a team, I need API design standards so that all endpoints are consistent',
      acceptanceCriteria: [
        'REST API conventions documented',
        'Error response format standardized',
        'Authentication patterns defined',
        'Versioning strategy established',
        'OpenAPI specification template'
      ],
      effort: 3,
      businessValue: 7,
      dependencies: ['021'],
      technicalNotes: 'Follow REST best practices, use OpenAPI 3.0 for documentation',
      owner: 'Architecture'
    },
    {
      id: '025',
      epic: 'architecture',
      priority: 'LOW',
      status: 'NOT_STARTED',
      userStory: 'As a developer, I need agent design patterns so that all agents follow consistent architecture',
      acceptanceCriteria: [
        'Base agent class/interface defined',
        'LangChain integration patterns documented',
        'State management approach specified',
        'Error handling patterns established',
        'Testing strategy for agents defined'
      ],
      effort: 5,
      businessValue: 6,
      dependencies: ['021', '027'],
      technicalNotes: 'Define reusable patterns for agent development with LangChain/LangGraph',
      owner: 'Architecture'
    },
    {
      id: '026',
      epic: 'architecture',
      priority: 'LOW',
      status: 'NOT_STARTED',
      userStory: 'As a team, I need technical roadmap so that we align on priorities and sequencing',
      acceptanceCriteria: [
        'Quarterly roadmap with major milestones',
        'Dependencies between components mapped',
        'Resource allocation considered',
        'Risk mitigation strategies identified',
        'Roadmap reviewed and updated monthly'
      ],
      effort: 3,
      businessValue: 7,
      dependencies: ['021', '023'],
      technicalNotes: 'Visual roadmap in Mermaid or similar, linked to backlog',
      owner: 'Architecture'
    },

    // FANATICAL PROSPECTING AGENTS
    {
      id: '027',
      epic: 'fanatical',
      priority: 'HIGH',
      status: 'NOT_STARTED',
      userStory: 'As a system, I need Fanatical Orchestrator Agent so that I can coordinate all agents 24/7',
      acceptanceCriteria: [
        'LangGraph workflow orchestration',
        'Multi-agent coordination',
        '"One More Call" protocol implemented',
        '24/7 operational capability'
      ],
      effort: 13,
      businessValue: 10,
      dependencies: ['003', '004', '016'],
      technicalNotes: 'Core of fanatical prospecting methodology - runs on port 8000',
      owner: 'Development'
    },
    {
      id: '028',
      epic: 'fanatical',
      priority: 'HIGH',
      status: 'NOT_STARTED',
      userStory: 'As a system, I need Golden Hours Optimization Agent so that I can maximize response rates',
      acceptanceCriteria: [
        'Analyze prospect response patterns by time',
        'Identify optimal contact windows',
        'Prioritize activities during peak hours',
        'ML model for time prediction'
      ],
      effort: 8,
      businessValue: 8,
      dependencies: ['027'],
      technicalNotes: 'Use historical response data to train model',
      owner: 'Development'
    },
    {
      id: '029',
      epic: 'fanatical',
      priority: 'HIGH',
      status: 'NOT_STARTED',
      userStory: 'As a system, I need Rejection Intelligence Agent so that I can learn from every rejection',
      acceptanceCriteria: [
        'Track all rejection reasons',
        'Analyze rejection patterns',
        'Optimize follow-up timing',
        'Improve messaging based on learnings'
      ],
      effort: 8,
      businessValue: 7,
      dependencies: ['027', '016'],
      technicalNotes: 'Transforms rejection into learning fuel',
      owner: 'Development'
    },
    {
      id: '030',
      epic: 'fanatical',
      priority: 'MEDIUM',
      status: 'NOT_STARTED',
      userStory: 'As a system, I need Competitive Intelligence Agent so that I can outmaneuver competitors',
      acceptanceCriteria: [
        'Monitor competitor activities',
        'Generate battlecards',
        'Detect competitive threats',
        'Deploy counter-strategies'
      ],
      effort: 13,
      businessValue: 6,
      dependencies: ['027'],
      technicalNotes: 'Web scraping + news monitoring + CRM intelligence',
      owner: 'Development'
    },

    // CONTENT GENERATION EPIC
    {
      id: '031',
      epic: 'content',
      priority: 'HIGH',
      status: 'NOT_STARTED',
      userStory: 'As a marketer, I need AI content generation so that I can create engaging posts at scale',
      acceptanceCriteria: [
        'Content generation agent with CrewAI',
        'Market News Monitor for real-time analysis',
        'Data Analyst for trend identification',
        'Content Creator for multi-format output',
        'Quality Assurance agent for review'
      ],
      effort: 13,
      businessValue: 8,
      dependencies: ['027'],
      technicalNotes: 'Based on Archive/Content Creation system - 4 specialized agents working in pipeline',
      owner: 'Development'
    },
    {
      id: '032',
      epic: 'content',
      priority: 'MEDIUM',
      status: 'NOT_STARTED',
      userStory: 'As a content manager, I need blog post generation so that I can maintain consistent content',
      acceptanceCriteria: [
        'Automated blog post creation',
        'SEO optimization included',
        'Markdown formatting',
        'Image suggestions and integration',
        'Multiple draft variations'
      ],
      effort: 8,
      businessValue: 7,
      dependencies: ['031'],
      technicalNotes: 'Blog posts with integrated multimedia, proper headers and formatting',
      owner: 'Development'
    },
    {
      id: '033',
      epic: 'content',
      priority: 'HIGH',
      status: 'NOT_STARTED',
      userStory: 'As a social media manager, I need multi-platform post generation so that I can scale social presence',
      acceptanceCriteria: [
        'Platform-specific content (LinkedIn, Twitter, Instagram, Facebook)',
        'Character limit optimization',
        'Hashtag generation',
        'Image caption creation',
        'Posting schedule recommendations'
      ],
      effort: 8,
      businessValue: 9,
      dependencies: ['031'],
      technicalNotes: 'Multi-format content for different platforms with optimization',
      owner: 'Development'
    },
    {
      id: '034',
      epic: 'content',
      priority: 'MEDIUM',
      status: 'NOT_STARTED',
      userStory: 'As a content strategist, I need content calendar planning so that I can schedule posts strategically',
      acceptanceCriteria: [
        'AI-powered content calendar',
        'Optimal posting time recommendations',
        'Topic clustering and themes',
        'Content gap analysis',
        'Automated scheduling integration'
      ],
      effort: 5,
      businessValue: 6,
      dependencies: ['033'],
      technicalNotes: 'Integrates with social media scheduling tools',
      owner: 'Development'
    },
    {
      id: '035',
      epic: 'content',
      priority: 'LOW',
      status: 'NOT_STARTED',
      userStory: 'As a content creator, I need visual content suggestions so that posts have engaging imagery',
      acceptanceCriteria: [
        'AI image generation integration (DALL-E/Midjourney)',
        'Stock photo recommendations',
        'Infographic template generation',
        'Video script creation',
        'Visual brand consistency'
      ],
      effort: 8,
      businessValue: 5,
      dependencies: ['031'],
      technicalNotes: 'Integration with image generation APIs and stock photo services',
      owner: 'Development'
    },
    {
      id: '036',
      epic: 'content',
      priority: 'MEDIUM',
      status: 'NOT_STARTED',
      userStory: 'As a brand manager, I need content performance analytics so that I can optimize strategy',
      acceptanceCriteria: [
        'Content engagement metrics',
        'A/B testing results',
        'Audience sentiment analysis',
        'Topic performance tracking',
        'ROI measurement per content type'
      ],
      effort: 5,
      businessValue: 7,
      dependencies: ['033'],
      technicalNotes: 'Analytics dashboard with ML-based insights',
      owner: 'Development'
    },

    // SOCIAL MEDIA EPIC
    {
      id: '037',
      epic: 'social',
      priority: 'HIGH',
      status: 'NOT_STARTED',
      userStory: 'As a social media manager, I need LinkedIn posting automation so that I can maintain consistent presence',
      acceptanceCriteria: [
        'LinkedIn API integration for posting',
        'Automated post scheduling',
        'Image and video upload support',
        'Engagement tracking (likes, comments, shares)',
        'Analytics dashboard'
      ],
      effort: 8,
      businessValue: 9,
      dependencies: ['033'],
      technicalNotes: 'LinkedIn API v2 for company pages and personal profiles',
      owner: 'Development'
    },
    {
      id: '038',
      epic: 'social',
      priority: 'HIGH',
      status: 'NOT_STARTED',
      userStory: 'As a social media manager, I need Twitter/X posting automation so that I can scale thought leadership',
      acceptanceCriteria: [
        'Twitter API v2 integration',
        'Tweet scheduling and threading',
        'Media upload (images, videos, GIFs)',
        'Reply and engagement automation',
        'Trending topic monitoring'
      ],
      effort: 8,
      businessValue: 8,
      dependencies: ['033'],
      technicalNotes: 'Twitter API v2 with elevated access for automation',
      owner: 'Development'
    },
    {
      id: '039',
      epic: 'social',
      priority: 'MEDIUM',
      status: 'NOT_STARTED',
      userStory: 'As a social media manager, I need Instagram posting automation so that I can reach visual audiences',
      acceptanceCriteria: [
        'Instagram Graph API integration',
        'Photo and video post automation',
        'Stories scheduling',
        'Carousel posts support',
        'Hashtag optimization'
      ],
      effort: 8,
      businessValue: 7,
      dependencies: ['033'],
      technicalNotes: 'Instagram Graph API for business accounts only',
      owner: 'Development'
    },
    {
      id: '040',
      epic: 'social',
      priority: 'MEDIUM',
      status: 'NOT_STARTED',
      userStory: 'As a social media manager, I need Facebook posting automation so that I can manage pages efficiently',
      acceptanceCriteria: [
        'Facebook Graph API integration',
        'Page post scheduling',
        'Multiple page management',
        'Group posting capability',
        'Ad campaign integration'
      ],
      effort: 8,
      businessValue: 6,
      dependencies: ['033'],
      technicalNotes: 'Facebook Business API for page management',
      owner: 'Development'
    },
    {
      id: '041',
      epic: 'social',
      priority: 'MEDIUM',
      status: 'NOT_STARTED',
      userStory: 'As a marketer, I need Instagram DM automation so that I can do personalized B2C outreach',
      acceptanceCriteria: [
        'Instagram Messaging API integration',
        'DM template management',
        'Automated response flows',
        'Lead qualification via DM',
        'ToS-compliant rate limiting'
      ],
      effort: 8,
      businessValue: 7,
      dependencies: ['039', '031'],
      technicalNotes: 'Instagram Messaging API with business account requirements',
      owner: 'Development'
    },
    {
      id: '042',
      epic: 'social',
      priority: 'MEDIUM',
      status: 'NOT_STARTED',
      userStory: 'As a marketer, I need Facebook Messenger automation so that I can engage with community prospects',
      acceptanceCriteria: [
        'Facebook Messenger Platform integration',
        'Chatbot flow builder',
        'Lead capture and qualification',
        'CRM integration',
        'Multi-lingual support'
      ],
      effort: 8,
      businessValue: 6,
      dependencies: ['040', '031'],
      technicalNotes: 'Messenger Platform API with webhook integration',
      owner: 'Development'
    },
    {
      id: '043',
      epic: 'social',
      priority: 'LOW',
      status: 'NOT_STARTED',
      userStory: 'As a marketer, I need WhatsApp Business automation so that I can reach international prospects',
      acceptanceCriteria: [
        'WhatsApp Business API integration',
        'Message template management',
        'Automated follow-ups',
        'Multi-agent support',
        'Media message support'
      ],
      effort: 8,
      businessValue: 5,
      dependencies: ['031'],
      technicalNotes: 'WhatsApp Business API requires Facebook Business verification',
      owner: 'Development'
    },
    {
      id: '044',
      epic: 'social',
      priority: 'HIGH',
      status: 'NOT_STARTED',
      userStory: 'As a social media manager, I need unified social media dashboard so that I can manage all platforms',
      acceptanceCriteria: [
        'Single dashboard for all social platforms',
        'Cross-platform analytics',
        'Unified content calendar',
        'Engagement monitoring',
        'Team collaboration tools'
      ],
      effort: 13,
      businessValue: 9,
      dependencies: ['037', '038', '039', '040'],
      technicalNotes: 'Unified UI for LinkedIn, Twitter, Instagram, Facebook management',
      owner: 'Development'
    },
    {
      id: '045',
      epic: 'social',
      priority: 'MEDIUM',
      status: 'NOT_STARTED',
      userStory: 'As a marketer, I need social listening agent so that I can monitor brand mentions and trends',
      acceptanceCriteria: [
        'Real-time mention monitoring',
        'Sentiment analysis',
        'Competitor tracking',
        'Trending topic detection',
        'Automated alerts'
      ],
      effort: 13,
      businessValue: 7,
      dependencies: ['044'],
      technicalNotes: 'Streaming APIs from all platforms + NLP sentiment analysis',
      owner: 'Development'
    },
    {
      id: '046',
      epic: 'social',
      priority: 'LOW',
      status: 'NOT_STARTED',
      userStory: 'As a growth hacker, I need influencer outreach automation so that I can scale partnership opportunities',
      acceptanceCriteria: [
        'Influencer discovery and scoring',
        'Automated outreach campaigns',
        'Relationship tracking',
        'Performance analytics',
        'Contract management'
      ],
      effort: 13,
      businessValue: 6,
      dependencies: ['044', '031'],
      technicalNotes: 'Cross-platform influencer identification and engagement',
      owner: 'Development'
    },

    // CRM & PIPELINE MANAGEMENT EPIC
    {
      id: '047',
      epic: 'crm',
      priority: 'HIGH',
      status: 'NOT_STARTED',
      userStory: 'As a sales manager, I need CRM integration so that I can sync prospects with my existing CRM',
      acceptanceCriteria: [
        'Salesforce API integration',
        'HubSpot API integration',
        'Pipedrive API integration',
        'Bi-directional sync (prospects, contacts, deals)',
        'Custom field mapping'
      ],
      effort: 13,
      businessValue: 9,
      dependencies: ['003'],
      technicalNotes: 'REST APIs for major CRMs - OAuth authentication required',
      owner: 'Development'
    },
    {
      id: '048',
      epic: 'crm',
      priority: 'HIGH',
      status: 'NOT_STARTED',
      userStory: 'As a sales rep, I need pipeline management so that I can track deals through stages',
      acceptanceCriteria: [
        'Customizable pipeline stages',
        'Drag-and-drop deal movement',
        'Pipeline value calculations',
        'Stage conversion tracking',
        'Deal probability scoring'
      ],
      effort: 13,
      businessValue: 10,
      dependencies: [],
      technicalNotes: 'Kanban-style pipeline UI with drag-and-drop, stage automation',
      owner: 'Development'
    },
    {
      id: '049',
      epic: 'crm',
      priority: 'MEDIUM',
      status: 'NOT_STARTED',
      userStory: 'As a sales rep, I need meeting scheduling so that I can book meetings with prospects',
      acceptanceCriteria: [
        'Calendar integration (Google, Outlook)',
        'Availability checking',
        'Automated meeting links (Zoom, Teams, Meet)',
        'Email confirmations and reminders',
        'Time zone handling'
      ],
      effort: 8,
      businessValue: 8,
      dependencies: ['004'],
      technicalNotes: 'Google Calendar API, Microsoft Graph API for Outlook',
      owner: 'Development'
    },
    {
      id: '050',
      epic: 'crm',
      priority: 'MEDIUM',
      status: 'NOT_STARTED',
      userStory: 'As a sales manager, I need activity tracking so that I can see all prospect interactions',
      acceptanceCriteria: [
        'Email tracking (opens, clicks, replies)',
        'Call logging and recording',
        'Meeting notes and outcomes',
        'Task completion tracking',
        'Timeline view of all activities'
      ],
      effort: 8,
      businessValue: 7,
      dependencies: ['004'],
      technicalNotes: 'Activity logging system with timeline UI',
      owner: 'Development'
    },
    {
      id: '051',
      epic: 'crm',
      priority: 'HIGH',
      status: 'NOT_STARTED',
      userStory: 'As a sales rep, I need lead scoring so that I can prioritize high-value prospects',
      acceptanceCriteria: [
        'AI-powered lead scoring model',
        'Behavioral scoring (email opens, website visits)',
        'Firmographic scoring (company size, industry)',
        'Engagement scoring (response rate, meeting attendance)',
        'Score explanations and insights'
      ],
      effort: 13,
      businessValue: 9,
      dependencies: ['003', '015'],
      technicalNotes: 'ML model using historical conversion data + real-time signals',
      owner: 'Development'
    },
    {
      id: '052',
      epic: 'crm',
      priority: 'MEDIUM',
      status: 'NOT_STARTED',
      userStory: 'As a sales manager, I need team collaboration so that my team can work together on deals',
      acceptanceCriteria: [
        'Deal assignment and ownership',
        'Internal notes and comments',
        'Team activity feed',
        '@mentions and notifications',
        'Deal transfer workflow'
      ],
      effort: 8,
      businessValue: 6,
      dependencies: ['048'],
      technicalNotes: 'Team collaboration features with real-time updates',
      owner: 'Development'
    },

    // ANALYTICS & INSIGHTS EPIC
    {
      id: '053',
      epic: 'analytics',
      priority: 'HIGH',
      status: 'NOT_STARTED',
      userStory: 'As a sales manager, I need advanced analytics dashboard so that I can track team performance',
      acceptanceCriteria: [
        'Customizable dashboards',
        'Real-time metrics and KPIs',
        'Revenue forecasting',
        'Team leaderboards',
        'Goal tracking and progress'
      ],
      effort: 13,
      businessValue: 9,
      dependencies: ['048'],
      technicalNotes: 'Business intelligence dashboard with drill-down capabilities',
      owner: 'Development'
    },
    {
      id: '054',
      epic: 'analytics',
      priority: 'MEDIUM',
      status: 'NOT_STARTED',
      userStory: 'As a marketer, I need campaign attribution so that I can measure ROI by channel',
      acceptanceCriteria: [
        'Multi-touch attribution modeling',
        'Channel performance comparison',
        'Cost per lead/acquisition tracking',
        'Conversion funnel analysis',
        'ROI calculations by campaign'
      ],
      effort: 13,
      businessValue: 8,
      dependencies: ['053'],
      technicalNotes: 'Attribution engine with first-touch, last-touch, and multi-touch models',
      owner: 'Development'
    },
    {
      id: '055',
      epic: 'analytics',
      priority: 'MEDIUM',
      status: 'NOT_STARTED',
      userStory: 'As a sales manager, I need predictive analytics so that I can forecast pipeline health',
      acceptanceCriteria: [
        'AI-powered deal win probability',
        'Revenue forecasting with confidence intervals',
        'Churn risk prediction',
        'Pipeline coverage analysis',
        'What-if scenario modeling'
      ],
      effort: 13,
      businessValue: 8,
      dependencies: ['053', '051'],
      technicalNotes: 'ML models for probability and forecasting using historical data',
      owner: 'Development'
    },
    {
      id: '056',
      epic: 'analytics',
      priority: 'LOW',
      status: 'NOT_STARTED',
      userStory: 'As a sales ops leader, I need data export and reporting so that I can share insights with leadership',
      acceptanceCriteria: [
        'Scheduled report generation',
        'PDF and Excel export',
        'Email report distribution',
        'Custom report builder',
        'API access for external BI tools'
      ],
      effort: 5,
      businessValue: 6,
      dependencies: ['053'],
      technicalNotes: 'Report generation engine with scheduling and distribution',
      owner: 'Development'
    },

    // PRODUCTION & OPERATIONAL
    {
      id: '057',
      epic: 'production',
      priority: 'MEDIUM',
      status: 'NOT_STARTED',
      userStory: 'As a user, I need performance monitoring dashboard so that I can track agent activity',
      acceptanceCriteria: [
        'Real-time agent status',
        'Activity metrics displayed',
        'Campaign performance graphs',
        'Error tracking and alerts'
      ],
      effort: 8,
      businessValue: 6,
      dependencies: ['003', '004'],
      technicalNotes: 'Prometheus + Grafana or custom dashboard',
      owner: 'Development'
    },
    {
      id: '058',
      epic: 'production',
      priority: 'LOW',
      status: 'NOT_STARTED',
      userStory: 'As a system, I need rate limiting and security so that the API is protected',
      acceptanceCriteria: [
        'Rate limiting per IP/API key',
        'API key authentication',
        'Request validation',
        'SQL injection prevention',
        'CORS properly configured'
      ],
      effort: 5,
      businessValue: 7,
      dependencies: ['003'],
      technicalNotes: 'Express middleware for rate limiting, helmet.js for security headers',
      owner: 'Development'
    }
  ];

  const STORAGE_KEY = 'sales_genie_backlog';

  // Load backlog from localStorage or use initial items
  const [backlogItems, setBacklogItems] = useState<BacklogItem[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Failed to parse stored backlog:', error);
        return initialBacklogItems;
      }
    }
    return initialBacklogItems;
  });

  const [filter, setFilter] = useState<{
    epic: Epic | 'all';
    priority: Priority | 'all';
    status: Status | 'all';
  }>({
    epic: 'all',
    priority: 'all',
    status: 'all'
  });

  const [statusFilterMode, setStatusFilterMode] = useState<'single' | 'multiple'>('single');
  const [selectedStatuses, setSelectedStatuses] = useState<Set<Status>>(new Set());

  const [priorityFilterMode, setPriorityFilterMode] = useState<'single' | 'multiple'>('single');
  const [selectedPriorities, setSelectedPriorities] = useState<Set<Priority>>(new Set());

  const [epicFilterMode, setEpicFilterMode] = useState<'single' | 'multiple'>('single');
  const [selectedEpics, setSelectedEpics] = useState<Set<Epic>>(new Set());

  const [sortBy, setSortBy] = useState<'id' | 'epic' | 'priority' | 'status' | 'story' | 'next' | 'effort' | 'value'>('priority');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<string | null>(null);

  // Context menu filtering state
  const [contextMenu, setContextMenu] = useState<{
    column: 'id' | 'epic' | 'priority' | 'status' | 'story' | 'next' | 'effort' | 'value' | null;
    x: number;
    y: number;
    searchTerm: string;
    multiSelectMode: boolean;
    selectedValues: Set<string>;
  } | null>(null);
  const [contextMenuFilters, setContextMenuFilters] = useState<Array<{
    column: 'id' | 'epic' | 'priority' | 'status' | 'story' | 'next' | 'effort' | 'value';
    value: string;
    values: string[];
    isMultiple: boolean;
  }>>([]);

  // New story creation state
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newStory, setNewStory] = useState<BacklogItem>({
    id: '',
    epic: 'foundation',
    priority: 'MEDIUM',
    status: 'NOT_STARTED',
    userStory: '',
    acceptanceCriteria: [''],
    effort: 3,
    businessValue: 5,
    dependencies: [],
    technicalNotes: '',
    owner: ''
  });

  // Persist backlog to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(backlogItems));
  }, [backlogItems]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Close context menu on click outside
  React.useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  // Filter items
  const filteredItems = backlogItems.filter(item => {
    // Handle epic filtering based on mode
    if (epicFilterMode === 'single') {
      if (filter.epic !== 'all' && item.epic !== filter.epic) return false;
    } else {
      // Multiple mode: show items that match any selected epic
      if (selectedEpics.size > 0 && !selectedEpics.has(item.epic)) return false;
    }

    // Handle priority filtering based on mode
    if (priorityFilterMode === 'single') {
      if (filter.priority !== 'all' && item.priority !== filter.priority) return false;
    } else {
      // Multiple mode: show items that match any selected priority
      if (selectedPriorities.size > 0 && !selectedPriorities.has(item.priority)) return false;
    }

    // Handle status filtering based on mode
    if (statusFilterMode === 'single') {
      if (filter.status !== 'all' && item.status !== filter.status) return false;
    } else {
      // Multiple mode: show items that match any selected status
      if (selectedStatuses.size > 0 && !selectedStatuses.has(item.status)) return false;
    }

    // Handle context menu filters (type-ahead search or multi-select) - ALL must match
    for (const contextMenuFilter of contextMenuFilters) {
      const { column, value, values, isMultiple } = contextMenuFilter;

      if (values && values.length > 0) {
        // Single-select or Multi-select filter - item must match one of the selected values
        let itemValue = '';
        switch (column) {
          case 'id':
            itemValue = item.id;
            break;
          case 'epic':
            itemValue = item.epic;
            break;
          case 'priority':
            itemValue = item.priority;
            break;
          case 'status':
            itemValue = item.status;
            break;
          case 'story':
            itemValue = item.userStory;
            break;
          case 'next':
            itemValue = item.isNext ? 'Next' : 'Not Next';
            break;
          case 'effort':
            itemValue = item.effort.toString();
            break;
          case 'value':
            itemValue = item.businessValue.toString();
            break;
        }

        if (!values.includes(itemValue)) return false;
      } else if (value) {
        // Type-ahead search filter
        const searchTerm = value.toLowerCase();

        switch (column) {
          case 'id':
            if (!item.id.toLowerCase().startsWith(searchTerm)) return false;
            break;
          case 'epic':
            if (!item.epic.toLowerCase().includes(searchTerm)) return false;
            break;
          case 'priority':
            if (!item.priority.toLowerCase().includes(searchTerm)) return false;
            break;
          case 'status':
            if (!item.status.toLowerCase().replace('_', ' ').includes(searchTerm)) return false;
            break;
          case 'story':
            if (!item.userStory.toLowerCase().includes(searchTerm)) return false;
            break;
          case 'next':
            const nextValue = item.isNext ? 'next' : 'not next';
            if (!nextValue.includes(searchTerm)) return false;
            break;
          case 'effort':
            if (!item.effort.toString().includes(searchTerm)) return false;
            break;
          case 'value':
            if (!item.businessValue.toString().includes(searchTerm)) return false;
            break;
        }
      }
    }

    return true;
  });

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'id':
        comparison = a.id.localeCompare(b.id);
        break;
      case 'epic':
        comparison = a.epic.localeCompare(b.epic);
        break;
      case 'priority':
        const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      case 'status':
        const statusOrder = { NOT_STARTED: 0, IN_PROGRESS: 1, TESTING: 2, BLOCKED: 3, DONE: 4, CLOSED: 5 };
        comparison = statusOrder[a.status] - statusOrder[b.status];
        break;
      case 'story':
        comparison = a.userStory.localeCompare(b.userStory);
        break;
      case 'next':
        comparison = (a.isNext === b.isNext) ? 0 : (a.isNext ? -1 : 1);
        break;
      case 'effort':
        comparison = a.effort - b.effort;
        break;
      case 'value':
        comparison = a.businessValue - b.businessValue;
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = backlogItems.findIndex((item) => item.id === active.id);
      const newIndex = backlogItems.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(backlogItems, oldIndex, newIndex);
      setBacklogItems(newItems);
    }
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const updateItem = (id: string, updates: Partial<BacklogItem>) => {
    setBacklogItems(items =>
      items.map(item => item.id === id ? { ...item, ...updates } : item)
    );
  };

  const generateNewId = () => {
    const existingIds = backlogItems.map(item => parseInt(item.id)).filter(id => !isNaN(id));
    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
    return String(maxId + 1).padStart(3, '0');
  };

  const handleAddNewStory = () => {
    setIsAddingNew(true);
    setNewStory({
      id: generateNewId(),
      epic: 'foundation',
      priority: 'MEDIUM',
      status: 'NOT_STARTED',
      userStory: '',
      acceptanceCriteria: [''],
      effort: 3,
      businessValue: 5,
      dependencies: [],
      technicalNotes: '',
      owner: ''
    });
  };

  const handleSaveNewStory = () => {
    if (!newStory.userStory.trim()) {
      alert('Please enter a user story');
      return;
    }

    const storyToAdd = {
      ...newStory,
      acceptanceCriteria: newStory.acceptanceCriteria.filter(c => c.trim() !== '')
    };

    setBacklogItems([storyToAdd, ...backlogItems]);
    setIsAddingNew(false);
    setNewStory({
      id: '',
      epic: 'foundation',
      priority: 'MEDIUM',
      status: 'NOT_STARTED',
      userStory: '',
      acceptanceCriteria: [''],
      effort: 3,
      businessValue: 5,
      dependencies: [],
      technicalNotes: '',
      owner: ''
    });
  };

  const handleCancelNewStory = () => {
    setIsAddingNew(false);
    setNewStory({
      id: '',
      epic: 'foundation',
      priority: 'MEDIUM',
      status: 'NOT_STARTED',
      userStory: '',
      acceptanceCriteria: [''],
      effort: 3,
      businessValue: 5,
      dependencies: [],
      technicalNotes: '',
      owner: ''
    });
  };

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  // Handle right-click to open context menu filter
  const handleContextMenu = (
    e: React.MouseEvent,
    column: 'id' | 'epic' | 'priority' | 'status' | 'story' | 'next' | 'effort' | 'value'
  ) => {
    e.preventDefault();
    setContextMenu({
      column,
      x: e.clientX,
      y: e.clientY,
      searchTerm: '',
      multiSelectMode: false,
      selectedValues: new Set()
    });
  };

  // Get available options for dropdown based on column
  const getColumnOptions = (column: 'id' | 'epic' | 'priority' | 'status' | 'story' | 'next' | 'effort' | 'value' | null): string[] => {
    if (!column) return [];

    // Special handling for 'next' column - always show both options
    if (column === 'next') {
      return ['Next', 'Not Next'];
    }

    const uniqueValues = new Set<string>();
    backlogItems.forEach(item => {
      switch (column) {
        case 'id':
          uniqueValues.add(item.id);
          break;
        case 'epic':
          uniqueValues.add(item.epic);
          break;
        case 'priority':
          uniqueValues.add(item.priority);
          break;
        case 'status':
          uniqueValues.add(item.status);
          break;
        case 'story':
          uniqueValues.add(item.userStory);
          break;
        case 'effort':
          uniqueValues.add(item.effort.toString());
          break;
        case 'value':
          uniqueValues.add(item.businessValue.toString());
          break;
      }
    });

    const values = Array.from(uniqueValues);

    // Custom sorting for epic - alphabetical by display name
    if (column === 'epic') {
      return values.sort((a, b) => {
        const labelA = getEpicLabel(a as Epic);
        const labelB = getEpicLabel(b as Epic);
        return labelA.localeCompare(labelB);
      });
    }

    // Custom sorting for priority and status to maintain logical order
    if (column === 'priority') {
      const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return values.sort((a, b) => priorityOrder[a as Priority] - priorityOrder[b as Priority]);
    }

    if (column === 'status') {
      const statusOrder = { NOT_STARTED: 0, IN_PROGRESS: 1, TESTING: 2, BLOCKED: 3, DONE: 4, CLOSED: 5 };
      return values.sort((a, b) => statusOrder[a as Status] - statusOrder[b as Status]);
    }

    // Numeric sorting for effort and value
    if (column === 'effort' || column === 'value') {
      return values.sort((a, b) => parseInt(a) - parseInt(b));
    }

    return values.sort();
  };

  // Handle typing in context menu filter
  const handleContextMenuSearch = (searchTerm: string) => {
    if (!contextMenu) return;
    setContextMenu({ ...contextMenu, searchTerm });
  };

  // Handle single select from dropdown
  const handleSingleSelect = (value: string) => {
    if (!contextMenu || !contextMenu.column) return;

    // Remove existing filter for this column and add new one
    const newFilters = [...contextMenuFilters.filter(f => f.column !== contextMenu.column)];
    newFilters.push({
      column: contextMenu.column,
      value,
      values: [value],
      isMultiple: false
    });
    console.log('Setting filters:', newFilters);
    setContextMenuFilters(newFilters);
    setContextMenu(null);
  };

  // Toggle multi-select mode
  const toggleMultiSelectMode = () => {
    if (!contextMenu) return;
    setContextMenu({
      ...contextMenu,
      multiSelectMode: !contextMenu.multiSelectMode,
      selectedValues: new Set()
    });
  };

  // Toggle value in multi-select
  const toggleMultiSelectValue = (value: string) => {
    if (!contextMenu) return;

    const newSelected = new Set(contextMenu.selectedValues);
    if (newSelected.has(value)) {
      newSelected.delete(value);
    } else {
      newSelected.add(value);
    }

    setContextMenu({ ...contextMenu, selectedValues: newSelected });
  };

  // Apply multi-select filter
  const applyMultiSelectFilter = () => {
    if (!contextMenu || !contextMenu.column || contextMenu.selectedValues.size === 0) return;

    // Remove existing filter for this column and add new one
    const newFilters = [...contextMenuFilters.filter(f => f.column !== contextMenu.column)];
    newFilters.push({
      column: contextMenu.column,
      value: '',
      values: Array.from(contextMenu.selectedValues),
      isMultiple: true
    });
    console.log('Applying multi-select filters:', newFilters);
    setContextMenuFilters(newFilters);
    setContextMenu(null);
  };

  // Clear specific context menu filter
  const clearContextMenuFilter = (column?: 'id' | 'epic' | 'priority' | 'status' | 'story' | 'next' | 'effort' | 'value') => {
    if (column) {
      // Clear specific column filter
      setContextMenuFilters(contextMenuFilters.filter(f => f.column !== column));
    } else {
      // Clear all filters
      setContextMenuFilters([]);
    }
    setContextMenu(null);
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-300';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'LOW': return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'DONE': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-slate-100 text-slate-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'TESTING': return 'bg-purple-100 text-purple-800';
      case 'BLOCKED': return 'bg-red-100 text-red-800';
      case 'NOT_STARTED': return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Status) => {
    switch (status) {
      case 'DONE': return <CheckCircle className="h-4 w-4" />;
      case 'CLOSED': return <Archive className="h-4 w-4" />;
      case 'IN_PROGRESS': return <Clock className="h-4 w-4" />;
      case 'BLOCKED': return <AlertCircle className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getEpicLabel = (epic: Epic) => {
    const labels = {
      foundation: 'Foundation',
      agents: 'Agent Development',
      fanatical: 'Fanatical Prospecting',
      integration: 'API Integration',
      infrastructure: 'Infrastructure',
      architecture: 'Architecture & Design',
      production: 'Production',
      content: 'Content Generation',
      social: 'Social Media',
      crm: 'CRM & Pipeline',
      analytics: 'Analytics & Insights'
    };
    return labels[epic] || epic;
  };

  // Format display value for context menu based on column type
  const formatDisplayValue = (column: 'id' | 'epic' | 'priority' | 'status' | 'story' | 'effort' | 'value' | null, value: string): string => {
    if (column === 'epic') {
      return getEpicLabel(value as Epic);
    }
    if (column === 'status') {
      return value.replace(/_/g, ' ');
    }
    return value;
  };

  // Calculate stats
  const stats = {
    total: backlogItems.length,
    complete: backlogItems.filter(i => i.status === 'DONE').length,
    inProgress: backlogItems.filter(i => i.status === 'IN_PROGRESS').length,
    blocked: backlogItems.filter(i => i.status === 'BLOCKED').length,
    totalEffort: backlogItems.reduce((sum, i) => sum + i.effort, 0),
    completedEffort: backlogItems.filter(i => i.status === 'DONE').reduce((sum, i) => sum + i.effort, 0)
  };

  return (
    <div className="space-y-6">
      {/* Context Menu Filter - Excel Style */}
      {contextMenu && (
        <div
          className={`fixed bg-white border border-gray-300 rounded-lg shadow-xl p-3 z-50 ${contextMenu.column === 'story' ? 'w-[600px]' : 'w-64'}`}
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-2 text-xs font-semibold text-gray-700">
            Filter by {contextMenu.column}
          </div>

          {/* Search Box */}
          <input
            type="text"
            autoFocus
            placeholder={contextMenu.column === 'story' ? "Type to search and press Enter..." : "Search..."}
            value={contextMenu.searchTerm}
            onChange={(e) => handleContextMenuSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && contextMenu.searchTerm.trim()) {
                // For User Story column, apply text search filter on Enter
                if (contextMenu.column === 'story') {
                  setContextMenuFilter({
                    column: 'story',
                    value: contextMenu.searchTerm.trim(),
                    values: [],
                    isMultiple: false
                  });
                  setContextMenu(null);
                }
              } else if (e.key === 'Escape') {
                setContextMenu(null);
              }
            }}
            className="w-full px-2 py-1 mb-2 text-sm border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />

          {/* Options List */}
          {!contextMenu.multiSelectMode ? (
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded mb-2">
              <div
                onClick={() => {
                  setContextMenuFilter(null);
                  setContextMenu(null);
                }}
                className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer border-b border-gray-100"
              >
                (All)
              </div>
              {getColumnOptions(contextMenu.column)
                .filter(option => !contextMenu.searchTerm || formatDisplayValue(contextMenu.column, option).toLowerCase().includes(contextMenu.searchTerm.toLowerCase()))
                .map((option) => (
                  <div
                    key={option}
                    onClick={() => handleSingleSelect(option)}
                    className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    {formatDisplayValue(contextMenu.column, option)}
                  </div>
                ))}
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded mb-2">
              {getColumnOptions(contextMenu.column)
                .filter(option => !contextMenu.searchTerm || formatDisplayValue(contextMenu.column, option).toLowerCase().includes(contextMenu.searchTerm.toLowerCase()))
                .map((option) => (
                  <label
                    key={option}
                    className="flex items-center px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={contextMenu.selectedValues.has(option)}
                      onChange={() => toggleMultiSelectValue(option)}
                      className="mr-2 rounded border-gray-300"
                    />
                    {formatDisplayValue(contextMenu.column, option)}
                  </label>
                ))}
            </div>
          )}

          {/* Multi-Select Checkbox */}
          <label className="flex items-center mb-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={contextMenu.multiSelectMode}
              onChange={toggleMultiSelectMode}
              className="mr-2 rounded border-gray-300"
            />
            Select Multiple Items
          </label>

          {/* Action Buttons */}
          {contextMenu.multiSelectMode && (
            <div className="flex space-x-2">
              <button
                onClick={applyMultiSelectFilter}
                className="flex-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                OK
              </button>
              <button
                onClick={() => setContextMenu(null)}
                className="flex-1 px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Clear Filters */}
          {contextMenuFilters.length > 0 && (
            <div className="mt-2 space-y-1">
              <div className="text-xs font-semibold text-gray-600 mb-1">Active Filters:</div>
              {contextMenuFilters.map((filter, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs bg-gray-100 px-2 py-1 rounded">
                  <span>
                    <strong>{filter.column}:</strong> {filter.values.length === 1 ? filter.values[0] : `${filter.values.length} values`}
                  </span>
                  <button
                    onClick={() => clearContextMenuFilter(filter.column)}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => clearContextMenuFilter()}
                className="w-full mt-1 px-3 py-1.5 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <ListTodo className="h-7 w-7 mr-3 text-blue-600" />
            Project Backlog
          </h1>
          <p className="mt-1 text-gray-600 flex items-center flex-wrap">
            <span>Drag and drop to reorder</span>
            {(contextMenuFilters.length > 0 || selectedEpics.size > 0 || selectedPriorities.size > 0 || selectedStatuses.size > 0 || filter.epic !== 'all' || filter.priority !== 'all' || filter.status !== 'all') && (
              <>
                <span className="mx-1">•</span>
                <span>Filtered by: </span>
                {contextMenuFilters.length > 0 && contextMenuFilters.map((f, idx) => (
                  <span key={idx}>
                    {idx > 0 && ', '}
                    <strong>{f.column}</strong> ({f.values.length === 1 ? f.values[0] : `${f.values.length} values`})
                  </span>
                ))}
                {selectedEpics.size > 0 && (
                  <span>
                    {contextMenuFilters.length > 0 && ', '}
                    <strong>epic</strong> ({selectedEpics.size} selected)
                  </span>
                )}
                {filter.epic !== 'all' && epicFilterMode === 'single' && (
                  <span>
                    {(contextMenuFilters.length > 0 || selectedEpics.size > 0) && ', '}
                    <strong>epic</strong> ({getEpicLabel(filter.epic)})
                  </span>
                )}
                {selectedPriorities.size > 0 && (
                  <span>
                    {(contextMenuFilters.length > 0 || selectedEpics.size > 0 || filter.epic !== 'all') && ', '}
                    <strong>priority</strong> ({selectedPriorities.size} selected)
                  </span>
                )}
                {filter.priority !== 'all' && priorityFilterMode === 'single' && (
                  <span>
                    {(contextMenuFilters.length > 0 || selectedEpics.size > 0 || selectedPriorities.size > 0 || filter.epic !== 'all') && ', '}
                    <strong>priority</strong> ({filter.priority})
                  </span>
                )}
                {selectedStatuses.size > 0 && (
                  <span>
                    {(contextMenuFilters.length > 0 || selectedEpics.size > 0 || selectedPriorities.size > 0 || filter.epic !== 'all' || filter.priority !== 'all') && ', '}
                    <strong>status</strong> ({selectedStatuses.size} selected)
                  </span>
                )}
                {filter.status !== 'all' && statusFilterMode === 'single' && (
                  <span>
                    {(contextMenuFilters.length > 0 || selectedEpics.size > 0 || selectedPriorities.size > 0 || selectedStatuses.size > 0 || filter.epic !== 'all' || filter.priority !== 'all') && ', '}
                    <strong>status</strong> ({filter.status.replace('_', ' ')})
                  </span>
                )}
                <button
                  onClick={() => {
                    clearContextMenuFilter();
                    setSelectedEpics(new Set());
                    setSelectedPriorities(new Set());
                    setSelectedStatuses(new Set());
                    setFilter({ epic: 'all', priority: 'all', status: 'all' });
                  }}
                  className="ml-2 inline-flex items-center text-xs text-gray-500 hover:text-gray-700 transition-colors"
                  title="Clear all filters"
                >
                  <X className="h-3 w-3 mr-0.5" />
                  <span className="underline">Clear all</span>
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div
          onClick={() => {
            setFilter({ ...filter, status: 'all' });
            setStatusFilterMode('single');
          }}
          className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Stories</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <ListTodo className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div
          onClick={() => {
            setFilter({ ...filter, status: 'BLOCKED' });
            setStatusFilterMode('single');
          }}
          className="bg-white border border-red-200 rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-red-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Blocked</p>
              <p className="text-2xl font-bold text-red-600">{stats.blocked}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
        </div>

        <div
          onClick={() => {
            setFilter({ ...filter, status: 'DONE' });
            setStatusFilterMode('single');
          }}
          className="bg-white border border-green-200 rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-green-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Done</p>
              <p className="text-2xl font-bold text-green-600">{stats.complete}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div
          onClick={() => {
            setFilter({ ...filter, status: 'IN_PROGRESS' });
            setStatusFilterMode('single');
          }}
          className="bg-white border border-blue-200 rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Story Points</p>
              <p className="text-2xl font-bold text-purple-600">{stats.completedEffort}/{stats.totalEffort}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Backlog Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    <GripVertical className="h-4 w-4 text-gray-400 inline" /> Order
                  </th>
                  <th
                    onClick={() => handleSort('id')}
                    onContextMenu={(e) => handleContextMenu(e, 'id')}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <span className={contextMenuFilters.some(f => f.column === 'id') ? 'font-bold text-red-600' : ''}>ID</span>
                      {sortBy === 'id' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('epic')}
                    onContextMenu={(e) => handleContextMenu(e, 'epic')}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <span className={contextMenuFilters.some(f => f.column === 'epic') ? 'font-bold text-red-600' : ''}>Epic</span>
                      {sortBy === 'epic' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('priority')}
                    onContextMenu={(e) => handleContextMenu(e, 'priority')}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <span className={contextMenuFilters.some(f => f.column === 'priority') ? 'font-bold text-red-600' : ''}>Priority</span>
                      {sortBy === 'priority' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('status')}
                    onContextMenu={(e) => handleContextMenu(e, 'status')}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <span className={contextMenuFilters.some(f => f.column === 'status') ? 'font-bold text-red-600' : ''}>Status</span>
                      {sortBy === 'status' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('story')}
                    onContextMenu={(e) => handleContextMenu(e, 'story')}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <span className={contextMenuFilters.some(f => f.column === 'story') ? 'font-bold text-red-600' : ''}>User Story</span>
                      {sortBy === 'story' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('next')}
                    onContextMenu={(e) => handleContextMenu(e, 'next')}
                    className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center justify-center">
                      <span className={contextMenuFilters.some(f => f.column === 'next') ? 'font-bold text-red-600' : ''}>Next</span>
                      {sortBy === 'next' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('effort')}
                    onContextMenu={(e) => handleContextMenu(e, 'effort')}
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center justify-center">
                      <span className={contextMenuFilters.some(f => f.column === 'effort') ? 'font-bold text-red-600' : ''}>Effort</span>
                      {sortBy === 'effort' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('value')}
                    onContextMenu={(e) => handleContextMenu(e, 'value')}
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center justify-center">
                      <span className={contextMenuFilters.some(f => f.column === 'value') ? 'font-bold text-red-600' : ''}>Value</span>
                      {sortBy === 'value' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={handleAddNewStory}
                      className="inline-flex items-center px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Story
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isAddingNew && (
                  <tr className="bg-blue-50 border-2 border-blue-300">
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs text-gray-500">New</span>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={newStory.id}
                        onChange={(e) => setNewStory({ ...newStory, id: e.target.value })}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="ID"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={newStory.epic}
                        onChange={(e) => setNewStory({ ...newStory, epic: e.target.value as Epic })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="foundation">Foundation</option>
                        <option value="integration">Integration</option>
                        <option value="agents">Agents</option>
                        <option value="fanatical">Fanatical</option>
                        <option value="infrastructure">Infrastructure</option>
                        <option value="architecture">Architecture</option>
                        <option value="content">Content</option>
                        <option value="social">Social</option>
                        <option value="crm">CRM</option>
                        <option value="analytics">Analytics</option>
                        <option value="production">Production</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={newStory.priority}
                        onChange={(e) => setNewStory({ ...newStory, priority: e.target.value as Priority })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="CRITICAL">Critical</option>
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={newStory.status}
                        onChange={(e) => setNewStory({ ...newStory, status: e.target.value as Status })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="NOT_STARTED">Not Started</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="TESTING">Testing</option>
                        <option value="BLOCKED">Blocked</option>
                        <option value="DONE">Done</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={newStory.userStory}
                        onChange={(e) => setNewStory({ ...newStory, userStory: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="As a [role], I need [feature] so that [benefit]..."
                        autoFocus
                      />
                    </td>
                    <td className="px-2 py-3 text-center">
                      <button
                        onClick={() => setNewStory({ ...newStory, isNext: !newStory.isNext })}
                        className="inline-flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded transition-colors"
                        title={newStory.isNext ? "Remove from Next Up" : "Mark as Next Up"}
                      >
                        <Star
                          className={`h-5 w-5 ${newStory.isNext ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        min="1"
                        max="13"
                        value={newStory.effort}
                        onChange={(e) => setNewStory({ ...newStory, effort: parseInt(e.target.value) || 1 })}
                        className="w-12 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={newStory.businessValue}
                        onChange={(e) => setNewStory({ ...newStory, businessValue: parseInt(e.target.value) || 1 })}
                        className="w-12 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={handleSaveNewStory}
                          className="inline-flex items-center px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                          title="Save"
                        >
                          <Save className="h-3 w-3" />
                        </button>
                        <button
                          onClick={handleCancelNewStory}
                          className="inline-flex items-center px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                          title="Cancel"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
                <SortableContext items={sortedItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
                  {sortedItems.map((item) => (
                    <SortableRow
                      key={item.id}
                      item={item}
                      isExpanded={expandedItems.has(item.id)}
                      onToggleExpand={() => toggleExpand(item.id)}
                      getPriorityColor={getPriorityColor}
                      getStatusColor={getStatusColor}
                      getStatusIcon={getStatusIcon}
                      getEpicLabel={getEpicLabel}
                      onUpdate={updateItem}
                    />
                  ))}
                </SortableContext>
              </tbody>
            </table>
          </DndContext>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-900">Backlog Summary</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>Showing {sortedItems.length} of {backlogItems.length} stories. Progress: {((stats.completedEffort / stats.totalEffort) * 100).toFixed(1)}% complete by story points.</p>
              <p className="mt-1"><strong>New:</strong> Content Generation (6 stories) and Social Media (10 stories) epics added. Infrastructure epic (8 stories) covers DevOps needs.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}