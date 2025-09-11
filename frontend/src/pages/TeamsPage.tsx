import { useEffect, useState } from 'react';
import { PlusIcon, UsersIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import type { Team } from '../types/team';
import { UserRole } from '../types/auth';
import { useAuth } from '../contexts/AuthProvider';
import CreateTeamModal from '../components/teams/CreateTeamModal';
import EditTeamModal from '../components/teams/EditTeamModal';
import { usePageTitle } from '../hooks/usePageTitle';

function AccessDenied() {
  return (
    <div className="text-center py-12">
      <h3 className="text-2xl font-bold text-red-600">Access Denied</h3>
      <p className="mt-2 text-lg text-gray-600">
        You do not have permission to view this page.
      </p>
    </div>
  );
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const { user } = useAuth();
  
  usePageTitle('Teams');

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await api.get('/teams');
      setTeams(response.data);
    } catch (err) {
      setError('Failed to fetch teams.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === UserRole.ADMIN || user.role === UserRole.HR)) {
      fetchTeams();
    }
  }, [user]);

  const handleTeamCreated = () => {
    fetchTeams();
  };

  const handleTeamUpdated = () => {
    fetchTeams();
  };

  const openEditModal = (team: Team) => {
    setSelectedTeam(team);
    setIsEditModalOpen(true);
  };

  if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.HR)) {
    return <AccessDenied />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
          <p className="mt-2 text-lg text-gray-600">
            Organize and manage your company teams effectively.
          </p>
        </div>
        {user?.role === UserRole.ADMIN && (
          <div className="mt-4 sm:mt-0">
            <button className="btn-primary" onClick={() => setIsCreateModalOpen(true)}>
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Team
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <span className="text-primary-600 font-bold">{teams.length}</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Teams</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold">
                  {teams.reduce((total, team) => total + team.members.length, 0)}
                </span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Members</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold">
                  {teams.length > 0 ? Math.round(teams.reduce((total, team) => total + team.members.length, 0) / teams.length) : 0}
                </span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Team Size</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      {/* Teams Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <div key={team._id} className="card p-6 block hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
              <div className="flex items-center text-sm text-gray-500">
                <UsersIcon className="h-4 w-4 mr-1" />
                {team.members.length}
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Manager</p>
                <div className="flex items-center mt-1">
                  <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {team.manager.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{team.manager.name}</p>
                    <p className="text-xs text-gray-500">{team.manager.email}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Members</p>                <div className="space-y-1">
                  {team.members.slice(0, 3).map((member) => (
                    <div key={member._id} className="flex items-center">
                      <div className="h-6 w-6 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-white">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <p className="ml-2 text-sm text-gray-900">{member.name}</p>
                    </div>
                  ))}
                  {team.members.length > 3 && (
                    <p className="text-xs text-gray-500 ml-8">
                      +{team.members.length - 3} more members
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex space-x-2">
              <Link to={`/dashboard/teams/${team._id}`} className="btn-secondary flex-1 text-sm py-2">
                View Details
              </Link>
              {(user?.role === UserRole.ADMIN || user?._id === team.manager._id) && (
                <button 
                  className="btn-primary flex-1 text-sm py-2" 
                  onClick={(e) => {
                    e.preventDefault();
                    openEditModal(team);
                  }}
                >
                  Manage
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {teams.length === 0 && !loading && (
        <div className="text-center py-12">
          <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No teams</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new team.</p>
          {user?.role === UserRole.ADMIN && (
            <div className="mt-6">
              <button className="btn-primary" onClick={() => setIsCreateModalOpen(true)}>
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Team
              </button>
            </div>
          )}
        </div>
      )}

      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTeamCreated={handleTeamCreated}
      />
      <EditTeamModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        team={selectedTeam}
        onTeamUpdated={handleTeamUpdated}
      />
    </div>
  );
}