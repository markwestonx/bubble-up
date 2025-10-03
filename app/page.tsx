'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
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
type Epic = 'foundation' | 'agents' | 'fanatical' | 'integration' | 'infrastructure' | 'production' | 'content' | 'social' | 'crm' | 'analytics' | 'architecture' | 'product' | 'deployment' | 'marketing' | 'purchase' | 'leadgen' | 'tracking' | 'cdp' | 'personalization' | 'orchestration' | 'compliance';

// Priority levels
type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

// Status types
type Status = 'NOT_STARTED' | 'IN_PROGRESS' | 'BLOCKED' | 'TESTING' | 'DONE' | 'CLOSED';

// Backlog item interface
interface BacklogItem {
  id: string;
  project: string;
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
  getStatusIcon: (status: Status) => React.ReactElement;
  getEpicLabel: (epic: Epic) => string;
  onUpdate: (id: string, updates: Partial<BacklogItem>) => void;
  availableEpics: Epic[];
  allItems: BacklogItem[];
}

function SortableRow({
  item,
  isExpanded,
  onToggleExpand,
  getPriorityColor,
  getStatusColor,
  getStatusIcon,
  getEpicLabel,
  onUpdate,
  availableEpics,
  allItems
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
            <div className="flex flex-col gap-1">
              <select
                value={item.epic}
                onChange={(e) => {
                  if (e.target.value === '__new__') {
                    // Switch to input mode for new epic
                    return;
                  }
                  onUpdate(item.id, { epic: e.target.value as Epic });
                  setEditingEpic(false);
                }}
                onBlur={(e) => {
                  // Don't close if clicking on input below
                  if (!e.relatedTarget?.id?.startsWith('new-epic-input')) {
                    setEditingEpic(false);
                  }
                }}
                autoFocus
                className="px-2 py-1 text-xs font-medium border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableEpics.map((epic) => (
                  <option key={epic} value={epic}>
                    {getEpicLabel(epic)}
                  </option>
                ))}
                <option value="__new__">+ Add New Epic</option>
              </select>
              <input
                id={`new-epic-input-${item.id}`}
                type="text"
                placeholder="Enter new epic name..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    // Capitalize first letter of each word, then convert to kebab-case
                    const newEpic = e.currentTarget.value.trim()
                      .split(/\s+/)
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                      .join('-');
                    onUpdate(item.id, { epic: newEpic as Epic });
                    setEditingEpic(false);
                  } else if (e.key === 'Escape') {
                    setEditingEpic(false);
                  }
                }}
                onBlur={() => setEditingEpic(false)}
                className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
                      className="cursor-text hover:bg-gray-100 px-3 py-2 text-sm font-mono rounded flex flex-wrap gap-2"
                    >
                      {item.dependencies.length > 0 ? (
                        item.dependencies.map((depId) => {
                          const depItem = allItems.find(i => i.id === depId);
                          return (
                            <span
                              key={depId}
                              className="relative group inline-block"
                            >
                              <span className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs font-mono">
                                {depId}
                              </span>
                              {depItem && (
                                <span className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded whitespace-nowrap z-10 shadow-lg">
                                  {depItem.userStory}
                                  <span className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-black"></span>
                                </span>
                              )}
                            </span>
                          );
                        })
                      ) : (
                        'No dependencies - click to add'
                      )}
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

function BacklogPage() {
  const initialBacklogItems: BacklogItem[] = [
    // CRITICAL FOUNDATION ITEMS
    {
      id: '001',
      project: 'Sales Genie',
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
      owner: 'Development',
      isNext: false
    },
    {
      id: '002',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },
    {
      id: '003',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },
    {
      id: '004',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },
    {
      id: '005',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },
    {
      id: '006',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },

    // INFRASTRUCTURE EPIC
    {
      id: '007',
      project: 'Sales Genie',
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
      owner: 'DevOps',
    isNext: false
    },
    {
      id: '008',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },
    {
      id: '009',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },
    {
      id: '010',
      project: 'Sales Genie',
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
      owner: 'DevOps',
    isNext: false
    },
    {
      id: '011',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },
    {
      id: '012',
      project: 'Sales Genie',
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
      owner: 'DevOps',
    isNext: false
    },
    {
      id: '013',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },
    {
      id: '014',
      project: 'Sales Genie',
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
      owner: 'DevOps',
    isNext: false
    },

    // HIGH PRIORITY AGENT DEVELOPMENT
    {
      id: '015',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },
    {
      id: '016',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },
    {
      id: '017',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },
    {
      id: '018',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },
    {
      id: '019',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },
    {
      id: '020',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },

    // ARCHITECTURE & DESIGN GOVERNANCE
    {
      id: '021',
      project: 'Sales Genie',
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
      owner: 'Architecture',
    isNext: false
    },
    {
      id: '022',
      project: 'Sales Genie',
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
      owner: 'Architecture',
    isNext: false
    },
    {
      id: '023',
      project: 'Sales Genie',
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
      owner: 'Architecture',
    isNext: false
    },
    {
      id: '024',
      project: 'Sales Genie',
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
      owner: 'Architecture',
    isNext: false
    },
    {
      id: '025',
      project: 'Sales Genie',
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
      owner: 'Architecture',
    isNext: false
    },
    {
      id: '026',
      project: 'Sales Genie',
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
      owner: 'Architecture',
    isNext: false
    },

    // FANATICAL PROSPECTING AGENTS
    {
      id: '027',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },
    {
      id: '028',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },
    {
      id: '029',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },
    {
      id: '030',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },

    // CONTENT GENERATION EPIC
    {
      id: '031',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },
    {
      id: '032',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },
    {
      id: '033',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },
    {
      id: '034',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },
    {
      id: '035',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },
    {
      id: '036',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },

    // SOCIAL MEDIA EPIC
    {
      id: '037',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },
    {
      id: '038',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },
    {
      id: '039',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },
    {
      id: '040',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },
    {
      id: '041',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },
    {
      id: '042',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },
    {
      id: '043',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },
    {
      id: '044',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },
    {
      id: '045',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },
    {
      id: '046',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },

    // CRM & PIPELINE MANAGEMENT EPIC
    {
      id: '047',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },
    {
      id: '048',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },
    {
      id: '049',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },
    {
      id: '050',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },
    {
      id: '051',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },
    {
      id: '052',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },

    // ANALYTICS & INSIGHTS EPIC
    {
      id: '053',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },
    {
      id: '054',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },
    {
      id: '055',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },
    {
      id: '056',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },

    // PRODUCTION & OPERATIONAL
    {
      id: '057',
      project: 'Sales Genie',
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
      owner: 'Development',
    isNext: false
    },
    {
      id: '058',
      project: 'Sales Genie',
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
      owner: 'Development',
      isNext: false
    },

    // GTM SPIKE PROJECT STORIES

    // EPIC: PRODUCT
    {
      id: '059',
      project: 'GTM Spike',
      epic: 'product',
      priority: 'HIGH',
      status: 'NOT_STARTED',
      userStory: 'As a product manager, I need to select the most marketable app (e.g., ISO27001) so that we can focus our GTM efforts',
      acceptanceCriteria: [
        'Research and identify most marketable app',
        'Document selection rationale',
        'Confirm with stakeholders'
      ],
      effort: 2,
      businessValue: 10,
      dependencies: [],
      technicalNotes: 'ISO27001 likely candidate due to broad regulatory appeal',
      owner: 'Product',
      isNext: false
    },
    {
      id: '060',
      project: 'GTM Spike',
      epic: 'product',
      priority: 'HIGH',
      status: 'NOT_STARTED',
      userStory: 'As a user, I need show/hide feature toggles so that I can customize what functionality is visible',
      acceptanceCriteria: [
        'Build feature flag system',
        'Add UI controls for show/hide',
        'Persist user preferences',
        'Test all feature combinations'
      ],
      effort: 5,
      businessValue: 8,
      dependencies: ['059'],
      technicalNotes: 'Use feature flag library or build simple toggle system',
      owner: 'Development',
      isNext: false
    },
    {
      id: '061',
      project: 'GTM Spike',
      epic: 'product',
      priority: 'CRITICAL',
      status: 'NOT_STARTED',
      userStory: 'As a prospect, I need clear calls to action (Buy now / Book a call) so that I can take next steps',
      acceptanceCriteria: [
        'Add "Buy now" CTA button',
        'Add "Book a call to discuss" CTA button',
        'Position CTAs prominently',
        'Ensure CTAs work on mobile',
        'Track CTA click events'
      ],
      effort: 3,
      businessValue: 10,
      dependencies: ['059'],
      technicalNotes: 'Link to payment flow and Calendly/booking system',
      owner: 'Development',
      isNext: false
    },
    {
      id: '062',
      project: 'GTM Spike',
      epic: 'product',
      priority: 'HIGH',
      status: 'NOT_STARTED',
      userStory: 'As a new user, I need a quick start help guide so that I can get up to speed quickly',
      acceptanceCriteria: [
        'Create getting started guide',
        'Add progressive disclosure of help',
        'Include video walkthrough',
        'Test with new users'
      ],
      effort: 5,
      businessValue: 8,
      dependencies: ['059'],
      technicalNotes: 'Interactive onboarding flow with tooltips',
      owner: 'Product',
      isNext: false
    },
    {
      id: '063',
      project: 'GTM Spike',
      epic: 'product',
      priority: 'HIGH',
      status: 'NOT_STARTED',
      userStory: 'As a user, I need tooltips throughout the UI so that the demo app is completely self-explanatory',
      acceptanceCriteria: [
        'Add tooltips to all UI elements',
        'Ensure tooltips are contextual',
        'Test tooltip accessibility',
        'Verify mobile tooltip behavior'
      ],
      effort: 8,
      businessValue: 9,
      dependencies: ['059'],
      technicalNotes: 'Use tooltip library like Tippy.js or Radix UI',
      owner: 'Development',
      isNext: false
    },
    {
      id: '064',
      project: 'GTM Spike',
      epic: 'product',
      priority: 'CRITICAL',
      status: 'NOT_STARTED',
      userStory: 'As a user, I need all buttons to be clickable and produce results so that the demo feels complete',
      acceptanceCriteria: [
        'Audit all buttons in demo',
        'Wire up all button actions',
        'Add loading/success states',
        'Test all interactions'
      ],
      effort: 8,
      businessValue: 10,
      dependencies: ['059'],
      technicalNotes: 'Complete all interactive elements with real or mock data',
      owner: 'Development',
      isNext: false
    },
    {
      id: '065',
      project: 'GTM Spike',
      epic: 'product',
      priority: 'MEDIUM',
      status: 'NOT_STARTED',
      userStory: 'As a small company user, I need a minimal feature set so that the product is not overwhelming',
      acceptanceCriteria: [
        'Identify core features for small companies',
        'Remove or hide advanced features',
        'Create simplified workflows',
        'Test with small company users'
      ],
      effort: 5,
      businessValue: 8,
      dependencies: ['059', '060'],
      technicalNotes: 'Use feature flags to create "essentials" mode',
      owner: 'Product',
      isNext: false
    },
    {
      id: '066',
      project: 'GTM Spike',
      epic: 'product',
      priority: 'HIGH',
      status: 'NOT_STARTED',
      userStory: 'As a system, I need to connect to the regulatory service layer so that compliance data is live',
      acceptanceCriteria: [
        'Design API integration architecture',
        'Connect to regulatory service',
        'Map data structures',
        'Handle API errors gracefully',
        'Test with real regulatory data'
      ],
      effort: 13,
      businessValue: 10,
      dependencies: ['059'],
      technicalNotes: 'RESTful API integration with caching strategy',
      owner: 'Development',
      isNext: false
    },

    // EPIC: DEPLOYMENT
    {
      id: '067',
      project: 'GTM Spike',
      epic: 'deployment',
      priority: 'CRITICAL',
      status: 'NOT_STARTED',
      userStory: 'As a customer, I need to buy and deploy immediately so that I can start using the product right away',
      acceptanceCriteria: [
        'Automated deployment pipeline',
        'Customer receives access within 5 minutes',
        'Zero manual intervention required',
        'Test full purchase-to-deploy flow'
      ],
      effort: 8,
      businessValue: 10,
      dependencies: [],
      technicalNotes: 'Automated provisioning with Vercel/similar',
      owner: 'DevOps',
      isNext: false
    },
    {
      id: '068',
      project: 'GTM Spike',
      epic: 'deployment',
      priority: 'HIGH',
      status: 'NOT_STARTED',
      userStory: 'As an operator, I need fast manual deployment capability so that I can quickly provision customers',
      acceptanceCriteria: [
        'Document manual deployment process',
        'Create deployment scripts',
        'Deploy in under 10 minutes',
        'Test repeatability'
      ],
      effort: 3,
      businessValue: 8,
      dependencies: [],
      technicalNotes: 'Shell scripts or Ansible playbooks for quick deployment',
      owner: 'DevOps',
      isNext: false
    },

    // EPIC: MARKETING MICROSITE
    {
      id: '069',
      project: 'GTM Spike',
      epic: 'marketing',
      priority: 'HIGH',
      status: 'NOT_STARTED',
      userStory: 'As a marketer, I need to create a marketing microsite with high-value content so that we can attract leads',
      acceptanceCriteria: [
        'Build landing page with value proposition',
        'Add compliance tips and resources',
        'Optimize for SEO',
        'Mobile responsive design',
        'Fast page load times'
      ],
      effort: 8,
      businessValue: 9,
      dependencies: [],
      technicalNotes: 'Next.js static site with MDX for content',
      owner: 'Marketing',
      isNext: false
    },
    {
      id: '070',
      project: 'GTM Spike',
      epic: 'marketing',
      priority: 'HIGH',
      status: 'NOT_STARTED',
      userStory: 'As a prospect, I need to see a massive value proposition (high-value, low-price) so that I am motivated to buy',
      acceptanceCriteria: [
        'Clear value statement above the fold',
        'Pricing prominently displayed',
        'ROI calculator or comparison chart',
        'Customer testimonials/social proof'
      ],
      effort: 5,
      businessValue: 10,
      dependencies: ['069'],
      technicalNotes: 'Compelling copywriting with visual hierarchy',
      owner: 'Marketing',
      isNext: false
    },

    // EPIC: PURCHASE
    {
      id: '071',
      project: 'GTM Spike',
      epic: 'purchase',
      priority: 'CRITICAL',
      status: 'NOT_STARTED',
      userStory: 'As a customer, I need a payment process so that I can purchase the product',
      acceptanceCriteria: [
        'Integrate Stripe or similar payment processor',
        'Support credit card payments',
        'Generate invoices automatically',
        'Handle payment failures gracefully',
        'PCI compliance'
      ],
      effort: 8,
      businessValue: 10,
      dependencies: [],
      technicalNotes: 'Stripe Checkout or Payment Links for quick setup',
      owner: 'Development',
      isNext: false
    },

    // EPIC: LEAD GENERATION
    {
      id: '072',
      project: 'GTM Spike',
      epic: 'leadgen',
      priority: 'HIGH',
      status: 'NOT_STARTED',
      userStory: 'As a sales team, I need outbound email and prospecting links working in Sales Genie so that we can generate leads',
      acceptanceCriteria: [
        'Email sending functional',
        'Link tracking working',
        'CRM integration active',
        'Email templates tested',
        'Bounce handling configured'
      ],
      effort: 8,
      businessValue: 9,
      dependencies: [],
      technicalNotes: 'Integrate with Sales Genie outreach agent',
      owner: 'Development',
      isNext: false
    }
  ];

  // Track if component is mounted to prevent hydration errors
  const [isMounted, setIsMounted] = useState(false);

  // Load backlog from Supabase only
  const [backlogItems, setBacklogItems] = useState<BacklogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load from Supabase only after mounting (client-side only)
  useEffect(() => {
    setIsMounted(true);

    // Load from Supabase - single source of truth
    (async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        const { data, error } = await supabase
          .from('backlog_items')
          .select('*')
          .order('display_order', { ascending: true });

        if (error) {
          console.error('Failed to load from Supabase:', error);
          setLoadError('Failed to load data from database. Please refresh the page.');
          setBacklogItems(initialBacklogItems);
          setIsLoading(false);
          return;
        }

        if (data && data.length > 0) {
          const supabaseItems: BacklogItem[] = data.map((item: any) => ({
            id: item.id,
            project: item.project,
            epic: item.epic as Epic,
            priority: item.priority as Priority,
            status: item.status as Status,
            userStory: item.user_story,
            acceptanceCriteria: item.acceptance_criteria || [],
            effort: item.effort,
            businessValue: item.business_value,
            dependencies: item.dependencies || [],
            technicalNotes: item.technical_notes || '',
            owner: item.owner,
            isNext: item.is_next || false
          }));

          setBacklogItems(supabaseItems);
          console.log('✅ Loaded from Supabase:', supabaseItems.length, 'items');
        } else {
          setBacklogItems(initialBacklogItems);
        }
      } catch (error) {
        console.error('Failed to load from Supabase:', error);
        setLoadError('An error occurred while loading data. Please refresh the page.');
        setBacklogItems(initialBacklogItems);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

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

  const [sortBy, setSortBy] = useState<'id' | 'epic' | 'priority' | 'status' | 'story' | 'next' | 'effort' | 'value' | 'custom'>('priority');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isCustomOrder, setIsCustomOrder] = useState(false);
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

  // Project management state
  const [projects, setProjects] = useState<string[]>(['Sales Genie', 'GTM Spike']);
  const [currentProject, setCurrentProject] = useState<string>('Sales Genie');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [mobileSearchTerm, setMobileSearchTerm] = useState('');

  // Update projects list whenever backlogItems changes
  React.useEffect(() => {
    if (backlogItems.length > 0) {
      const uniqueProjects = Array.from(new Set(backlogItems.map(item => item.project))).sort();
      setProjects(uniqueProjects);
    }
  }, [backlogItems]);

  // New story creation state
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newStory, setNewStory] = useState<BacklogItem>({
    id: '',
    project: currentProject,
    epic: 'foundation',
    priority: 'MEDIUM',
    status: 'NOT_STARTED',
    userStory: '',
    acceptanceCriteria: [''],
    effort: 3,
    businessValue: 5,
    dependencies: [],
    technicalNotes: '',
    owner: '',
    isNext: false
  });

  // Load from Supabase on initial mount
  React.useEffect(() => {
    const loadFromSupabase = async () => {
      try {
        const { data, error } = await supabase
          .from('backlog_items')
          .select('*')
          .order('display_order', { ascending: true });

        if (error) {
          console.error('Error loading from Supabase:', error);
          return;
        }

        if (data && data.length > 0) {
          // Convert from database format to app format
          const loadedItems: BacklogItem[] = data.map((item: any) => ({
            id: item.id,
            project: item.project,
            epic: item.epic as Epic,
            priority: item.priority as Priority,
            status: item.status as Status,
            userStory: item.user_story,
            acceptanceCriteria: item.acceptance_criteria || [],
            effort: item.effort,
            businessValue: item.business_value,
            dependencies: item.dependencies || [],
            technicalNotes: item.technical_notes || '',
            owner: item.owner || '',
            isNext: item.is_next || false
          }));

          setBacklogItems(loadedItems);
          console.log('✅ Loaded from Supabase:', loadedItems.length, 'items');
        }
      } catch (error) {
        console.error('Error loading from Supabase:', error);
      }
    };

    loadFromSupabase();
  }, []); // Only run once on mount

  // Save state for UI feedback
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  // Persist backlog to Supabase only (single source of truth)
  React.useEffect(() => {
    if (typeof window === 'undefined' || backlogItems.length === 0 || isLoading) return;

    // Sync to Supabase - single source of truth
    const syncToSupabase = async () => {
      try {
        setSaveStatus('saving');
        setSaveError(null);

        const itemsToUpsert = backlogItems.map((item, index) => ({
          id: item.id,
          project: item.project,
          epic: item.epic,
          priority: item.priority,
          status: item.status,
          user_story: item.userStory,
          acceptance_criteria: item.acceptanceCriteria,
          effort: item.effort,
          business_value: item.businessValue,
          dependencies: item.dependencies,
          technical_notes: item.technicalNotes,
          owner: item.owner,
          is_next: item.isNext,
          display_order: index
        }));

        const { error } = await supabase
          .from('backlog_items')
          .upsert(itemsToUpsert as any, { onConflict: 'id' });

        if (error) {
          console.error('❌ Error syncing to Supabase:', error);
          setSaveStatus('error');
          setSaveError(error.message || 'Failed to save changes');
        } else {
          console.log('✅ Synced to Supabase:', backlogItems.length, 'items');
          setSaveStatus('saved');
          // Reset to idle after 2 seconds
          setTimeout(() => setSaveStatus('idle'), 2000);
        }
      } catch (error) {
        console.error('❌ Exception syncing to Supabase:', error);
        setSaveStatus('error');
        setSaveError(error instanceof Error ? error.message : 'Failed to save changes');
      }
    };

    // Debounce the sync to avoid too many requests
    const timeoutId = setTimeout(syncToSupabase, 1000);
    return () => clearTimeout(timeoutId);
  }, [backlogItems, isLoading]);

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
    // Filter by current project
    if (item.project !== currentProject) return false;

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
    // Custom order mode: use original backlogItems order
    if (isCustomOrder) {
      const aIndex = backlogItems.findIndex(item => item.id === a.id);
      const bIndex = backlogItems.findIndex(item => item.id === b.id);
      return aIndex - bIndex;
    }

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
      case 'custom':
        // Should not reach here as isCustomOrder flag handles it
        return 0;
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
      project: currentProject,
      epic: 'foundation',
      priority: 'MEDIUM',
      status: 'NOT_STARTED',
      userStory: '',
      acceptanceCriteria: [''],
      effort: 3,
      businessValue: 5,
      dependencies: [],
      technicalNotes: '',
      owner: '',
      isNext: false
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
      project: 'Sales Genie',
      epic: 'foundation',
      priority: 'MEDIUM',
      status: 'NOT_STARTED',
      userStory: '',
      acceptanceCriteria: [''],
      effort: 3,
      businessValue: 5,
      dependencies: [],
      technicalNotes: '',
      owner: '',
      isNext: false
    });
  };

  const handleCancelNewStory = () => {
    setIsAddingNew(false);
    setNewStory({
      id: '',
      project: 'Sales Genie',
      epic: 'foundation',
      priority: 'MEDIUM',
      status: 'NOT_STARTED',
      userStory: '',
      acceptanceCriteria: [''],
      effort: 3,
      businessValue: 5,
      dependencies: [],
      technicalNotes: '',
      owner: '',
      isNext: false
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
    // Use projectItems instead of backlogItems to show only current project's values
    projectItems.forEach(item => {
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

    // For User Story column, apply filter dynamically as user types
    if (contextMenu.column === 'story' && searchTerm.trim()) {
      setContextMenuFilters(prev => {
        const filtered = prev.filter(f => f.column !== 'story');
        return [...filtered, {
          column: 'story',
          value: searchTerm.trim(),
          values: [],
          isMultiple: false
        }];
      });
    } else if (contextMenu.column === 'story' && !searchTerm.trim()) {
      // Clear the filter when search box is empty
      setContextMenuFilters(prev => prev.filter(f => f.column !== 'story'));
    }
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
    if (!contextMenu || !contextMenu.column) return;

    // If nothing selected OR all options selected, clear the filter for this column
    const allOptions = getColumnOptions(contextMenu.column);
    if (contextMenu.selectedValues.size === 0 || contextMenu.selectedValues.size === allOptions.length) {
      clearContextMenuFilter(contextMenu.column);
      setContextMenu(null);
      return;
    }

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
      analytics: 'Analytics & Insights',
      product: 'Product',
      deployment: 'Deployment',
      marketing: 'Marketing Microsite',
      purchase: 'Purchase',
      leadgen: 'Lead Generation',
      tracking: 'Tracking',
      cdp: 'CDP',
      personalization: 'Personalization',
      orchestration: 'Orchestration',
      compliance: 'Compliance'
    };
    // If epic not in labels, capitalize each word
    if (labels[epic]) {
      return labels[epic];
    }
    return epic.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Format display value for context menu based on column type
  const formatDisplayValue = (column: 'id' | 'epic' | 'priority' | 'status' | 'story' | 'next' | 'effort' | 'value' | null, value: string): string => {
    if (column === 'epic') {
      return getEpicLabel(value as Epic);
    }
    if (column === 'status') {
      return value.replace(/_/g, ' ');
    }
    return value;
  };

  // Calculate stats (filtered by current project)
  const projectItems = backlogItems.filter(i => i.project === currentProject);
  const stats = {
    total: projectItems.length,
    complete: projectItems.filter(i => i.status === 'DONE').length,
    inProgress: projectItems.filter(i => i.status === 'IN_PROGRESS').length,
    blocked: projectItems.filter(i => i.status === 'BLOCKED').length,
    next: projectItems.filter(i => i.isNext).length,
    totalEffort: projectItems.reduce((sum, i) => sum + i.effort, 0),
    completedEffort: projectItems.filter(i => i.status === 'DONE').reduce((sum, i) => sum + i.effort, 0)
  };

  // Get available epics for current project (auto-generated from existing items)
  const availableEpics = React.useMemo(() => {
    const uniqueEpics = new Set<Epic>();
    projectItems.forEach(item => uniqueEpics.add(item.epic));
    return Array.from(uniqueEpics).sort((a, b) => getEpicLabel(a).localeCompare(getEpicLabel(b)));
  }, [projectItems]);

  // Don't render until mounted to avoid hydration errors
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Project Modal */}
      {isCreatingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Project</h3>
            <input
              type="text"
              placeholder="Enter project name..."
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newProjectName.trim()) {
                  if (!projects.includes(newProjectName.trim())) {
                    setProjects([...projects, newProjectName.trim()]);
                    setCurrentProject(newProjectName.trim());
                  }
                  setNewProjectName('');
                  setIsCreatingProject(false);
                } else if (e.key === 'Escape') {
                  setNewProjectName('');
                  setIsCreatingProject(false);
                }
              }}
              autoFocus
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  if (newProjectName.trim() && !projects.includes(newProjectName.trim())) {
                    setProjects([...projects, newProjectName.trim()]);
                    setCurrentProject(newProjectName.trim());
                  }
                  setNewProjectName('');
                  setIsCreatingProject(false);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setNewProjectName('');
                  setIsCreatingProject(false);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
                  setContextMenuFilters(prev => {
                    const filtered = prev.filter(f => f.column !== 'story');
                    return [...filtered, {
                      column: 'story',
                      value: contextMenu.searchTerm.trim(),
                      values: [],
                      isMultiple: false
                    }];
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
                  if (contextMenu?.column) clearContextMenuFilter(contextMenu.column);
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
              {/* Select All Option */}
              <label className="flex items-center px-3 py-2 text-sm font-semibold hover:bg-blue-50 cursor-pointer border-b border-gray-300 bg-gray-50">
                <input
                  type="checkbox"
                  checked={contextMenu.selectedValues.size === 0 || contextMenu.selectedValues.size === getColumnOptions(contextMenu.column).length}
                  onChange={() => {
                    const allOptions = getColumnOptions(contextMenu.column);
                    if (contextMenu.selectedValues.size === allOptions.length) {
                      // Deselect all
                      setContextMenu({ ...contextMenu, selectedValues: new Set() });
                    } else {
                      // Select all
                      setContextMenu({ ...contextMenu, selectedValues: new Set(allOptions) });
                    }
                  }}
                  className="mr-2 rounded border-gray-300"
                />
                (Select All)
              </label>
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
      {/* Loading State */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 flex items-center space-x-3">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span className="text-gray-700">Loading backlog from database...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {loadError && (
        <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-800">Error Loading Data</h3>
            <p className="text-sm text-red-600 mt-1">{loadError}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 pt-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <svg className="h-10 w-10 mr-3" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Large bubble */}
              <circle cx="24" cy="28" r="16" fill="url(#bubble1)" opacity="0.9"/>
              <circle cx="24" cy="28" r="16" stroke="#3B82F6" strokeWidth="1.5" opacity="0.3"/>
              <ellipse cx="19" cy="23" rx="5" ry="6" fill="white" opacity="0.3"/>
              <circle cx="17" cy="21" r="2.5" fill="white" opacity="0.5"/>

              {/* Medium bubble */}
              <circle cx="34" cy="16" r="9" fill="url(#bubble2)" opacity="0.85"/>
              <circle cx="34" cy="16" r="9" stroke="#60A5FA" strokeWidth="1" opacity="0.3"/>
              <ellipse cx="31" cy="13" rx="2.5" ry="3" fill="white" opacity="0.35"/>

              {/* Small bubble */}
              <circle cx="12" cy="12" r="6" fill="url(#bubble3)" opacity="0.8"/>
              <circle cx="12" cy="12" r="6" stroke="#93C5FD" strokeWidth="1" opacity="0.3"/>
              <circle cx="10" cy="10" r="1.5" fill="white" opacity="0.4"/>

              {/* Tiny bubbles */}
              <circle cx="38" cy="32" r="3" fill="url(#bubble4)" opacity="0.7"/>
              <circle cx="7" cy="35" r="2.5" fill="url(#bubble4)" opacity="0.65"/>

              <defs>
                <radialGradient id="bubble1" cx="30%" cy="30%">
                  <stop offset="0%" stopColor="#DBEAFE"/>
                  <stop offset="50%" stopColor="#93C5FD"/>
                  <stop offset="100%" stopColor="#3B82F6"/>
                </radialGradient>
                <radialGradient id="bubble2" cx="30%" cy="30%">
                  <stop offset="0%" stopColor="#EFF6FF"/>
                  <stop offset="50%" stopColor="#BFDBFE"/>
                  <stop offset="100%" stopColor="#60A5FA"/>
                </radialGradient>
                <radialGradient id="bubble3" cx="30%" cy="30%">
                  <stop offset="0%" stopColor="#F0F9FF"/>
                  <stop offset="50%" stopColor="#DBEAFE"/>
                  <stop offset="100%" stopColor="#93C5FD"/>
                </radialGradient>
                <radialGradient id="bubble4" cx="30%" cy="30%">
                  <stop offset="0%" stopColor="#EFF6FF"/>
                  <stop offset="50%" stopColor="#DBEAFE"/>
                  <stop offset="100%" stopColor="#BFDBFE"/>
                </radialGradient>
              </defs>
            </svg>
            BubbleUp - {currentProject}

            {/* Save Status Indicator */}
            {saveStatus === 'saving' && (
              <span className="ml-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <div className="animate-spin h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
                Saving...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="ml-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Saved
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="ml-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <AlertCircle className="h-3 w-3 mr-1" />
                Error: {saveError}
              </span>
            )}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300 flex items-center flex-wrap">
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
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <select
            value={currentProject}
            onChange={(e) => setCurrentProject(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {projects.map((project) => (
              <option key={project} value={project}>
                {project}
              </option>
            ))}
          </select>
          <button
            onClick={() => setIsCreatingProject(true)}
            className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Create New Project
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-3">
        <div
          onClick={() => {
            // Clear all filters and show all stories
            setFilter({ epic: 'all', priority: 'all', status: 'all' });
            setContextMenuFilters([]);
            setStatusFilterMode('single');
            setPriorityFilterMode('single');
            setEpicFilterMode('single');
            setSelectedStatuses(new Set());
            setSelectedPriorities(new Set());
            setSelectedEpics(new Set());
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
            // Clear all filters, then show blocked
            setFilter({ epic: 'all', priority: 'all', status: 'BLOCKED' });
            setContextMenuFilters([]);
            setStatusFilterMode('single');
            setPriorityFilterMode('single');
            setEpicFilterMode('single');
            setSelectedStatuses(new Set());
            setSelectedPriorities(new Set());
            setSelectedEpics(new Set());
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
            // Clear all filters, then show done
            setFilter({ epic: 'all', priority: 'all', status: 'DONE' });
            setContextMenuFilters([]);
            setStatusFilterMode('single');
            setPriorityFilterMode('single');
            setEpicFilterMode('single');
            setSelectedStatuses(new Set());
            setSelectedPriorities(new Set());
            setSelectedEpics(new Set());
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
            // Clear all filters, then show in progress
            setFilter({ epic: 'all', priority: 'all', status: 'IN_PROGRESS' });
            setContextMenuFilters([]);
            setStatusFilterMode('single');
            setPriorityFilterMode('single');
            setEpicFilterMode('single');
            setSelectedStatuses(new Set());
            setSelectedPriorities(new Set());
            setSelectedEpics(new Set());
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

        <div
          onClick={() => {
            // Clear all filters, then show next (starred items)
            setFilter({ epic: 'all', priority: 'all', status: 'all' });
            setContextMenuFilters([{
              column: 'next',
              value: '',
              values: ['Next'],
              isMultiple: false
            }]);
            setStatusFilterMode('single');
            setPriorityFilterMode('single');
            setEpicFilterMode('single');
            setSelectedStatuses(new Set());
            setSelectedPriorities(new Set());
            setSelectedEpics(new Set());
          }}
          className="bg-white border border-yellow-200 rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-yellow-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Next</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.next}</p>
            </div>
            <Star className="h-8 w-8 text-yellow-400 fill-yellow-400" />
          </div>
        </div>

        <div
          onClick={() => {
            // Clear all filters, then show done (story points delivered)
            setFilter({ epic: 'all', priority: 'all', status: 'DONE' });
            setContextMenuFilters([]);
            setStatusFilterMode('single');
            setPriorityFilterMode('single');
            setEpicFilterMode('single');
            setSelectedStatuses(new Set());
            setSelectedPriorities(new Set());
            setSelectedEpics(new Set());
          }}
          className="bg-white border border-purple-200 rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-purple-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Story Points Delivered</p>
              <p className="text-2xl font-bold text-purple-600">{stats.completedEffort}/{stats.totalEffort}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Backlog Table - Desktop */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-lg overflow-hidden">
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
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExpandedItems(new Set())}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title="Collapse all stories"
                      >
                        <ChevronUp className="h-4 w-4 text-gray-500" />
                      </button>
                      <div
                        onClick={() => {
                          setIsCustomOrder(!isCustomOrder);
                          setSortBy('custom');
                        }}
                        className="flex items-center cursor-pointer"
                      >
                        <GripVertical className={`h-4 w-4 inline mr-1 ${isCustomOrder ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span className={isCustomOrder ? 'text-blue-600 font-bold' : ''}>Order</span>
                        {isCustomOrder && <span className="ml-1 text-blue-600">●</span>}
                      </div>
                    </div>
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
                        {availableEpics.map((epic) => (
                          <option key={epic} value={epic}>
                            {getEpicLabel(epic)}
                          </option>
                        ))}
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
                      availableEpics={availableEpics}
                      allItems={backlogItems}
                    />
                  ))}
                </SortableContext>
              </tbody>
            </table>
          </DndContext>
        </div>
      </div>

      {/* Backlog Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {/* Mobile Filters */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search stories..."
              value={mobileSearchTerm}
              onChange={(e) => {
                const searchValue = e.target.value;
                setMobileSearchTerm(searchValue);
                if (searchValue.trim()) {
                  setContextMenuFilters([{
                    column: 'story',
                    value: searchValue.toLowerCase(),
                    values: [],
                    isMultiple: false
                  }]);
                } else {
                  setContextMenuFilters(prev => prev.filter(f => f.column !== 'story'));
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Sort By */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  const value = e.target.value;
                  setSortBy(value as any);
                  if (value === 'custom') {
                    setIsCustomOrder(true);
                  } else {
                    setIsCustomOrder(false);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="custom">Custom Order</option>
                <option value="id">ID</option>
                <option value="epic">Epic</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
                <option value="story">Story</option>
                <option value="next">Next</option>
                <option value="effort">Effort</option>
                <option value="value">Value</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Direction</label>
              <select
                value={sortDirection}
                onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Epic</label>
              <select
                value={filter.epic}
                onChange={(e) => setFilter({ ...filter, epic: e.target.value as Epic | 'all' })}
                className="w-full px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                {availableEpics.map(epic => (
                  <option key={epic} value={epic}>{getEpicLabel(epic)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
              <select
                value={filter.priority}
                onChange={(e) => setFilter({ ...filter, priority: e.target.value as Priority | 'all' })}
                className="w-full px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value as Status | 'all' })}
                className="w-full px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="BLOCKED">Blocked</option>
                <option value="TESTING">Testing</option>
                <option value="DONE">Done</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(filter.epic !== 'all' || filter.priority !== 'all' || filter.status !== 'all' || contextMenuFilters.length > 0) && (
            <button
              onClick={() => {
                setFilter({ epic: 'all', priority: 'all', status: 'all' });
                setContextMenuFilters([]);
              }}
              className="w-full px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              Clear All Filters
            </button>
          )}
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sortedItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
            {sortedItems.map((item) => {
              const isExpanded = expandedItems.has(item.id);
              return (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-2 flex-1">
                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="mt-1"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-mono text-gray-500">{item.id}</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                            {getStatusIcon(item.status)}
                            <span className="ml-1">{item.status.replace('_', ' ')}</span>
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 leading-snug">{item.userStory}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateItem(item.id, { isNext: !item.isNext });
                      }}
                      className="ml-2 flex-shrink-0"
                    >
                      <Star
                        className={`h-5 w-5 ${item.isNext ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    </button>
                  </div>

                  {/* Card Meta */}
                  <div className="flex items-center space-x-2 flex-wrap gap-2 mb-3">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {getEpicLabel(item.epic)}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded border text-xs font-medium ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-800 text-xs font-medium">
                      {item.effort}
                    </span>
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                      {item.businessValue}
                    </span>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Acceptance Criteria</h4>
                        <ul className="space-y-2">
                          {item.acceptanceCriteria.map((criteria, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start">
                              <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                              <span>{criteria}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {item.technicalNotes && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Technical Notes</h4>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.technicalNotes}</p>
                        </div>
                      )}

                      {item.dependencies.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Dependencies</h4>
                          <div className="flex flex-wrap gap-2">
                            {item.dependencies.map((depId) => {
                              const depItem = backlogItems.find(i => i.id === depId);
                              return (
                                <span
                                  key={depId}
                                  className="relative group inline-block"
                                >
                                  <span className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs font-mono">
                                    {depId}
                                  </span>
                                  {depItem && (
                                    <span className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded whitespace-nowrap z-10 shadow-lg max-w-xs">
                                      {depItem.userStory}
                                      <span className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-black"></span>
                                    </span>
                                  )}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {item.owner && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Owner</h4>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="text-sm text-gray-700">{item.owner}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </SortableContext>
        </DndContext>
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

export default BacklogPage;