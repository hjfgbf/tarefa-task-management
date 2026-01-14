import { useState, useEffect } from 'react';
import { Team, User, Task } from '../../types';
import { apiService } from '../../services/api';
import { X, Building2, Users, Calendar, UserCheck, Mail, Phone, CheckSquare } from 'lucide-react';
import { UserDetailModal } from './UserDetailModal';

interface TeamDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
}

export function TeamDetailModal({ isOpen, onClose, team }: TeamDetailModalProps) {
  const [members, setMembers] = useState<User[]>([]);
  const [teamTasks, setTeamTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetailModalOpen, setUserDetailModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && team) {
      loadTeamData();
    }
  }, [isOpen, team]);

  const loadTeamData = async () => {
    if (!team) return;
    
    setLoading(true);
    try {
      const [teamResponse, tasksResponse] = await Promise.all([
        apiService.getTeamById(team.id),
        apiService.getTasks({ team_id: team.id })
      ]);
      
      setMembers(teamResponse.members || []);
      setTeamTasks(tasksResponse.results || []);
    } catch (error) {
      console.error('Failed to load team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setUserDetailModalOpen(true);
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

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'review': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
    }
  };

  if (!isOpen || !team) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {team.name}
              </h2>
              {team.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{team.description}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Team Members */}
          <div className="w-1/2 p-6 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Team Members ({members.length})
              </h3>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No team members found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {members.map(member => (
                  <div
                    key={member.id}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                    onClick={() => handleUserClick(member)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-white">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {member.name}
                          </h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                            {member.role}
                          </span>
                        </div>
                        <div className="mt-1 space-y-1">
                          {member.position && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">{member.position}</p>
                          )}
                          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Mail className="h-3 w-3" />
                              <span>{member.email}</span>
                            </div>
                            {member.mobile_number && (
                              <div className="flex items-center space-x-1">
                                <Phone className="h-3 w-3" />
                                <span>{member.mobile_number}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Team Tasks */}
          <div className="w-1/2 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <CheckSquare className="h-5 w-5 mr-2" />
                Team Tasks ({teamTasks.length})
              </h3>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : teamTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No tasks found for this team</p>
              </div>
            ) : (
              <div className="space-y-3">
                {teamTasks.map(task => (
                  <div key={task.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2">
                        {task.title}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTaskStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    {task.sub_title && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{task.sub_title}</p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-2">
                        <UserCheck className="h-3 w-3" />
                        <span>Assigned to: {task.assignee_details?.name || task.assignee_name}</span>
                      </div>
                      {task.due_date && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User Detail Modal */}
        <UserDetailModal
          isOpen={userDetailModalOpen}
          onClose={() => {
            setUserDetailModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
        />
      </div>
    </div>
  );
}