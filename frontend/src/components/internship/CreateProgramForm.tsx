import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgramStatus } from '../../types/internship';
import api from '../../api/axios';
import {
  PlusIcon,
  MinusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface CustomQuestion {
  question: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox';
  options?: string[];
  required: boolean;
}

const CreateProgramForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
    status: ProgramStatus.DRAFT
  });

  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation for ACTIVE status
      if (formData.status === ProgramStatus.ACTIVE) {
        const now = new Date();
        const deadline = new Date(formData.applicationDeadline);
        
        if (deadline <= now) {
          alert('Cannot set program to ACTIVE: Application deadline must be in the future');
          setLoading(false);
          return;
        }
      }      const applicationForm = {
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

      console.log('Creating program with data:', programData);
      const response = await api.post('/internship-programs', programData);
      console.log('Program created successfully:', response.data);
      
      navigate('/dashboard/internships');
    } catch (error: any) {
      console.error('Error creating program:', error);
      alert(error.response?.data?.message || 'Failed to create program');
    } finally {
      setLoading(false);
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

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Create Internship Program</h1>          <p className="mt-1 text-sm text-gray-600">
            Fill in the details below to create a new internship program with a public application form.
          </p>
          {formData.title && (
            <div className="mt-3 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Public Application URL will be:</strong><br />
                <code className="text-xs bg-white px-2 py-1 rounded">
                  {window.location.origin}/apply/{formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}-{Date.now()}
                </code>
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Program Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., Software Engineering Intern"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., Engineering"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., San Francisco, CA"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (months) *
              </label>
              <input
                type="number"
                required
                min="1"
                max="12"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Application Deadline *
              </label>
              <input
                type="date"
                required
                value={formData.applicationDeadline}
                onChange={(e) => setFormData(prev => ({ ...prev, applicationDeadline: e.target.value }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Applicants *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.maxApplicants}
                onChange={(e) => setFormData(prev => ({ ...prev, maxApplicants: parseInt(e.target.value) }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Stipend ($)
              </label>
              <input
                type="number"
                min="0"
                value={formData.stipend}
                onChange={(e) => setFormData(prev => ({ ...prev, stipend: e.target.value }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Optional"
              />
            </div>            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ProgramStatus }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value={ProgramStatus.DRAFT}>Draft (Not visible to public)</option>
                <option value={ProgramStatus.ACTIVE}>Active (Accepting applications)</option>
                <option value={ProgramStatus.PAUSED}>Paused (Temporarily closed)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {formData.status === ProgramStatus.ACTIVE 
                  ? "⚠️ Program will be publicly accessible and students can apply" 
                  : formData.status === ProgramStatus.DRAFT
                  ? "Program is in draft mode and not visible to public"
                  : "Program is paused and not accepting new applications"
                }
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Describe the internship program, responsibilities, and what interns will learn..."
            />
          </div>

          {/* Remote Work */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isRemote"
              checked={formData.isRemote}
              onChange={(e) => setFormData(prev => ({ ...prev, isRemote: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isRemote" className="ml-2 block text-sm text-gray-900">
              This is a remote internship
            </label>
          </div>          {/* Dynamic Arrays */}
          {['requirements', 'skills', 'benefits'].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              {(formData[field as 'requirements' | 'skills' | 'benefits'] as string[]).map((item: string, index: number) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateArrayField(field as any, index, e.target.value)}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder={`Add ${field.slice(0, -1)}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayField(field as any, index)}
                    className="ml-2 p-1 text-red-600 hover:text-red-800"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayField(field as any)}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add {field.slice(0, -1)}
              </button>
            </div>
          ))}

          {/* Custom Questions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Custom Application Questions</h3>
              <button
                type="button"
                onClick={addCustomQuestion}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Question
              </button>
            </div>

            {customQuestions.map((question, index) => (
              <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-md font-medium text-gray-900">Question {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeCustomQuestion(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question Text
                    </label>
                    <input
                      type="text"
                      value={question.question}
                      onChange={(e) => updateCustomQuestion(index, 'question', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter your question"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Answer Type
                    </label>
                    <select
                      value={question.type}
                      onChange={(e) => updateCustomQuestion(index, 'type', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="text">Short Text</option>
                      <option value="textarea">Long Text</option>
                      <option value="select">Dropdown</option>
                      <option value="radio">Multiple Choice</option>
                      <option value="checkbox">Checkboxes</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={question.required}
                      onChange={(e) => updateCustomQuestion(index, 'required', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Required
                    </label>
                  </div>

                  {(question.type === 'select' || question.type === 'radio' || question.type === 'checkbox') && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Options (one per line)
                      </label>
                      <textarea
                        rows={3}
                        value={question.options?.join('\n') || ''}
                        onChange={(e) => updateCustomQuestion(index, 'options', e.target.value.split('\n').filter(o => o.trim()))}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Option 1&#10;Option 2&#10;Option 3"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/dashboard/internships')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Program'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProgramForm;
