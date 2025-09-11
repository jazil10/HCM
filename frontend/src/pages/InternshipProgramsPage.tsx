import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { InternshipProgram } from '../types/internship';
import { ProgramStatus } from '../types/internship';
import { useAuth } from '../contexts/AuthProvider';
import { UserRole } from '../types/auth';
import api from '../api/axios';
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClipboardIcon,
  CalendarIcon,
  UserGroupIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const InternshipProgramsPage: React.FC = () => {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<InternshipProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    department: '',
    search: ''
  });

  useEffect(() => {
    if (user && (user.role === UserRole.ADMIN || user.role === UserRole.HR)) {
      fetchPrograms();
    }
  }, [user, filters]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.department) params.append('department', filters.department);
      
      const response = await api.get(`/internship-programs?${params.toString()}`);
      setPrograms(response.data.programs || []);
    } catch (error: any) {
      console.error('Error fetching programs:', error);
      setError('Failed to fetch internship programs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (programId: string) => {
    if (!window.confirm('Are you sure you want to delete this program?')) {
      return;
    }

    try {
      await api.delete(`/internship-programs/${programId}`);
      setPrograms(programs.filter(p => p._id !== programId));
    } catch (error: any) {
      console.error('Error deleting program:', error);
      alert(error.response?.data?.message || 'Failed to delete program');
    }
  };

  const getStatusBadge = (status: ProgramStatus) => {
    const statusConfig = {
      [ProgramStatus.DRAFT]: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      [ProgramStatus.ACTIVE]: { color: 'bg-green-100 text-green-800', label: 'Active' },
      [ProgramStatus.PAUSED]: { color: 'bg-yellow-100 text-yellow-800', label: 'Paused' },
      [ProgramStatus.CLOSED]: { color: 'bg-red-100 text-red-800', label: 'Closed' },
      [ProgramStatus.ARCHIVED]: { color: 'bg-gray-100 text-gray-800', label: 'Archived' }
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = !filters.search || 
      program.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      program.department.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesSearch;
  });

  const departments = [...new Set(programs.map(p => p.department))];

  if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.HR)) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
        <p className="text-gray-600 mt-2">You don't have permission to view this page.</p>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Internship Programs</h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage your company's internship programs and track applications.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/dashboard/internships/programs/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Create Program
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search programs..."
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              {Object.values(ProgramStatus).map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              id="department"
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: '', department: '', search: '' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Programs Grid */}
      {filteredPrograms.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <ClipboardIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No programs found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filters.search || filters.status || filters.department 
              ? 'Try adjusting your filters or search terms.'
              : 'Get started by creating a new internship program.'
            }
          </p>
          {!filters.search && !filters.status && !filters.department && (
            <div className="mt-6">
              <Link
                to="/dashboard/internships/programs/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Create Program
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((program) => (
            <div key={program._id} className="card p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                    {program.title}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">{program.department}</p>
                </div>
                <div className="flex-shrink-0 ml-3">
                  {getStatusBadge(program.status)}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">
                    {program.location} {program.isRemote && '(Remote)'}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{program.duration} months</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <UserGroupIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{program.currentApplicants}/{program.maxApplicants} applicants</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: `${Math.min((program.currentApplicants / program.maxApplicants) * 100, 100)}%` 
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Applications: {program.currentApplicants}/{program.maxApplicants}
                </p>
              </div>

              <div className="text-sm text-gray-600 mb-4 space-y-1">
                <div>
                  <span className="font-medium">Deadline:</span>{' '}
                  <span>{new Date(program.applicationDeadline).toLocaleDateString()}</span>
                </div>
                {program.stipend && (
                  <div>
                    <span className="font-medium">Stipend:</span>{' '}
                    <span>${program.stipend}/month</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Link
                    to={`/dashboard/internships/programs/${program._id}`}
                    className="btn-secondary flex-1 text-xs py-2 flex items-center justify-center"
                  >
                    <EyeIcon className="h-3 w-3 mr-1" />
                    View
                  </Link>
                  <Link
                    to={`/dashboard/internships/programs/${program._id}/edit`}
                    className="btn-primary flex-1 text-xs py-2 flex items-center justify-center"
                  >
                    <PencilIcon className="h-3 w-3 mr-1" />
                    Edit
                  </Link>
                </div>
                
                <div className="flex space-x-2">
                  <Link
                    to={`/dashboard/internships/applications?program=${program._id}`}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-blue-300 shadow-sm text-xs font-medium rounded text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    <ClipboardIcon className="h-3 w-3 mr-1" />
                    Applications
                  </Link>
                  {user.role === UserRole.ADMIN && (
                    <button
                      onClick={() => handleDelete(program._id)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      <TrashIcon className="h-3 w-3 mr-1" />
                      Delete
                    </button>
                  )}
                </div>

                {/* Public Link */}
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-2">Public Application URL:</p>
                  <div className="flex items-center space-x-2">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 truncate min-w-0">
                      {window.location.origin}/apply/{program.publicSlug}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/apply/${program.publicSlug}`);
                        alert('URL copied to clipboard!');
                      }}
                      className="flex-shrink-0 text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InternshipProgramsPage;
