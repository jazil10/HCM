import { useEffect, useState } from 'react';
import { UserCircleIcon, UsersIcon } from '@heroicons/react/24/outline';
import api from '../api/axios';
import { type Team } from '../types/team';
import { useAuth } from '../contexts/AuthProvider';

export default function MyTeamPage() {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // No need to use user.team for fetching
  // const { user } = useAuth();

  useEffect(() => {
    const fetchMyTeam = async () => {
      try {
        const response = await api.get('/teams/my-team');
        setTeam(response.data);
      } catch (err: any) {
        // Try to show a more specific message if the error is about not being assigned to a team
        const apiMessage = err?.response?.data?.message;
        if (apiMessage && apiMessage.toLowerCase().includes('not assigned to a team')) {
          setError('You are not currently assigned to any team. Please contact your administrator to be assigned to a team.');
        } else {
          setError('Failed to fetch your team details.');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyTeam();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-800">{error}</div>
      </div>
    );
  }
  
  if (!team) {
    return (
      <div className="text-center py-12">
        <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No Team Information</h3>
        <p className="mt-1 text-sm text-gray-500">Could not find team details.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">My Team: {team.name}</h1>
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Team Members ({team.members.length})
        </h3>
        <ul className="divide-y divide-gray-200">
          {team.members.map(member => (
            <li key={member._id} className="py-4 flex items-center">
              <UserCircleIcon className="h-10 w-10 text-gray-400" />
              <div className="ml-3">
                <p className="font-medium text-gray-900">{member.name}</p>
                <p className="text-sm text-gray-500">{member.email}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 