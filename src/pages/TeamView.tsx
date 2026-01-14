import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Team, User, Task } from '../types';
import { Users, Search, Mail, Phone, MapPin, CheckSquare } from 'lucide-react';
import { UserDetailModal } from '../components/UI/UserDetailModal';

export function TeamView() {
  const { user } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [memberTasks, setMemberTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'role' | 'position'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [userDetailModalOpen, setUserDetailModalOpen] = useState(false);

  useEffect(() => {
    loadTeamData();
    console.log('User:', user);
  }, [user]);

  useEffect(() => {
    if (selectedMember) {
      loadMemberTasks();
    }
  }, [selectedMember]);

  const loadTeamData = async () => {
    if (!user?.team_id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const teamResponse = await apiService.getTeamById(user.team_id);
      setTeam(teamResponse);
      console.log('Team response:', teamResponse);
      setMembers(teamResponse.members || []);
    } catch (error) {
      console.error('Failed to load team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMemberTasks = async () => {
    if (!selectedMember) return;

    try {
      const response = await apiService.getTasks({ assignee_id: selectedMember.id });
      setMemberTasks(response.results || []);
    } catch (error) {
      console.error('Failed to load member tasks:', error);
    }
  };

  // Filter and sort members
  const filteredAndSortedMembers = members
    .filter(member => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        member.position.toLowerCase().includes(query) ||
        member.role.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      let aValue: string, bValue: string;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'role':
          aValue = a.role;
          bValue = b.role;
          break;
        case 'position':
          aValue = a.position.toLowerCase();
          bValue = b.position.toLowerCase();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'manager': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'employee': return 'bg-green-100 text-green-800 border-green-200';
      case 'intern': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center py-12">
        <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Team Assigned
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          You are not currently assigned to any team. Contact your administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {team.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {team.description}
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {members.length} member{members.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Team Head:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {team.team_head_name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Members */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search and Sort */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search team members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* <div className="flex items-center space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'role' | 'position')}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name">Sort by Name</option>
                  <option value="role">Sort by Role</option>
                  <option value="position">Sort by Position</option>
                </select>
                
                <button
                  onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  {sortDirection === 'asc' ? 'A-Z' : 'Z-A'}
                </button>
              </div> */}
            </div>
          </div>

          {/* Members List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAndSortedMembers.map((member) => (
                <div
                  key={member.id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                    selectedMember?.id === member.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => {
                    setSelectedMember(member);
                    setUserDetailModalOpen(true);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {member.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {member.position}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(member.role)}`}>
                        {member.role}
                      </span>
                      {member.id === team.team_head_id && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                          Team Head
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Member Details & Tasks */}
        <div className="space-y-4">
          {selectedMember ? (
            <>
              {/* Member Details */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="text-center mb-4">
                  <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-medium text-blue-700 dark:text-blue-300">
                      {selectedMember.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {selectedMember.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedMember.position}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900 dark:text-white">
                      {selectedMember.email}
                    </span>
                  </div>
                  
                  {selectedMember.mobile_number && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {selectedMember.mobile_number}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(selectedMember.role)}`}>
                      {selectedMember.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Member Tasks */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                    <CheckSquare className="h-5 w-5 mr-2" />
                    Tasks ({memberTasks.length})
                  </h3>
                </div>
                
                <div className="p-6">
                  {memberTasks.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No tasks assigned
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {memberTasks.slice(0, 5).map(task => (
                        <div key={task.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                              {task.title}
                            </h4>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTaskStatusColor(task.status)}`}>
                              {task.status.replace('_', ' ')}
                            </span>
                          </div>
                          {task.due_date && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Due: {new Date(task.due_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))}
                      
                      {memberTasks.length > 5 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                          + {memberTasks.length - 5} more tasks
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Select a Team Member
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click on a team member to view their details and assigned tasks.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* User Detail Modal */}
      <UserDetailModal
        isOpen={userDetailModalOpen}
        onClose={() => {
          setUserDetailModalOpen(false);
          setSelectedMember(null);
        }}
        user={selectedMember}
      />
    </div>
  );
}