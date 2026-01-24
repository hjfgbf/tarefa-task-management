import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Task, Team } from '../types';
import { TaskCard } from '../components/UI/TaskCard';
import { FilterSort } from '../components/UI/FilterSort';
import { TaskDetailModal } from '../components/UI/TaskDetailModal';
import { CheckSquare } from 'lucide-react';
import { CreateTaskModal } from '../components/UI/CreateTaskModal';

export function MyTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Filter and sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sortBy, setSortBy] = useState({ field: 'due_date', direction: 'asc' as const });

  useEffect(() => {
    loadData();
  }, [filters, sortBy, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      const taskParams = {
        search: searchQuery,
        ...filters,
        ordering: sortBy.direction === 'asc' ? sortBy.field : `-${sortBy.field}`,
      };

      const [tasksResponse, teamsResponse] = await Promise.all([
        apiService.getMyTasks(),
        apiService.getTeams()
      ]);

      let allTasks = tasksResponse || [];

      // Apply client-side filtering if needed
      if (filters.team_id) {
        allTasks = allTasks.filter((task: Task) => task.team.id === parseInt(filters.team_id));
      }
      if (filters.status) {
        allTasks = allTasks.filter((task: Task) => task.status === filters.status);
      }
      if (filters.priority) {
        allTasks = allTasks.filter((task: Task) => task.priority === filters.priority);
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        allTasks = allTasks.filter((task: Task) =>
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          task.sub_title.toLowerCase().includes(query)
        );
      }

      // Apply client-side sorting
      allTasks.sort((a: Task, b: Task) => {
        let aValue: any, bValue: any;

        switch (sortBy.field) {
          case 'title':
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          case 'due_date':
            aValue = a.due_date ? new Date(a.due_date).getTime() : 0;
            bValue = b.due_date ? new Date(b.due_date).getTime() : 0;
            break;
          case 'created_at':
            aValue = new Date(a.created_at).getTime();
            bValue = new Date(b.created_at).getTime();
            break;
          case 'priority':
            const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 };
            aValue = priorityOrder[a.priority as keyof typeof priorityOrder];
            bValue = priorityOrder[b.priority as keyof typeof priorityOrder];
            break;
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
          default:
            aValue = a.created_at;
            bValue = b.created_at;
        }

        if (sortBy.direction === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      setTasks(allTasks);
      setTeams(teamsResponse.results || []);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSortChange = (field: string, direction: any
    // 'asc' | 'desc'
  ) => {
    setSortBy({ field, direction });
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
    { value: 'due_date_asc', label: 'Due Date (Earliest)' },
    { value: 'due_date_desc', label: 'Due Date (Latest)' },
    { value: 'created_at_desc', label: 'Created Date (Newest)' },
    { value: 'created_at_asc', label: 'Created Date (Oldest)' },
    { value: 'priority_desc', label: 'Priority (High-Low)' },
    { value: 'priority_asc', label: 'Priority (Low-High)' },
    { value: 'status_asc', label: 'Status (A-Z)' },
    { value: 'status_desc', label: 'Status (Z-A)' },
  ];

  const handleDeleteTask = async (task: Task) => {
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      try {
        await apiService.deleteTask(task.id);
        // Remove the deleted task from the list
        setTasks(prev => prev.filter(t => t.id !== task.id));

        // If the deleted task was selected for viewing, close the modal
        if (selectedTask?.id === task.id) {
          setSelectedTask(null);
        }

        // If the deleted task was being edited, close the edit modal
        if (editingTask?.id === task.id) {
          setEditingTask(null);
        }
      } catch (error) {
        console.error('Failed to delete task:', error);
        alert('Failed to delete task. Please try again.');
      }
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Tasks</h1>
        <p className="text-gray-600 dark:text-gray-400">
          All tasks assigned to you ({tasks.length} task{tasks.length !== 1 ? 's' : ''})
        </p>
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

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            showActions={true}
            onClick={() => setSelectedTask(task)}
            onEdit={() => setEditingTask(task)}
            onDelete={() => handleDeleteTask(task)}
          />
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No tasks found</h3>
            <p>You don't have any assigned tasks matching the current filters.</p>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {/* Create/Edit Task Modal */}
      <CreateTaskModal
        isOpen={createModalOpen || !!editingTask}
        onClose={() => {
          setCreateModalOpen(false);
          setEditingTask(null);
        }}
        taskToEdit={editingTask}
        onTaskCreated={(task) => {
          // Add the new task to the list
          setTasks(prev => [task, ...prev]);
          setCreateModalOpen(false);
        }}
        onTaskUpdated={(task) => {
          // Update the task in the list
          setTasks(prev => prev.map(t => t.id === task.id ? task : t));
          setEditingTask(null);
        }}
      />
    </div>
  );
}