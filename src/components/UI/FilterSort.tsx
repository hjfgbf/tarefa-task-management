import React from 'react';
import { Search, Filter, Import as SortAsc, X } from 'lucide-react';

interface FilterSortProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  sortBy: { field: string; direction: 'asc' | 'desc' };
  onSortChange: (field: string, direction: 'asc' | 'desc') => void;
  filterOptions: {
    teams?: { id: number; name: string }[];
    statuses?: { value: string; label: string }[];
    priorities?: { value: string; label: string }[];
    users?: { id: number; name: string }[];
  };
  sortOptions: { value: string; label: string }[];
}

export function FilterSort({
  searchQuery,
  onSearchChange,
  filters,
  onFilterChange,
  sortBy,
  onSortChange,
  filterOptions,
  sortOptions
}: FilterSortProps) {
  const clearFilter = (key: string) => {
    onFilterChange(key, '');
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '' && value !== undefined);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Team Filter */}
        {/* {filterOptions.teams && (
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Team:</label>
            <select
              value={filters.team_id || ''}
              onChange={(e) => onFilterChange('team_id', e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Teams</option>
              {filterOptions.teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
            {filters.team_id && (
              <button onClick={() => clearFilter('team_id')} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )} */}

        {/* Status Filter */}
        {/* {filterOptions.statuses && (
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</label>
            <select
              value={filters.status || ''}
              onChange={(e) => onFilterChange('status', e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              {filterOptions.statuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
            {filters.status && (
              <button onClick={() => clearFilter('status')} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )} */}

        {/* Priority Filter */}
        {/* {filterOptions.priorities && (
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority:</label>
            <select
              value={filters.priority || ''}
              onChange={(e) => onFilterChange('priority', e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priorities</option>
              {filterOptions.priorities.map(priority => (
                <option key={priority.value} value={priority.value}>{priority.label}</option>
              ))}
            </select>
            {filters.priority && (
              <button onClick={() => clearFilter('priority')} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )} */}

        {/* Sort */}
        {/* <div className="flex items-center space-x-2">
          <SortAsc className="h-4 w-4 text-gray-500" />
          <select
            value={`${sortBy.field}_${sortBy.direction}`}
            onChange={(e) => {
              const [field, direction] = e.target.value.split('_');
              onSortChange(field, direction as 'asc' | 'desc');
            }}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div> */}

        {/* Clear All Filters */}
        {/* {hasActiveFilters && (
          <button
            onClick={() => {
              Object.keys(filters).forEach(key => clearFilter(key));
            }}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-4 w-4" />
            <span>Clear All</span>
          </button>
        )} */}
      </div>
    </div>
  );
}