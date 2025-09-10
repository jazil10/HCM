import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { InternshipProgram } from '../types/internship';
import { ProgramStatus } from '../types/internship';
import { useAuth } from '../contexts/AuthProvider';
import { UserRole } from '../types/auth';
import api from '../api/axios';
import {
  PencilIcon,
  TrashIcon,
  ClipboardIcon,
  CalendarIcon,
  UserGroupIcon,
  MapPinIcon,
  BanknotesIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const InternshipProgramDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [program, setProgram] = useState<InternshipProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && (user.role === UserRole.ADMIN || user.role === UserRole.HR) && id) {
      fetchProgram();
    }
  }, [user, id]);

  const fetchProgram = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/internship-programs/${id}`);
      setProgram(response.data);
    } catch (error: any) {
      console.error('Error fetching program:', error);
      setError('Failed to fetch program details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!program || !window.confirm('Are you sure you want to delete this program?')) {
      return;
    }

    try {
      await api.delete(`/internship-programs/${program._id}`);
      navigate('/dashboard/internships');
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
      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

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

  if (error || !program) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Program Not Found</h1>
        <p className="text-gray-600 mt-2">{error || 'The requested program could not be found.'}</p>
        <Link
          to="/dashboard/internships"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" />
          Back to Programs
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/dashboard/internships"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Back to Programs
          </Link>
        </div>
        <div className="flex space-x-3">
          <Link
            to={`/dashboard/internships/programs/${program._id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <PencilIcon className="-ml-1 mr-2 h-5 w-5" />
            Edit
          </Link>
          {user.role === UserRole.ADMIN && (
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
            >
              <TrashIcon className="-ml-1 mr-2 h-5 w-5" />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Program Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{program.title}</h1>
            <p className="text-lg text-gray-600">{program.department}</p>
          </div>
          {getStatusBadge(program.status)}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center text-gray-600">
            <MapPinIcon className="h-5 w-5 mr-2" />
            <span>{program.location} {program.isRemote && '(Remote)'}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <CalendarIcon className="h-5 w-5 mr-2" />
            <span>{program.duration} months</span>
          </div>
          <div className="flex items-center text-gray-600">
            <UserGroupIcon className="h-5 w-5 mr-2" />
            <span>{program.currentApplicants}/{program.maxApplicants} applicants</span>
          </div>
          {program.stipend && (
            <div className="flex items-center text-gray-600">
              <BanknotesIcon className="h-5 w-5 mr-2" />
              <span>${program.stipend}/month</span>
            </div>
          )}
        </div>
      </div>

      {/* Program Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Description and Details */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Program Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap mb-6">{program.description}</p>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Start Date</h3>
              <p className="text-gray-700">{new Date(program.startDate).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">End Date</h3>
              <p className="text-gray-700">{new Date(program.endDate).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Application Deadline</h3>
              <p className="text-gray-700">{new Date(program.applicationDeadline).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Requirements and Skills */}
        <div className="space-y-6">
          {program.requirements.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
              <ul className="space-y-2">
                {program.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span className="text-gray-700">{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {program.skills.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {program.skills.map((skill, index) => (
                  <span key={index} className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {program.benefits.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Benefits</h2>
              <ul className="space-y-2">
                {program.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Application Form Configuration */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Application Form Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Required Fields</h3>
            <div className="flex flex-wrap gap-2">
              {program.applicationForm.requiredFields.map((field, index) => (
                <span key={index} className="inline-flex px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800">
                  {field}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Optional Fields</h3>
            <div className="flex flex-wrap gap-2">
              {program.applicationForm.optionalFields.map((field, index) => (
                <span key={index} className="inline-flex px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">
                  {field}
                </span>
              ))}
            </div>
          </div>
        </div>

        {program.applicationForm.customQuestions.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Custom Questions</h3>
            <div className="space-y-3">
              {program.applicationForm.customQuestions.map((question, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{question.question}</span>
                    <div className="flex space-x-2">
                      <span className="inline-flex px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                        {question.type}
                      </span>
                      {question.required && (
                        <span className="inline-flex px-2 py-1 text-xs rounded bg-red-100 text-red-800">
                          Required
                        </span>
                      )}
                    </div>
                  </div>
                  {question.options && question.options.length > 0 && (
                    <div className="text-xs text-gray-600">
                      Options: {question.options.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Public Application URL */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Public Application URL</h2>
        <div className="flex items-center space-x-3">
          <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm">
            {window.location.origin}/apply/{program.publicSlug}
          </code>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/apply/${program.publicSlug}`);
              alert('URL copied to clipboard!');
            }}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
          >
            Copy URL
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex space-x-4">
          <Link
            to={`/dashboard/internships/applications?program=${program._id}`}
            className="inline-flex items-center px-4 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
          >
            <ClipboardIcon className="-ml-1 mr-2 h-5 w-5" />
            View Applications ({program.currentApplicants})
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InternshipProgramDetailsPage;
