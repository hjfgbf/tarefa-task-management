import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Team, User } from '../types';
import { Building2, Plus, Users, CreditCard as Edit, Trash2, Search, Import as SortAsc } from 'lucide-react';
import { TeamDetailModal } from '../components/UI/TeamDetailModal';
import { EditTeamModal } from '../components/UI/EditTeamModal';
import { CreateTeamModal } from '../components/UI/CreateTeamModal';

export function Teams() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState({ field: 'name', direction: 'asc' as const });
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamDetailModalOpen, setTeamDetailModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editTeamModalOpen, setEditTeamModalOpen] = useState(false);
  const [createTeamModalOpen, setCreateTeamModalOpen] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadData();
    }
  }, [user, searchQuery, sortBy]);

  const loadData = async () => {
    setLoading(true);
    try {
      const searchParams: Record<string, any> = {};
      
      if (searchQuery) {
        searchParams.search = searchQuery;
      }

      const orderField = sortBy.direction === 'asc' ? sortBy.field : `-${sortBy.field}`;
      searchParams.ordering = orderField;

      const [teamsResponse, usersResponse] = await Promise.all([
        apiService.getTeams(searchParams),
        apiService.getUsers()
      ]);

      setTeams(teamsResponse.results || []);
      setUsers(usersResponse.results || []);
    } catch (error) {
      console.error('Failed to load teams data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (team: Team) => {
    if (window.confirm(`Are you sure you want to delete team "${team.name}"?`)) {
      try {
        await apiService.deleteTeam(team.id);
        setTeams(prev => prev.filter(t => t.id !== team.id));
      } catch (error) {
        console.error('Failed to delete team:', error);
        alert('Failed to delete team. Please try again.');
      }
    }
  };

  const handleSortChange = (field: string, direction: any) => {
    setSortBy({ field, direction });
  };

  const handleTeamClick = (team: Team) => {
    setSelectedTeam(team);
    setTeamDetailModalOpen(true);
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    setEditTeamModalOpen(true);
  };

  const handleTeamUpdated = (updatedTeam: Team) => {
    setTeams(prev => prev.map(t => 
      t.id === updatedTeam.id ? updatedTeam : t
    ));
    setEditTeamModalOpen(false);
    setEditingTeam(null);
  };

  const handleTeamCreated = (newTeam: Team) => {
    setTeams(prev => [...prev, newTeam]);
    setCreateTeamModalOpen(false);
  };

  const buildTeamHierarchy = (teams: Team[]): Team[] => {
    const teamMap = new Map<number, Team & { children: Team[] }>();
    const rootTeams: (Team & { children: Team[] })[] = [];

    // Create map with children arrays
    teams.forEach(team => {
      teamMap.set(team.id, { ...team, children: [] });
    });

    // Build hierarchy
    teams.forEach(team => {
      const teamWithChildren = teamMap.get(team.id)!;
      
      if (team.parent_team_id && teamMap.has(team.parent_team_id)) {
        const parentTeam = teamMap.get(team.parent_team_id)!;
        parentTeam.children.push(teamWithChildren);
      } else {
        rootTeams.push(teamWithChildren);
      }
    });

    return rootTeams;
  };

  const renderTeamHierarchy = (teams: (any & { children: any[] })[], level: number = 0): React.ReactNode => {
    return teams.map(team => (
      <div key={team.id}>
        <div 
          className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
            level > 0 ? 'ml-8 border-l-4 border-blue-200 dark:border-blue-800' : ''
          }`}
          onClick={() => handleTeamClick(team)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {team.name}
                    {level > 0 && <span className="text-sm text-gray-500 ml-2">(Sub-team)</span>}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {team.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Team Head
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="h-6 w-6 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                        {team?.team_head_name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {team?.team_head_name}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Members
                  </label>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900 dark:text-white">
                      {team?.member_count || 0} member{(team?.member_count || 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* {team.members && team.members.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Team Members
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {team.members.slice(0, 6).map(member => (
                      <div
                        key={member.id}
                        className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded-full"
                      >
                        <div className="h-4 w-4 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {member.name}
                        </span>
                      </div>
                    ))}
                    {team.members.length > 6 && (
                      <div className="flex items-center bg-gray-100 dark:bg-gray-600 px-3 py-1 rounded-full">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          +{team.members.length - 6} more
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )} */}
            </div>

            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditTeam(team);
                }}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Edit team"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTeam(team);
                }}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Delete team"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {team.children.length > 0 && (
          <div className="mt-4">
            {renderTeamHierarchy(team.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  // Redirect if not admin
  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <Building2 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Access Denied
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Only administrators can manage teams.
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

  const hierarchicalTeams = buildTeamHierarchy(teams);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teams Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage teams and their hierarchical structure ({teams.length} team{teams.length !== 1 ? 's' : ''})
          </p>
        </div>
        
        <button
          onClick={() => setCreateTeamModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Team
        </button>
      </div>

      {/* Search and Sort */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search teams by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <SortAsc className="h-4 w-4 text-gray-500" />
            <select
              value={`${sortBy.field}_${sortBy.direction}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('_');
                handleSortChange(field, direction as 'asc' | 'desc');
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
              <option value="created_at_desc">Created Date (Newest)</option>
              <option value="created_at_asc">Created Date (Oldest)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Teams Hierarchy */}
      <div className="space-y-6">
        {hierarchicalTeams.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <Building2 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No teams found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchQuery ? 'No teams match your search criteria.' : 'Get started by creating your first team.'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setCreateTeamModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Team
              </button>
            )}
          </div>
        ) : (
          renderTeamHierarchy(hierarchicalTeams)
        )}
      </div>

      {/* Team Detail Modal */}
      <TeamDetailModal
        isOpen={teamDetailModalOpen}
        onClose={() => {
          setTeamDetailModalOpen(false);
          setSelectedTeam(null);
        }}
        team={selectedTeam}
      />

      {/* Edit Team Modal */}
      <EditTeamModal
        isOpen={editTeamModalOpen}
        onClose={() => {
          setEditTeamModalOpen(false);
          setEditingTeam(null);
        }}
        team={editingTeam}
        onTeamUpdated={handleTeamUpdated}
      />

      {/* Create Team Modal */}
      <CreateTeamModal
        isOpen={createTeamModalOpen}
        onClose={() => setCreateTeamModalOpen(false)}
        onTeamCreated={handleTeamCreated}
      />
    </div>
  );
}