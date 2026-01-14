import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { User, Team } from '../types';
import { UserCheck, Plus, Edit2 as Edit, Trash2, Search, Users as UsersIcon, Building2, Mail, Phone, Shield, RotateCcw, UserPlus, BarChart3, Archive } from 'lucide-react';
import { CreateUserModal } from '../components/UI/CreateUserModal';
import { TeamAssignmentModal } from '../components/UI/TeamAssignmentModal';
import { UserDetailModal } from '../components/UI/UserDetailModal';

export function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [deletedUsers, setDeletedUsers] = useState<User[]>([]);
  const [teamAssignmentUser, setTeamAssignmentUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [showStats, setShowStats] = useState(false);
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<User | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, searchTerm, selectedRole, selectedTeam, showDeleted]);

  const loadData = async () => {
    setLoading(true);
    try {
      const searchParams: any = {};
      
      if (searchTerm) {
        searchParams.search = searchTerm;
      }
      
      if (selectedRole) {
        searchParams.role = selectedRole;
      }
      
      if (selectedTeam) {
        searchParams.team_id = selectedTeam;
      }

      // For managers and employees, only show users from their teams
      if (user?.role === 'manager' || user?.role === 'employee') {
        if (user.team_id) {
          searchParams.team_id = user.team_id;
        } else {
          // If user has no team, show empty list
          setUsers([]);
          setLoading(false);
          return;
        }
      }

      const [usersResponse, teamsResponse] = await Promise.all([
        showDeleted ? apiService.getDeletedUsers() : apiService.getUsers(searchParams),
        apiService.getTeams()
      ]);
      
      if (showDeleted) {
        setDeletedUsers(usersResponse.results || []);
        setUsers([]);
      } else {
        setUsers(usersResponse.results || []);
        setDeletedUsers([]);
      }
      setTeams(teamsResponse.results || []);
    } catch (error) {
      console.error('Failed to load users data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const stats = await apiService.getUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };

  const handleDeleteUser = async (userToDelete: User) => {
    if (window.confirm(`Are you sure you want to delete user "${userToDelete.name}"? This action can be undone.`)) {
      try {
        await apiService.deleteUser(userToDelete.id);
        setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const handleRestoreUser = async (userToRestore: User) => {
    try {
      await apiService.restoreUser(userToRestore.id);
      setDeletedUsers(prev => prev.filter(u => u.id !== userToRestore.id));
      // Reload active users to show the restored user
      if (!showDeleted) {
        loadData();
      }
    } catch (error) {
      console.error('Failed to restore user:', error);
      alert('Failed to restore user. Please try again.');
    }
  };

  const handleTeamAssignment = (assignedUser: User, team: Team | null) => {
    setUsers(prev => prev.map(u => 
      u.id === assignedUser.id 
        ? { ...u, team_id: team?.id || null, team_name: team?.name || null }
        : u
    ));
    setTeamAssignmentUser(null);
  };

  const handleEditUser = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setIsCreateModalOpen(true);
  };

  const handleUserCreated = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
    setIsCreateModalOpen(false);
    setEditingUser(null);
  };

  const handleUserUpdated = (updatedUser: User) => {
    setUsers(prev => prev.map(u => 
      u.id === updatedUser.id ? updatedUser : u
    ));
    setIsCreateModalOpen(false);
    setEditingUser(null);
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

  const getTeamName = (teamId: number | null) => {
    if (!teamId) return 'No team';
    const team = teams.find(t => t.id === teamId);
    return team?.name || 'Unknown team';
  };

  const canManageUsers = user?.role === 'admin';
  const canEditUser = (targetUser: User) => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'manager' && targetUser.team_id === user.team_id) return true;
    return false;
  };

  const displayUsers = showDeleted ? deletedUsers : users;
  const filteredUsers = displayUsers.filter(u => {
    if (searchTerm && !u.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !u.email.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (selectedRole && u.role !== selectedRole) {
      return false;
    }
    if (selectedTeam && u.team_id?.toString() !== selectedTeam) {
      return false;
    }
    return true;
  });

  if (!user || (!canManageUsers && user.role !== 'manager' && user.role !== 'employee')) {
    return (
      <div className="text-center py-12">
        <UserCheck className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Access Denied
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          You don't have permission to view users.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <UserCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Users Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {user?.role === 'admin' 
                  ? 'Manage all users in the organization'
                  : `Manage users in your team`
                }
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* View Toggle */}
            {/* {canManageUsers && (
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setShowDeleted(false)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    !showDeleted 
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Active Users
                </button>
                <button
                  onClick={() => setShowDeleted(true)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    showDeleted 
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Archive className="h-4 w-4 mr-1 inline-block" />
                  Deleted Users
                </button>
              </div>
            )} */}

            {/* Statistics Button */}
            {/* {canManageUsers && (
              <button
                onClick={() => {
                  setShowStats(!showStats);
                  if (!showStats && !userStats) {
                    loadUserStats();
                  }
                }}
                className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Statistics
              </button>
            )} */}

            {/* Add User Button */}
            {canManageUsers && !showDeleted && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add User
              </button>
            )}
          </div>
        </div>

        {/* Statistics Panel */}
        {showStats && userStats && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <UsersIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {userStats.total_users || 0}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {userStats.active_users || 0}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Teams</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {teams.length}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Archive className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Deleted</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {userStats.deleted_users || 0}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
              <option value="intern">Intern</option>
            </select>
          </div>

          {/* Team Filter */}
          {user?.role === 'admin' && (
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Teams</option>
                <option value="null">No Team</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id.toString()}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <UsersIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No users found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by adding your first user.'}
            </p>
          </div>
        ) : (
          filteredUsers.map(userData => (
            <div 
              key={userData.id} 
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedUserForDetail(userData)}
            >
              {/* User Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-white">
                      {userData.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {userData.name}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(userData.role)}`}>
                      {userData.role}
                    </span>
                  </div>
                </div>

                {(canEditUser(userData) || canManageUsers) && (
                  <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                    {!showDeleted && (
                      <>
                        <button
                          onClick={() => handleEditUser(userData)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Edit user"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setTeamAssignmentUser(userData)}
                          className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                          title="Assign team"
                        >
                          <UserPlus className="h-4 w-4" />
                        </button>
                        {canManageUsers && userData.id !== user?.id && (
                          <button
                            onClick={() => handleDeleteUser(userData)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </>
                    )}
                    {showDeleted && canManageUsers && (
                      <button
                        onClick={() => handleRestoreUser(userData)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        title="Restore user"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* User Details */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="h-4 w-4" />
                  <span>{userData.email}</span>
                </div>

                {userData.mobile_number && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="h-4 w-4" />
                    <span>{userData.mobile_number}</span>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Building2 className="h-4 w-4" />
                  <span>{getTeamName(userData.team_id)}</span>
                </div>

                {userData.position && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Position:</strong> {userData.position}
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {showDeleted ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                        Deleted
                      </span>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        userData.is_active 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                      }`}>
                        {userData.is_active ? 'Active' : 'Inactive'}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Joined {new Date(userData.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingUser(null);
        }}
        userToEdit={editingUser}
        onUserCreated={handleUserCreated}
        onUserUpdated={handleUserUpdated}
      />

      {/* Team Assignment Modal */}
      <TeamAssignmentModal
        isOpen={teamAssignmentUser !== null}
        onClose={() => setTeamAssignmentUser(null)}
        user={teamAssignmentUser}
        onTeamAssigned={handleTeamAssignment}
      />

      {/* User Detail Modal */}
      <UserDetailModal
        isOpen={selectedUserForDetail !== null}
        onClose={() => setSelectedUserForDetail(null)}
        user={selectedUserForDetail}
      />
    </div>
  );
}