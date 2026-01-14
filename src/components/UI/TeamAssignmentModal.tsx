import { useState, useEffect } from 'react';
import { User, Team } from '../../types';
import { apiService } from '../../services/api';
import { X, Building2, Users, Loader2 } from 'lucide-react';

interface TeamAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onTeamAssigned: (user: User, team: Team | null) => void;
}

export function TeamAssignmentModal({ 
  isOpen, 
  onClose, 
  user, 
  onTeamAssigned 
}: TeamAssignmentModalProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen && user) {
      loadTeams();
      setSelectedTeamId(user.team_id?.toString() || '');
      setError('');
    }
  }, [isOpen, user]);

  const loadTeams = async () => {
    try {
      const response = await apiService.getTeams();
      setTeams(response.results || []);
    } catch (error) {
      console.error('Failed to load teams:', error);
      setError('Failed to load teams');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    setLoading(true);
    setError('');
    
    try {
      if (selectedTeamId) {
        // Add user to team
        await apiService.addUserToTeam({
          user_id: user.id,
          team_id: parseInt(selectedTeamId)
        });
        
        const selectedTeam = teams.find(t => t.id.toString() === selectedTeamId);
        onTeamAssigned(user, selectedTeam || null);
      } else {
        // Remove user from team (update user with no team)
        const updatedUser = await apiService.updateUser(user.id, {
          ...user,
          team_id: null
        });
        onTeamAssigned(updatedUser, null);
      }
      
      onClose();
    } catch (error: any) {
      console.error('Failed to assign team:', error);
      setError(error.response?.data?.message || 'Failed to assign team');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  const currentTeam = user.team_id ? teams.find(t => t.id === user.team_id) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Assign Team
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Assign {user.name} to a team
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Current Team */}
          {currentTeam && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  Current team: <strong>{currentTeam.name}</strong>
                </span>
              </div>
            </div>
          )}

          {/* Team Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Team
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">No Team</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id.toString()}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* User Info */}
          <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {selectedTeamId ? 'Assign Team' : 'Remove from Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}