import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { InternshipApplication, InternshipProgram } from '../types/internship';
import { useAuth } from '../contexts/AuthProvider';
import { UserRole } from '../types/auth';
import api from '../api/axios';
import {
  EyeIcon,
  DocumentIcon,
  CalendarIcon,
  UserIcon,
  AcademicCapIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

enum ApplicationStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  SHORTLISTED = 'shortlisted',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  INTERVIEWED = 'interviewed',
  OFFER_EXTENDED = 'offer_extended',
  OFFER_ACCEPTED = 'offer_accepted',
  OFFER_DECLINED = 'offer_declined',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn'
}

const getStatusColor = (status: ApplicationStatus) => {
  switch (status) {
    case ApplicationStatus.SUBMITTED:
      return 'bg-blue-100 text-blue-800';
    case ApplicationStatus.UNDER_REVIEW:
      return 'bg-yellow-100 text-yellow-800';
    case ApplicationStatus.SHORTLISTED:
      return 'bg-purple-100 text-purple-800';
    case ApplicationStatus.INTERVIEW_SCHEDULED:
      return 'bg-indigo-100 text-indigo-800';
    case ApplicationStatus.INTERVIEWED:
      return 'bg-cyan-100 text-cyan-800';
    case ApplicationStatus.OFFER_EXTENDED:
      return 'bg-orange-100 text-orange-800';
    case ApplicationStatus.OFFER_ACCEPTED:
      return 'bg-green-100 text-green-800';
    case ApplicationStatus.OFFER_DECLINED:
      return 'bg-red-100 text-red-800';
    case ApplicationStatus.REJECTED:
      return 'bg-red-100 text-red-800';
    case ApplicationStatus.WITHDRAWN:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: ApplicationStatus) => {
  switch (status) {
    case ApplicationStatus.OFFER_ACCEPTED:
      return <CheckCircleIcon className="h-4 w-4" />;
    case ApplicationStatus.REJECTED:
    case ApplicationStatus.OFFER_DECLINED:
    case ApplicationStatus.WITHDRAWN:
      return <XCircleIcon className="h-4 w-4" />;
    default:
      return <ClockIcon className="h-4 w-4" />;
  }
};

const InternshipApplicationsPage: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [programs, setPrograms] = useState<InternshipProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    if (user && (user.role === UserRole.ADMIN || user.role === UserRole.HR)) {
      fetchData();
    }
  }, [user]);
  const fetchData = async () => {
    try {
      setLoading(true);
      const [applicationsResponse, programsResponse] = await Promise.all([
        api.get('/internship-applications'),
        api.get('/internship-programs')
      ]);
      
      // Handle the backend response structure that includes pagination
      const applicationsData = applicationsResponse.data.applications || applicationsResponse.data;
      const programsData = programsResponse.data.programs || programsResponse.data;
      
      setApplications(applicationsData);
      setPrograms(programsData);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch applications data');
    } finally {
      setLoading(false);
    }
  };
  const filteredApplications = applications.filter(app => {
    const programId = typeof app.program === 'string' ? app.program : app.program._id;
    const programMatch = selectedProgram === 'all' || programId === selectedProgram;
    const statusMatch = selectedStatus === 'all' || app.status === selectedStatus;
    return programMatch && statusMatch;
  });

  if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.HR)) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
        <p className="text-gray-600 mt-2">You don't have permission to view applications.</p>
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

  if (error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Error</h1>
        <p className="text-gray-600 mt-2">{error}</p>
        <button
          onClick={fetchData}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Internship Applications</h1>
          <p className="mt-2 text-lg text-gray-600">
            Review and manage applications from students ({applications.length} total)
          </p>
        </div>
        <Link
          to="/dashboard/internships"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <AcademicCapIcon className="-ml-1 mr-2 h-5 w-5" />
          Manage Programs
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-4">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="program-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Program
              </label>
              <select
                id="program-filter"
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All Programs</option>                {programs.map(program => (
                  <option key={program._id} value={program._id}>
                    {program.title} ({applications.filter(app => {
                      const programId = typeof app.program === 'string' ? app.program : app.program._id;
                      return programId === program._id;
                    }).length})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                id="status-filter"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                {Object.values(ApplicationStatus).map(status => (
                  <option key={status} value={status}>
                    {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} 
                    ({applications.filter(app => app.status === status).length})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {applications.length === 0 
              ? "No applications have been submitted yet." 
              : "Try adjusting your filters to see more applications."}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Academic Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.map((application) => (
                  <tr key={application._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{application.name}</div>
                          <div className="text-sm text-gray-500 flex items-center space-x-2">
                            <EnvelopeIcon className="h-3 w-3" />
                            <span>{application.email}</span>
                          </div>
                          <div className="text-sm text-gray-500 flex items-center space-x-2">
                            <PhoneIcon className="h-3 w-3" />
                            <span>{application.phone}</span>
                          </div>
                        </div>
                      </div>
                    </td>                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {typeof application.program === 'string' ? 'Unknown Program' : application.program.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {typeof application.program === 'string' ? 'Unknown Department' : application.program.department}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{application.university}</div>
                      <div className="text-sm text-gray-500">{application.major}</div>
                      <div className="text-sm text-gray-500">Class of {application.graduationYear}</div>
                      {application.gpa && (
                        <div className="text-sm text-gray-500">GPA: {application.gpa}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status as ApplicationStatus)}`}>
                        {getStatusIcon(application.status as ApplicationStatus)}
                        <span className="ml-1">
                          {application.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {new Date(application.appliedDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/dashboard/internships/applications/${application._id}`}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternshipApplicationsPage;
