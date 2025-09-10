import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, CalendarIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';
import type { Holiday } from '../../types/leave';
import CreateHolidayModal from './CreateHolidayModal';
import EditHolidayModal from './EditHolidayModal';

interface HolidayManagementProps {
  onDataChange?: () => void;
}

export default function HolidayManagement({ onDataChange }: HolidayManagementProps) {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchHolidays();
  }, [selectedYear]);

  const fetchHolidays = async () => {
    try {
      const response = await api.get(`/holidays?year=${selectedYear}`);
      setHolidays(response.data);
    } catch (error) {
      console.error('Error fetching holidays:', error);
      setError('Failed to fetch holidays');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    fetchHolidays();
    onDataChange?.();
    setIsCreateModalOpen(false);
  };

  const handleEditSuccess = () => {
    fetchHolidays();
    onDataChange?.();
    setEditingHoliday(null);
  };

  const handleDelete = async (holidayId: string) => {
    if (!confirm('Are you sure you want to delete this holiday? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/holidays/${holidayId}`);
      fetchHolidays();
      onDataChange?.();
    } catch (error) {
      console.error('Error deleting holiday:', error);
      setError('Failed to delete holiday');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'national': return 'bg-blue-100 text-blue-800';
      case 'religious': return 'bg-purple-100 text-purple-800';
      case 'company': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Holiday Management</h2>
          <p className="text-gray-600">Manage company holidays and calendar</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Year Selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() - 2 + i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
          
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Add Holiday
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Holidays List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Holidays for {selectedYear}
          </h3>
          
          {holidays.length > 0 ? (
            <div className="space-y-4">
              {holidays.map((holiday) => (
                <div key={holiday._id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <CalendarIcon className="h-8 w-8 text-primary-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{holiday.name}</h4>
                        <p className="text-sm text-gray-600">{formatDate(holiday.date)}</p>
                        {holiday.description && (
                          <p className="text-sm text-gray-500 mt-1">{holiday.description}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(holiday.type)}`}>
                          {holiday.type.charAt(0).toUpperCase() + holiday.type.slice(1)}
                        </span>
                        {holiday.isRecurring && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Recurring
                          </span>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingHoliday(holiday)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(holiday._id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No holidays</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding your first holiday for {selectedYear}.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Holiday Calendar Preview */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Holiday Calendar Preview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 12 }, (_, i) => {
              const month = i + 1;
              const monthName = new Date(selectedYear, i, 1).toLocaleDateString('en-US', { month: 'long' });
              const monthHolidays = holidays.filter(h => new Date(h.date).getMonth() + 1 === month);
              
              return (
                <div key={month} className="border rounded-lg p-3">
                  <h4 className="font-medium text-gray-900 mb-2">{monthName}</h4>
                  {monthHolidays.length > 0 ? (
                    <ul className="space-y-1">
                      {monthHolidays.map(holiday => (
                        <li key={holiday._id} className="text-sm">
                          <span className="font-medium">{new Date(holiday.date).getDate()}</span> - {holiday.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No holidays</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateHolidayModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
        selectedYear={selectedYear}
      />

      {editingHoliday && (
        <EditHolidayModal
          isOpen={!!editingHoliday}
          onClose={() => setEditingHoliday(null)}
          onSuccess={handleEditSuccess}
          holiday={editingHoliday}
        />
      )}
    </div>
  );
}
