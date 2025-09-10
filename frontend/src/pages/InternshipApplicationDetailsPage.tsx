import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { InternshipApplication } from '../types/internship';
import { useAuth } from '../contexts/AuthProvider';
import { UserRole } from '../types/auth';
import api from '../api/axios';
import {
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  AcademicCapIcon,
  DocumentIcon,
  LinkIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
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
      return <CheckCircleIcon className="h-5 w-5" />;
    case ApplicationStatus.REJECTED:
    case ApplicationStatus.OFFER_DECLINED:
    case ApplicationStatus.WITHDRAWN:
      return <XCircleIcon className="h-5 w-5" />;
    default:
      return <ClockIcon className="h-5 w-5" />;
  }
};

const InternshipApplicationDetailsPage: React.FC = () => {  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [application, setApplication] = useState<InternshipApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);

  useEffect(() => {
    if (user && (user.role === UserRole.ADMIN || user.role === UserRole.HR) && id) {
      fetchApplication();
    }
  }, [user, id]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/internship-applications/${id}`);
      setApplication(response.data);
    } catch (error: any) {
      console.error('Error fetching application:', error);
      setError('Failed to fetch application details');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: ApplicationStatus) => {
    try {
      setUpdatingStatus(true);
      await api.put(`/internship-applications/${id}/status`, { status: newStatus });
      setApplication(prev => prev ? { ...prev, status: newStatus, lastStatusUpdate: new Date().toISOString() } : null);
    } catch (error: any) {
      console.error('Error updating status:', error);
      alert(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;

    try {
      setAddingComment(true);
      await api.post(`/internship-applications/${id}/comments`, {
        comment: newComment.trim(),
        isInternal: true
      });
      
      setNewComment('');
      // Refresh application to get the new comment
      await fetchApplication();
    } catch (error: any) {
      console.error('Error adding comment:', error);
      alert(error.response?.data?.message || 'Failed to add comment');
    } finally {
      setAddingComment(false);
    }
  };

  if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.HR)) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
        <p className="text-gray-600 mt-2">You don't have permission to view this application.</p>
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

  if (error || !application) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Error</h1>
        <p className="text-gray-600 mt-2">{error}</p>
        <Link
          to="/dashboard/internships/applications"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" />
          Back to Applications
        </Link>
      </div>
    );
  }

  const programInfo = typeof application.program === 'string' 
    ? { title: 'Unknown Program', department: 'Unknown Department' }
    : application.program;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/dashboard/internships/applications"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Back to Applications
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Application Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Applicant Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Applicant Information</h2>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status as ApplicationStatus)}`}>
                {getStatusIcon(application.status as ApplicationStatus)}
                <span className="ml-2">
                  {application.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="text-lg font-medium text-gray-900">{application.name}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900">
                      <a href={`mailto:${application.email}`} className="text-blue-600 hover:text-blue-800">
                        {application.email}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-gray-900">
                      <a href={`tel:${application.phone}`} className="text-blue-600 hover:text-blue-800">
                        {application.phone}
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <AcademicCapIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">University</p>
                    <p className="text-gray-900">{application.university}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <AcademicCapIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Major</p>
                    <p className="text-gray-900">{application.major}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Graduation Year</p>
                    <p className="text-gray-900">{application.graduationYear}</p>
                  </div>
                </div>

                {application.gpa && (
                  <div className="flex items-center space-x-3">
                    <StarIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">GPA</p>
                      <p className="text-gray-900">{application.gpa}/4.0</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Links */}
            {(application.portfolio || application.linkedIn || application.github) && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Links & Portfolio</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {application.portfolio && (
                    <a
                      href={application.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                    >
                      <LinkIcon className="h-4 w-4" />
                      <span>Portfolio</span>
                    </a>
                  )}
                  {application.linkedIn && (
                    <a
                      href={application.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                    >
                      <LinkIcon className="h-4 w-4" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {application.github && (
                    <a
                      href={application.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                    >
                      <LinkIcon className="h-4 w-4" />
                      <span>GitHub</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Resume */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Resume</h3>
                <a
                  href={`${api.defaults.baseURL?.replace('/api', '')}/${application.resume}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <DocumentIcon className="h-4 w-4 mr-2" />
                  View Resume
                </a>
              </div>
            </div>

            {/* Cover Letter */}
            {application.coverLetter && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Cover Letter</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{application.coverLetter}</p>
                </div>
              </div>
            )}

            {/* Custom Responses */}
            {application.customResponses && application.customResponses.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Responses</h3>
                <div className="space-y-4">
                  {application.customResponses.map((response, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <p className="font-medium text-gray-900 mb-2">{response.question}</p>
                      <p className="text-gray-700">
                        {Array.isArray(response.answer) 
                          ? response.answer.join(', ') 
                          : response.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Program Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Program</p>
                <p className="font-medium text-gray-900">{programInfo.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="text-gray-900">{programInfo.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Applied Date</p>
                <p className="text-gray-900">{new Date(application.appliedDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="text-gray-900">{new Date(application.lastStatusUpdate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Status Management */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>
            <div className="space-y-3">
              {Object.values(ApplicationStatus).map(status => (
                <button
                  key={status}
                  onClick={() => updateStatus(status)}
                  disabled={updatingStatus || application.status === status}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    application.status === status
                      ? 'bg-blue-100 text-blue-800 cursor-default'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  } disabled:opacity-50`}
                >
                  {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Internal Notes</h3>
            
            {/* Add Comment */}
            <div className="mb-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add an internal note..."
                rows={3}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                onClick={addComment}
                disabled={addingComment || !newComment.trim()}
                className="mt-2 w-full inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                {addingComment ? 'Adding...' : 'Add Note'}
              </button>
            </div>

            {/* Comments List */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {application.comments && application.comments.length > 0 ? (
                application.comments
                  .filter(comment => comment.isInternal)
                  .map((comment) => (
                    <div key={comment._id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-900">{comment.user.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(comment.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-sm text-gray-700">{comment.comment}</p>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-gray-500 italic">No internal notes yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternshipApplicationDetailsPage;
