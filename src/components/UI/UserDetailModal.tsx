import { useState, useEffect } from 'react';
import { User, Task } from '../../types';
import { apiService } from '../../services/api';
import { X, User as UserIcon, Building2, Mail, Phone, Shield, Calendar, CheckSquare, Clock, AlertTriangle } from 'lucide-react';
import { TaskDetailModal } from './TaskDetailModal';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export function UserDetailModal({ isOpen, onClose, user }: UserDetailModalProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskFilter, setTaskFilter] = useState<string>('all'); // all, assigned, created
  const [statusFilter, setStatusFilter] = useState<string>('all'); // all, todo, in_progress, review, completed, cancelled

  useEffect(() => {
    if (isOpen && user) {
      loadUserTasks();
    }
  }, [isOpen, user, taskFilter]);

  const loadUserTasks = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let userTasks: Task[] = [];
      
      if (taskFilter === 'all' || taskFilter === 'assigned') {
        // Get tasks assigned to the user
        const assignedResponse = await apiService.getTasks({ assigned_to: user.id });
        userTasks = [...userTasks, ...(assignedResponse.results || [])];
      }
      
      if (taskFilter === 'all' || taskFilter === 'created') {
        // Get tasks created by the user
        const createdResponse = await apiService.getTasks({ created_by: user.id });
        const createdTasks = createdResponse.results || [];
        
        // Avoid duplicates if a user assigned a task to themselves
        const newTasks = createdTasks.filter((task: Task) => 
          !userTasks.some(existingTask => existingTask.id === task.id)
        );
        userTasks = [...userTasks, ...newTasks];
      }
      
      setTasks(userTasks);
    } catch (error) {
      console.error('Failed to load user tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'manager': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'employee': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'intern': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'review': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'todo': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckSquare className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'review': return <AlertTriangle className="h-4 w-4" />;
      case 'todo': return <Clock className="h-4 w-4" />;
      case 'cancelled': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (statusFilter !== 'all' && task.status !== statusFilter) {
      return false;
    }
    return true;
  });

  if (!isOpen || !user) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-xl font-semibold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {user.name}
                </h2>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                  {user.role}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          <div className="flex h-[calc(90vh-100px)]">
            {/* User Details Sidebar */}
            <div className="w-80 border-r border-gray-200 dark:border-gray-700 p-6 overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                User Information
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.email}</p>
                  </div>
                </div>

                {user.mobile_number && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.mobile_number}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Role</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{user.role}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Team</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.team_name || 'No team assigned'}
                    </p>
                  </div>
                </div>

                {user.position && (
                  <div className="flex items-center space-x-3">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Position</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.position}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Joined</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.is_active 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tasks Section */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tasks ({filteredTasks.length})
                </h3>
                
                <div className="flex items-center space-x-3">
                  {/* Task Filter */}
                  <select
                    value={taskFilter}
                    onChange={(e) => setTaskFilter(e.target.value)}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Tasks</option>
                    <option value="assigned">Assigned to User</option>
                    <option value="created">Created by User</option>
                  </select>

                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <CheckSquare className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No tasks found
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    This user has no tasks matching the current filters.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTasks.map(task => (
                    <div
                      key={task.id}
                      onClick={() => handleTaskClick(task)}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {task.title}
                            </h4>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          </div>
                          
                          {task.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                            {task.due_date && (
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>Due {new Date(task.due_date).toLocaleDateString()}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-1">
                              <span>Assigned to: {task.assignee?.name || 'Unassigned'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span>Created by: {task.assigner?.name || 'Unknown'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                            {getStatusIcon(task.status)}
                            <span className="ml-1 capitalize">{task.status.replace('_', ' ')}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          isOpen={selectedTask !== null}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
        />
      )}
    </>
  );
}