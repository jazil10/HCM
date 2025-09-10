import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { InternshipProgram, ApplicationFormData } from '../../types/internship';
import api from '../../api/axios';

const InternshipApplicationForm: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [program, setProgram] = useState<InternshipProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<ApplicationFormData>({
    name: '',
    email: '',
    phone: '',
    university: '',
    major: '',
    graduationYear: new Date().getFullYear() + 1,
    gpa: undefined,
    portfolio: '',
    linkedIn: '',
    github: '',
    coverLetter: '',
    resume: null,
    customResponses: {},
    source: '',
    referredBy: ''
  });

  useEffect(() => {
    if (slug) {
      fetchProgram();
    }
  }, [slug]);

  const fetchProgram = async () => {
    try {
      const response = await api.get(`/internship-programs/public/${slug}`);
      setProgram(response.data);
    } catch (error: any) {
      console.error('Error fetching program:', error);
      setError('Program not found or no longer accepting applications');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'graduationYear' ? parseInt(value) : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, resume: file }));
  };

  const handleCustomResponse = (question: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      customResponses: {
        ...prev.customResponses,
        [question]: value
      }
    }));
  };  const validateForm = (): boolean => {
    if (!program) return false;

    const missingFields: string[] = [];

    // Core fields that are always required by the backend model
    if (!formData.name.trim()) missingFields.push('Name');
    if (!formData.email.trim()) missingFields.push('Email');
    if (!formData.phone.trim()) missingFields.push('Phone');
    if (!formData.university.trim()) missingFields.push('University');
    if (!formData.major.trim()) missingFields.push('Major');
    if (!formData.graduationYear) missingFields.push('Graduation Year');

    // Additional required fields based on program configuration
    const requiredFields = program.applicationForm.requiredFields;
    requiredFields.forEach(field => {
      switch (field) {
        case 'gpa':
          if (!formData.gpa) missingFields.push('GPA');
          break;
        case 'portfolio':
          if (!formData.portfolio?.trim()) missingFields.push('Portfolio');
          break;
        case 'linkedIn':
          if (!formData.linkedIn?.trim()) missingFields.push('LinkedIn');
          break;
        case 'github':
          if (!formData.github?.trim()) missingFields.push('GitHub');
          break;
        case 'coverLetter':
          if (!formData.coverLetter?.trim()) missingFields.push('Cover Letter');
          break;
      }
    });

    if (!formData.resume) {
      missingFields.push('Resume');
    }

    // Check custom questions
    program.applicationForm.customQuestions.forEach(question => {
      if (question.required && !formData.customResponses[question.question]) {
        missingFields.push(`"${question.question}"`);
      }
    });

    if (missingFields.length > 0) {
      setError(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Validate GPA if provided
    if (formData.gpa && (formData.gpa < 0 || formData.gpa > 4.0)) {
      setError('GPA must be between 0.0 and 4.0');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const submitFormData = new FormData();
        // Add basic fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'resume') {
          if (value) {
            submitFormData.append('resume', value as File);
          }
        } else if (key === 'customResponses') {
          // Only send custom responses if there are actual responses
          const responses = value as Record<string, string | string[]>;
          const hasResponses = Object.keys(responses).length > 0 && 
            Object.values(responses).some(v => v && (Array.isArray(v) ? v.length > 0 : v.toString().trim()));
          
          if (hasResponses) {
            submitFormData.append('customResponses', JSON.stringify(value));
          }
        } else if (value !== undefined && value !== null && value !== '') {
          submitFormData.append(key, value.toString());
        }
      });

      await api.post(`/internship-applications/submit/${slug}`, submitFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(true);
    } catch (error: any) {
      console.error('Error submitting application:', error);
      setError(error.response?.data?.message || 'Error submitting application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (fieldName: string, isRequired: boolean) => {
    const commonProps = {
      required: isRequired,
      className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
    };

    switch (fieldName) {
      case 'name':
        return (
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name {isRequired && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              {...commonProps}
            />
          </div>
        );
      case 'email':
        return (
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address {isRequired && <span className="text-red-500">*</span>}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              {...commonProps}
            />
          </div>
        );
      case 'phone':
        return (
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number {isRequired && <span className="text-red-500">*</span>}
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              {...commonProps}
            />
          </div>
        );
      case 'university':
        return (
          <div>
            <label htmlFor="university" className="block text-sm font-medium text-gray-700">
              University {isRequired && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              id="university"
              name="university"
              value={formData.university}
              onChange={handleInputChange}
              {...commonProps}
            />
          </div>
        );
      case 'major':
        return (
          <div>
            <label htmlFor="major" className="block text-sm font-medium text-gray-700">
              Major/Field of Study {isRequired && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              id="major"
              name="major"
              value={formData.major}
              onChange={handleInputChange}
              {...commonProps}
            />
          </div>
        );
      case 'graduationYear':
        return (
          <div>
            <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-700">
              Expected Graduation Year {isRequired && <span className="text-red-500">*</span>}
            </label>
            <input
              type="number"
              id="graduationYear"
              name="graduationYear"
              min={new Date().getFullYear()}
              max={new Date().getFullYear() + 10}
              value={formData.graduationYear}
              onChange={handleInputChange}
              {...commonProps}
            />
          </div>
        );
      case 'gpa':
        return (
          <div>
            <label htmlFor="gpa" className="block text-sm font-medium text-gray-700">
              GPA {isRequired && <span className="text-red-500">*</span>}
            </label>
            <input
              type="number"
              id="gpa"
              name="gpa"
              step="0.01"
              min="0"
              max="4"
              value={formData.gpa || ''}
              onChange={handleInputChange}
              {...commonProps}
            />
            <p className="mt-1 text-sm text-gray-500">On a 4.0 scale</p>
          </div>
        );
      case 'portfolio':
        return (
          <div>
            <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700">
              Portfolio URL {isRequired && <span className="text-red-500">*</span>}
            </label>
            <input
              type="url"
              id="portfolio"
              name="portfolio"
              value={formData.portfolio || ''}
              onChange={handleInputChange}
              {...commonProps}
            />
          </div>
        );
      case 'linkedIn':
        return (
          <div>
            <label htmlFor="linkedIn" className="block text-sm font-medium text-gray-700">
              LinkedIn Profile {isRequired && <span className="text-red-500">*</span>}
            </label>
            <input
              type="url"
              id="linkedIn"
              name="linkedIn"
              value={formData.linkedIn || ''}
              onChange={handleInputChange}
              {...commonProps}
            />
          </div>
        );
      case 'github':
        return (
          <div>
            <label htmlFor="github" className="block text-sm font-medium text-gray-700">
              GitHub Profile {isRequired && <span className="text-red-500">*</span>}
            </label>
            <input
              type="url"
              id="github"
              name="github"
              value={formData.github || ''}
              onChange={handleInputChange}
              {...commonProps}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const renderCustomQuestion = (question: any, index: number) => {
    const handleCustomChange = (value: string | string[]) => {
      handleCustomResponse(question.question, value);
    };

    switch (question.type) {
      case 'text':
        return (
          <div key={index}>
            <label className="block text-sm font-medium text-gray-700">
              {question.question} {question.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={formData.customResponses[question.question] || ''}
              onChange={(e) => handleCustomChange(e.target.value)}
              required={question.required}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        );
      case 'textarea':
        return (
          <div key={index}>
            <label className="block text-sm font-medium text-gray-700">
              {question.question} {question.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              rows={4}
              value={formData.customResponses[question.question] || ''}
              onChange={(e) => handleCustomChange(e.target.value)}
              required={question.required}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        );
      case 'select':
        return (
          <div key={index}>
            <label className="block text-sm font-medium text-gray-700">
              {question.question} {question.required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={formData.customResponses[question.question] || ''}
              onChange={(e) => handleCustomChange(e.target.value)}
              required={question.required}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select an option</option>
              {question.options?.map((option: string, optIndex: number) => (
                <option key={optIndex} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );
      case 'radio':
        return (
          <div key={index}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {question.question} {question.required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              {question.options?.map((option: string, optIndex: number) => (
                <label key={optIndex} className="flex items-center">
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={option}
                    checked={formData.customResponses[question.question] === option}
                    onChange={(e) => handleCustomChange(e.target.value)}
                    required={question.required}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );
      case 'checkbox':
        return (
          <div key={index}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {question.question} {question.required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              {question.options?.map((option: string, optIndex: number) => {
                const currentValues = (formData.customResponses[question.question] as string[]) || [];
                return (
                  <label key={optIndex} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={currentValues.includes(option)}
                      onChange={(e) => {
                        const newValues = e.target.checked
                          ? [...currentValues, option]
                          : currentValues.filter(v => v !== option);
                        handleCustomChange(newValues);
                      }}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{option}</span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !program) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Program Not Found</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for applying to {program?.title}. We have received your application and will review it within 5-7 business days.
          </p>
          <p className="text-sm text-gray-500">
            You will receive a confirmation email shortly with next steps.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Program Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{program?.title}</h1>
            <p className="text-lg text-gray-600 mb-4">{program?.department} • {program?.location}</p>
            <div className="flex justify-center items-center space-x-4 text-sm text-gray-500">
              <span>{program?.duration} months</span>
              <span>•</span>
              <span>Applications close: {new Date(program?.applicationDeadline || '').toLocaleDateString()}</span>
              {program?.stipend && (
                <>
                  <span>•</span>
                  <span>${program.stipend}/month</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Apply Now</h2>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Core Required Fields - Always Required by Backend */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              {renderField('name', true)}
              {renderField('email', true)}
              {renderField('phone', true)}
              
              {/* Academic Information - Always Required */}
              {renderField('university', true)}
              {renderField('major', true)}
              {renderField('graduationYear', true)}
            </div>

            {/* Additional Required Fields from Program */}
            {program?.applicationForm.requiredFields && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {program.applicationForm.requiredFields
                  .filter(field => !['name', 'email', 'phone', 'university', 'major', 'graduationYear', 'resume'].includes(field))
                  .map(field => (
                    <div key={field}>
                      {renderField(field, true)}
                    </div>
                  ))}
              </div>
            )}

            {/* Optional Fields */}
            {program?.applicationForm.optionalFields && program.applicationForm.optionalFields.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {program.applicationForm.optionalFields.map(field => (
                  <div key={field}>
                    {renderField(field, false)}
                  </div>
                ))}
              </div>
            )}

            {/* Resume Upload */}
            <div>
              <label htmlFor="resume" className="block text-sm font-medium text-gray-700">
                Resume <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                id="resume"
                name="resume"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                required
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-1 text-sm text-gray-500">PDF, DOC, or DOCX format (max 5MB)</p>
            </div>

            {/* Cover Letter */}
            <div>
              <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700">
                Cover Letter
              </label>
              <textarea
                id="coverLetter"
                name="coverLetter"
                rows={4}
                value={formData.coverLetter}
                onChange={handleInputChange}
                placeholder="Tell us why you're interested in this internship..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Custom Questions */}
            {program?.applicationForm.customQuestions && program.applicationForm.customQuestions.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Additional Questions</h3>
                {program.applicationForm.customQuestions.map((question, index) => (
                  renderCustomQuestion(question, index)
                ))}
              </div>
            )}

            {/* Optional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="source" className="block text-sm font-medium text-gray-700">
                  How did you hear about this internship?
                </label>
                <input
                  type="text"
                  id="source"
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  placeholder="e.g., University career fair, LinkedIn, etc."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="referredBy" className="block text-sm font-medium text-gray-700">
                  Referred by (if applicable)
                </label>
                <input
                  type="text"
                  id="referredBy"
                  name="referredBy"
                  value={formData.referredBy}
                  onChange={handleInputChange}
                  placeholder="Name of person who referred you"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting Application...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InternshipApplicationForm;
