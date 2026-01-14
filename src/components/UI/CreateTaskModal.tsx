import { useState, useEffect } from 'react';
import { X, Calendar, User, Flag, Building } from 'lucide-react';
import { Task, User as UserType, Team } from '../../types';
import { apiService } from '../../services/api';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated?: (task: Task) => void;
  onTaskUpdated?: (task: Task) => void;
  taskToEdit?: Task | null; // If provided, the modal will be in edit mode
}

export function CreateTaskModal({ 
  isOpen, 
  onClose, 
  onTaskCreated, 
  onTaskUpdated, 
  taskToEdit 
}: CreateTaskModalProps) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserType[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [parentTasks, setParentTasks] = useState<Task[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    sub_title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    status: 'todo' as 'todo' | 'in_progress' | 'review' | 'completed' | 'cancelled',
    assignee: '',
    team_id: '',
    parent_task_id: '',
    due_date: '',
    start_date: '',
    estimated_hours: ''
  });

  const isEditMode = !!taskToEdit;

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      if (taskToEdit) {
        // Populate form with existing task data
        setFormData({
          title: taskToEdit.title || '',
          sub_title: taskToEdit.sub_title || '',
          description: taskToEdit.description || '',
          priority: taskToEdit.priority,
          status: taskToEdit.status,
          assignee: taskToEdit.assignee.toString(),
          team_id: taskToEdit.team?.id?.toString() || '',
          parent_task_id: taskToEdit.parent_task_id?.toString() || '',
          due_date: taskToEdit.due_date ? taskToEdit.due_date.split('T')[0] : '',
          start_date: taskToEdit.start_date ? taskToEdit.start_date.split('T')[0] : '',
          estimated_hours: taskToEdit.estimated_hours?.toString() || ''
        });
      } else {
        // Reset form for new task
        setFormData({
          title: '',
          sub_title: '',
          description: '',
          priority: 'medium',
          status: 'todo',
          assignee: '',
          team_id: '',
          parent_task_id: '',
          due_date: '',
          start_date: '',
          estimated_hours: ''
        });
      }
    }
  }, [isOpen, taskToEdit]);

  const loadInitialData = async () => {
    try {
      const [usersResponse, teamsResponse, tasksResponse] = await Promise.all([
        apiService.getUsers(),
        apiService.getTeams(),
        apiService.getTasks() // For parent task selection
      ]);

      console.log('Teams Response:', teamsResponse);

      setUsers(usersResponse.results || []);
      setTeams(teamsResponse.results || []);
      setParentTasks(tasksResponse.results || []);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const taskData = {
        ...formData,
        assignee: parseInt(formData.assignee),
        team_id: formData.team_id ? parseInt(formData.team_id) : null,
        parent_task_id: formData.parent_task_id ? parseInt(formData.parent_task_id) : null,
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
        due_date: formData.due_date || null,
        start_date: formData.start_date || null
      };

      if (isEditMode && taskToEdit) {
        // Update existing task
        const updatedTask = await apiService.updateTask(taskToEdit.id, taskData);
        onTaskUpdated?.(updatedTask);
      } else {
        // Create new task
        const newTask = await apiService.createTask(taskData);
        onTaskCreated?.(newTask);
      }

      onClose();
    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} task:`, error);
      alert(`Failed to ${isEditMode ? 'update' : 'create'} task. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose} />
        
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isEditMode ? 'Edit Task' : 'Create New Task'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter task title"
              />
            </div>

            {/* Sub Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sub Title
              </label>
              <input
                type="text"
                name="sub_title"
                value={formData.sub_title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter task sub title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter task description"
              />
            </div>

            {/* Priority and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Flag className="h-4 w-4 inline mr-1" />
                  Priority *
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">In Review</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Assignee and Team */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <User className="h-4 w-4 inline mr-1" />
                  Assign To *
                </label>
                <select
                  name="assignee"
                  value={formData.assignee}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select assignee</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Building className="h-4 w-4 inline mr-1" />
                  Team
                </label>
                <select
                  name="team_id"
                  value={formData.team_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select team</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Parent Task */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Parent Task
              </label>
              <select
                name="parent_task_id"
                value={formData.parent_task_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select parent task</option>
                {parentTasks
                  .filter(task => !isEditMode || task.id !== taskToEdit?.id) // Prevent self-reference
                  .map(task => (
                    <option key={task.id} value={task.id}>
                      {task.title}
                    </option>
                  ))}
              </select>
            </div>

            {/* Dates and Hours */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Start Date
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Due Date
                </label>
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estimated Hours
                </label>
                <input
                  type="number"
                  name="estimated_hours"
                  value={formData.estimated_hours}
                  onChange={handleInputChange}
                  min="0"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Task' : 'Create Task')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
