import { useState, useEffect } from 'react';
import { Team, User } from '../../types';
import { apiService } from '../../services/api';
import { X, Building2, User as UserIcon, Loader2, Users } from 'lucide-react';

interface EditTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
  onTeamUpdated: (updatedTeam: Team) => void;
}

export function EditTeamModal({
  isOpen,
  onClose,
  team,
  onTeamUpdated
}: EditTeamModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    team_head: '',
    parent_team_id: ''
  });
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<any[]>([]);
  useEffect(() => {
    if (isOpen) {
      loadData();
      if (team) {
        setFormData({
          name: team?.name,
          description: team?.description || '',
          team_head: team?.team_head_id?.toString(),
          parent_team_id: team?.parent_team_id?.toString() || ''
        });
      }
      setErrors({});
    }
  }, [isOpen, team]);

  const loadData = async () => {
    try {
      const [usersResponse, teamsResponse] = await Promise.all([
        apiService.getUsers(),
        apiService.getTeams()
      ]);
      setUsers(usersResponse.results || []);
      setTeams(teamsResponse.results || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Team name is required';
    }

    if (!formData.team_head) {
      newErrors.team_head = 'Team head is required';
    }

    // Prevent team from being its own parent
    if (formData.parent_team_id && team && formData.parent_team_id === team.id.toString()) {
      newErrors.parent_team_id = 'Team cannot be its own parent';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !team) {
      return;
    }

    setErrorMessage([])
    setLoading(true);

    try {
      const teamData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        team_head: parseInt(formData.team_head),
        parent_team_id: formData.parent_team_id ? parseInt(formData.parent_team_id) : null
      };

      const updatedTeam = await apiService.updateTeam(team.id, teamData);
      onTeamUpdated(updatedTeam);
      if (updatedTeam) {
        setErrorMessage([])
        setLoading(false);
        onClose();
      }
    } catch (error: any) {
      setLoading(false);
      const errData = error?.error;

      if (errData && typeof errData === 'object') {
        const firstKey = Object.keys(errData)[0];
        const firstValue = errData[firstKey];

        if (Array.isArray(firstValue) && firstValue.length > 0) {
          // ✅ key + value together
          setErrorMessage([`${firstKey}: ${firstValue[0]}`]);
        } else if (typeof firstValue === 'string') {
          setErrorMessage([`${firstKey}: ${firstValue}`]);
        } else {
          setErrorMessage(['Something went wrong. Please try again.']);
        }
      } else {
        setErrorMessage(['Something went wrong. Please try again later.']);
      }
    }
  };

  // Filter out the current team and its descendants from parent options
  const getAvailableParentTeams = () => {
    if (!team) return teams;

    const excludeTeamIds = new Set([team.id]);

    // Add all descendant teams to exclude list
    const addDescendants = (teamId: number) => {
      teams.forEach(t => {
        if (t.parent_team_id === teamId) {
          excludeTeamIds.add(t.id);
          addDescendants(t.id);
        }
      });
    };

    addDescendants(team.id);

    return teams.filter(t => !excludeTeamIds.has(t.id));
  };

  if (!isOpen || !team) return null;

  const availableParentTeams = getAvailableParentTeams();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Edit Team
            </h2>
          </div>
          <button
            onClick={() => { onClose(), setErrorMessage([]) }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Team Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Team Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              placeholder="Enter team name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
            )}
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
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter team description"
            />
          </div>

          {/* Team Head */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Team Head *
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                name="team_head"
                value={formData.team_head}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.team_head ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
              >
                <option value="">Select team head</option>
                {users.map(user => (
                  <option key={user.id} value={user.id.toString()}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            </div>
            {errors.team_head && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.team_head}</p>
            )}
          </div>

          {/* Parent Team */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Parent Team
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                name="parent_team_id"
                value={formData.parent_team_id}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.parent_team_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
              >
                <option value="">No parent team (Root level)</option>
                {availableParentTeams.map(parentTeam => (
                  <option key={parentTeam.id} value={parentTeam.id.toString()}>
                    {parentTeam.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.parent_team_id && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.parent_team_id}</p>
            )}
          </div>

          {/* Current Team Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Current Team Info</h4>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p><span className="font-medium">Members:</span> {team.members?.length || 0}</p>
              <p><span className="font-medium">Created:</span> {new Date(team.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {errorMessage?.length > 0 && (
            <div className="mb-1 flex justify-end rounded text-sm text-red-700">
              {errorMessage?.map((msg, i) => (
                <div key={i}>{msg}</div>
              ))}
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => { onClose(), setErrorMessage([]) }}
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
              Update Team
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
