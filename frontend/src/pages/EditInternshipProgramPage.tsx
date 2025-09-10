import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { InternshipProgram } from '../types/internship';
import { ProgramStatus } from '../types/internship';
import { useAuth } from '../contexts/AuthProvider';
import { UserRole } from '../types/auth';
import api from '../api/axios';
import {
  PlusIcon,
  MinusIcon,
  XMarkIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

interface CustomQuestion {
  question: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox';
  options?: string[];
  required: boolean;
}

const EditInternshipProgramPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    location: '',
    duration: 3,
    startDate: '',
    endDate: '',
    applicationDeadline: '',
    maxApplicants: 10,
    requirements: [''],
    skills: [''],
    benefits: [''],
    stipend: '',
    isRemote: false,
    status: ProgramStatus.DRAFT,
    publicSlug: ''
  });

  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);

  useEffect(() => {
    if (user && (user.role === UserRole.ADMIN || user.role === UserRole.HR) && id) {
      fetchProgram();
    }
  }, [user, id]);

  const fetchProgram = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/internship-programs/${id}`);
      const program: InternshipProgram = response.data;
      
      setFormData({
        title: program.title,
        description: program.description,
        department: program.department,
        location: program.location,
        duration: program.duration,
        startDate: new Date(program.startDate).toISOString().split('T')[0],
        endDate: new Date(program.endDate).toISOString().split('T')[0],
        applicationDeadline: new Date(program.applicationDeadline).toISOString().split('T')[0],
        maxApplicants: program.maxApplicants,
        requirements: program.requirements.length > 0 ? program.requirements : [''],
        skills: program.skills.length > 0 ? program.skills : [''],
        benefits: program.benefits.length > 0 ? program.benefits : [''],
        stipend: program.stipend ? program.stipend.toString() : '',
        isRemote: program.isRemote,
        status: program.status,
        publicSlug: program.publicSlug
      });

      setCustomQuestions(program.applicationForm.customQuestions || []);
    } catch (error: any) {
      console.error('Error fetching program:', error);
      setError('Failed to fetch program details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {      const applicationForm = {
        requiredFields: ['name', 'email', 'phone', 'university', 'major', 'graduationYear', 'resume'],
        optionalFields: ['gpa', 'coverLetter', 'portfolio', 'linkedIn', 'github'],
        customQuestions
      };

      const programData = {
        ...formData,
        stipend: formData.stipend ? parseFloat(formData.stipend) : undefined,
        requirements: formData.requirements.filter(r => r.trim()),
        skills: formData.skills.filter(s => s.trim()),
        benefits: formData.benefits.filter(b => b.trim()),
        applicationForm
      };

      await api.put(`/internship-programs/${id}`, programData);
      navigate(`/dashboard/internships/programs/${id}`);
    } catch (error: any) {
      console.error('Error updating program:', error);
      alert(error.response?.data?.message || 'Failed to update program');
    } finally {
      setSaving(false);
    }
  };

  const addArrayField = (field: 'requirements' | 'skills' | 'benefits') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const updateArrayField = (field: 'requirements' | 'skills' | 'benefits', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const removeArrayField = (field: 'requirements' | 'skills' | 'benefits', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const addCustomQuestion = () => {
    setCustomQuestions(prev => [...prev, {
      question: '',
      type: 'text',
      required: false
    }]);
  };

  const updateCustomQuestion = (index: number, field: keyof CustomQuestion, value: any) => {
    setCustomQuestions(prev => prev.map((q, i) => 
      i === index ? { ...q, [field]: value } : q
    ));
  };

  const removeCustomQuestion = (index: number) => {
    setCustomQuestions(prev => prev.filter((_, i) => i !== index));
  };

  if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.HR)) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
        <p className="text-gray-600 mt-2">You don't have permission to edit this program.</p>
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
            to={`/dashboard/internships/programs/${id}`}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Back to Program
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Program</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Program Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              <input
                type="text"
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                Duration (months) *
              </label>
              <input
                type="number"
                id="duration"
                min="1"
                max="12"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="maxApplicants" className="block text-sm font-medium text-gray-700 mb-1">
                Max Applicants *
              </label>
              <input
                type="number"
                id="maxApplicants"
                min="1"
                value={formData.maxApplicants}
                onChange={(e) => setFormData({ ...formData, maxApplicants: parseInt(e.target.value) })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="stipend" className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Stipend ($)
              </label>
              <input
                type="number"
                id="stipend"
                min="0"
                step="0.01"
                value={formData.stipend}
                onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProgramStatus })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >                
              {Object.values(ProgramStatus).map((status: string) => (
                  <option key={status} value={status}>
                    {status === ProgramStatus.DRAFT ? 'Draft (Not visible to public)' :
                     status === ProgramStatus.ACTIVE ? 'Active (Accepting applications)' :
                     status === ProgramStatus.PAUSED ? 'Paused (Temporarily closed)' :
                     status === ProgramStatus.CLOSED ? 'Closed (No longer accepting)' :
                     status === ProgramStatus.ARCHIVED ? 'Archived (Completed)' :
                     status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {formData.status === ProgramStatus.ACTIVE 
                  ? "⚠️ Program is publicly accessible and students can apply" 
                  : formData.status === ProgramStatus.DRAFT
                  ? "Program is in draft mode and not visible to public"
                  : formData.status === ProgramStatus.PAUSED
                  ? "Program is paused and not accepting new applications"
                  : formData.status === ProgramStatus.CLOSED
                  ? "Program is closed and no longer accepting applications"
                  : "Program is archived and completed"
                }
              </p>
            </div>

            <div>
              <label htmlFor="publicSlug" className="block text-sm font-medium text-gray-700 mb-1">
                Public URL Slug
              </label>
              <input
                type="text"
                id="publicSlug"
                value={formData.publicSlug}
                onChange={(e) => setFormData({ ...formData, publicSlug: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Leave empty to auto-generate"
              />
              <p className="text-xs text-gray-500 mt-1">
                URL: {window.location.origin}/apply/{formData.publicSlug || 'auto-generated'}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center">
              <input
                id="isRemote"
                type="checkbox"
                checked={formData.isRemote}
                onChange={(e) => setFormData({ ...formData, isRemote: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isRemote" className="ml-2 block text-sm text-gray-700">
                Remote internship
              </label>
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Important Dates</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="applicationDeadline" className="block text-sm font-medium text-gray-700 mb-1">
                Application Deadline *
              </label>
              <input
                type="date"
                id="applicationDeadline"
                value={formData.applicationDeadline}
                onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Program Start Date *
              </label>
              <input
                type="date"
                id="startDate"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                Program End Date *
              </label>
              <input
                type="date"
                id="endDate"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Requirements, Skills, Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(['requirements', 'skills', 'benefits'] as const).map((field) => (
            <div key={field} className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">{field}</h3>
              
              <div className="space-y-3">
                {formData[field].map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateArrayField(field, index, e.target.value)}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder={`Enter ${field.slice(0, -1)}`}
                    />
                    {formData[field].length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField(field, index)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <MinusIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => addArrayField(field)}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add {field.slice(0, -1)}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Questions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Custom Application Questions</h2>
          
          <div className="space-y-4">
            {customQuestions.map((question, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Question {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeCustomQuestion(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Question Text</label>
                    <input
                      type="text"
                      value={question.question}
                      onChange={(e) => updateCustomQuestion(index, 'question', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter your question"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Question Type</label>
                    <select
                      value={question.type}
                      onChange={(e) => updateCustomQuestion(index, 'type', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="text">Text</option>
                      <option value="textarea">Long Text</option>
                      <option value="select">Dropdown</option>
                      <option value="radio">Radio Buttons</option>
                      <option value="checkbox">Checkboxes</option>
                    </select>
                  </div>
                </div>
                
                {(question.type === 'select' || question.type === 'radio' || question.type === 'checkbox') && (
                  <div className="mt-3">
                    <label className="block text-sm text-gray-600 mb-1">Options (one per line)</label>
                    <textarea
                      rows={3}
                      value={question.options?.join('\n') || ''}
                      onChange={(e) => updateCustomQuestion(index, 'options', e.target.value.split('\n').filter(o => o.trim()))}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Option 1&#10;Option 2&#10;Option 3"
                    />
                  </div>
                )}
                
                <div className="mt-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={question.required}
                      onChange={(e) => updateCustomQuestion(index, 'required', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">Required question</span>
                  </label>
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addCustomQuestion}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Custom Question
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Link
            to={`/dashboard/internships/programs/${id}`}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditInternshipProgramPage;
