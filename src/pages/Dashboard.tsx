import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Task, Team } from '../types';
import { TreeView } from '../components/UI/TreeView';
import { FilterSort } from '../components/UI/FilterSort';
import { TaskDetailModal } from '../components/UI/TaskDetailModal';
import { BarChart3, CheckSquare, Clock, AlertTriangle } from 'lucide-react';

export function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [stats, setStats] = useState({
    total_tasks: 0,
    completed_tasks: 0,
    overdue_tasks: 0,
    in_progress_tasks: 0
  });

  // Filter and sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sortBy, setSortBy] = useState<{ field: string; direction: 'asc' | 'desc' }>({ field: 'created_at', direction: 'desc' });

  useEffect(() => {
    loadData();
  }, [user, filters, sortBy, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load tasks based on user role
      const taskParams: Record<string, any> = {
        search: searchQuery,
        ...filters,
        ordering: sortBy.direction === 'asc' ? sortBy.field : `-${sortBy.field}`,
      };

      // Role-based task filtering
      if (user?.role === 'employee' || user?.role === 'intern') {
        taskParams.assignee_id = user.id;
      } else if (user?.role === 'manager') {
        taskParams.team_id = user.team_id;
      }
      // Admin sees all tasks (no additional filtering)

      const [tasksResponse, teamsResponse] = await Promise.all([
        apiService.getTasks(taskParams),
        apiService.getTeams()
      ]);

      setTasks(tasksResponse.results || []);
      setTeams(teamsResponse.results || []);

      // Calculate stats
      const allTasks = tasksResponse.results || [];
      setStats({
        total_tasks: allTasks.length,
        completed_tasks: allTasks.filter((t: Task) => t.status === 'completed').length,
        overdue_tasks: allTasks.filter((t: Task) => t.is_overdue).length,
        in_progress_tasks: allTasks.filter((t: Task) => t.status === 'in_progress').length,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
    setSortBy({ field, direction });
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleTaskEdit = (task: Task) => {
    // For now, open the task detail modal which has edit functionality
    setSelectedTask(task);
  };

  const handleTaskDelete = async (task: Task) => {
    if (!window.confirm(`Are you sure you want to delete the task "${task.title}"?`)) {
      return;
    }

    try {
      await apiService.deleteTask(task.id);
      // Reload data to refresh the task list
      loadData();
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  const filterOptions = {
    teams: teams.map(team => ({ id: team.id, name: team.name })),
    statuses: [
      { value: 'todo', label: 'To Do' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'review', label: 'In Review' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' }
    ],
    priorities: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'urgent', label: 'Urgent' }
    ]
  };

  const sortOptions = [
    { value: 'title_asc', label: 'Title (A-Z)' },
    { value: 'title_desc', label: 'Title (Z-A)' },
    { value: 'priority_desc', label: 'Priority (High-Low)' },
    { value: 'priority_asc', label: 'Priority (Low-High)' },
    { value: 'due_date_asc', label: 'Due Date (Earliest)' },
    { value: 'due_date_desc', label: 'Due Date (Latest)' },
    { value: 'created_at_desc', label: 'Created (Newest)' },
    { value: 'created_at_asc', label: 'Created (Oldest)' },
  ];

  const getRoleBasedTitle = () => {
    switch (user?.role) {
      case 'admin':
        return 'All Tasks Overview';
      case 'manager':
        return 'Team Tasks Dashboard';
      default:
        return 'My Tasks Dashboard';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {getRoleBasedTitle()}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back, {user?.name}! Here's what's happening with your tasks.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_tasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CheckSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed_tasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.in_progress_tasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.overdue_tasks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <FilterSort
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onFilterChange={handleFilterChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        filterOptions={filterOptions}
        sortOptions={sortOptions}
      />

      {/* Task Tree */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Task Hierarchy
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Tasks organized by parent-child relationships
          </p>
        </div>
        <div className="p-6">
          <TreeView
            tasks={tasks}
            onTaskClick={handleTaskClick}
            onTaskEdit={handleTaskEdit}
            onTaskDelete={handleTaskDelete}
          />
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}


