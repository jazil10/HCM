import { useEffect, useState } from 'react';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import type { Employee } from '../types/employee';
import { UserRole } from '../types/auth';
import { useAuth } from '../contexts/AuthProvider';
import AddEmployeeModal from '../components/employees/AddEmployeeModal';
import { usePageTitle } from '../hooks/usePageTitle';
import EditEmployeeModal from '../components/employees/EditEmployeeModal';

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

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  usePageTitle('Employees');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const { user } = useAuth();
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      console.log('Fetching employees...');
      const response = await api.get('/employees');
      console.log('Employees response:', response.data);
      setEmployees(response.data.employees);
    } catch (err: any) {
      console.error('Error fetching employees:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      setError(`Failed to fetch employees: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === UserRole.ADMIN || user.role === UserRole.HR)) {
      fetchEmployees();
    }
  }, [user]);

  const handleEmployeeAdded = () => {
    fetchEmployees();
  };

  const handleEmployeeUpdated = () => {
    fetchEmployees();
  };
  
  const openEditModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditModalOpen(true);
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !filterDepartment || employee.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const departments = [...new Set(employees.map(emp => emp.department))];

  if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.HR)) {
    return <AccessDenied />;
  }

  if (loading) {
    return (
      <div className="space-y-10 px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading Header */}
        <div className="animate-pulse">
          <div className="flex items-center space-x-4 mb-8">
            <div className="h-12 w-12 bg-gray-200 rounded-2xl"></div>
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded w-48"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </div>

        {/* Loading Search Bar */}
        <div className="bg-white rounded-3xl p-8">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 h-12 bg-gray-200 rounded-xl"></div>
            <div className="w-64 h-12 bg-gray-200 rounded-xl"></div>
          </div>
        </div>

        {/* Loading Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-6">
              <div className="animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div>
                    <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div>
                    <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div>
                    <div className="h-3 bg-gray-200 rounded w-14 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                  <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12">
        <div className="mb-6 lg:mb-0">
          <div className="flex items-center space-x-3 mb-3">
            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Employees
              </h1>
              <p className="text-lg text-gray-600 font-medium">
                {filteredEmployees.length} team member{filteredEmployees.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <p className="text-gray-600 max-w-2xl">
            Manage and organize your team members with comprehensive employee profiles, 
            department filtering, and quick access to essential information.
          </p>
        </div>
        <div className="flex-shrink-0">
          <button 
            className="group bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center space-x-3"
            onClick={() => setIsAddModalOpen(true)}
          >
            <PlusIcon className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
            <span>Add New Employee</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-12">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, position, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
              />
            </div>
          </div>
          
          {/* Department Filter */}
          <div className="lg:w-64">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="block w-full pl-12 pr-10 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white appearance-none cursor-pointer"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Results Counter */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-4 py-3 rounded-xl">
            <span className="font-medium">Showing:</span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg font-semibold">
              {filteredEmployees.length}
            </span>
            <span>of {employees.length}</span>
          </div>
        </div>
        
        {/* Active Filters Display */}
        {(searchTerm || filterDepartment) && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 font-medium">Active filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-2 hover:text-blue-900 transition-colors"
                  >
                    ×
                  </button>
                </span>
              )}
              {filterDepartment && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                  Department: {filterDepartment}
                  <button
                    onClick={() => setFilterDepartment('')}
                    className="ml-2 hover:text-purple-900 transition-colors"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      {/* Employee Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredEmployees.map((employee) => (
          <div key={employee._id} className="card p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ${
                  employee.user.role === UserRole.ADMIN ? 'bg-red-500' :
                  employee.user.role === UserRole.MANAGER ? 'bg-blue-500' :
                  employee.user.role === UserRole.HR ? 'bg-purple-500' :
                  'bg-green-500'
                }`}>
                  {employee.user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{employee.user.name}</h3>
                  <p className="text-sm text-gray-600">{employee.position}</p>
                </div>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                employee.user.role === UserRole.ADMIN ? 'bg-red-100 text-red-800' :
                employee.user.role === UserRole.MANAGER ? 'bg-blue-100 text-blue-800' :
                employee.user.role === UserRole.HR ? 'bg-purple-100 text-purple-800' :
                'bg-green-100 text-green-800'
              }`}>
                {employee.user.role}
              </span>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Employee ID</p>
                <p className="text-sm text-gray-900">{employee.employeeId}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Department</p>
                <p className="text-sm text-gray-900">{employee.department}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-sm text-gray-900 truncate">{employee.user.email}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Joined</p>
                <p className="text-sm text-gray-900">
                  {new Date(employee.dateOfJoining).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            
            <div className="mt-4 flex space-x-2">
              <Link 
                to={`/dashboard/employees/${employee._id}`} 
                className="btn-secondary flex-1 text-sm py-2"
              >
                View Profile
              </Link>
              <button 
                className="btn-primary flex-1 text-sm py-2"
                onClick={() => openEditModal(employee)}
              >
                Edit Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredEmployees.length === 0 && !loading && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="h-24 w-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
              {searchTerm || filterDepartment ? (
                <MagnifyingGlassIcon className="h-12 w-12 text-gray-400" />
              ) : (
                <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              )}
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {searchTerm || filterDepartment ? 'No matching employees' : 'No employees yet'}
            </h3>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
              {searchTerm || filterDepartment 
                ? 'Try adjusting your search terms or filters to find the employees you\'re looking for.'
                : 'Start building your team by adding your first employee. You can manage their profiles, roles, and department assignments all in one place.'
              }
            </p>

            {searchTerm || filterDepartment ? (
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterDepartment('');
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all duration-200 mx-2"
                >
                  Clear Filters
                </button>
                <button 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 mx-2"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  Add New Employee
                </button>
              </div>
            ) : (
              <button 
                className="group bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center space-x-3 mx-auto"
                onClick={() => setIsAddModalOpen(true)}
              >
                <PlusIcon className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
                <span>Add Your First Employee</span>
              </button>
            )}
          </div>
        </div>
      )}

      <AddEmployeeModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onEmployeeAdded={handleEmployeeAdded}
      />
      <EditEmployeeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        employee={selectedEmployee}
        onEmployeeUpdated={handleEmployeeUpdated}
      />
    </div>
  );
}