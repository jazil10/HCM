import { useEffect, useState } from 'react';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import type { Employee } from '../types/employee';
import { UserRole } from '../types/auth';
import { useAuth } from '../contexts/AuthProvider';
import AddEmployeeModal from '../components/employees/AddEmployeeModal';
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
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const { user } = useAuth();

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/employees');
      setEmployees(response.data.employees);
    } catch (err) {
      setError('Failed to fetch employees.');
      console.error(err);
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage your company's workforce and employee information.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="input-field pl-10"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      {/* Employee Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredEmployees.map((employee) => (
          <div key={employee._id} className="card p-6 flex flex-col justify-between hover:shadow-lg transition-shadow duration-200">
            <div>
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-lg font-medium text-white">
                      {employee.user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-medium text-gray-900 truncate">
                    {employee.user.name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {employee.position}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Employee ID:</span>
                  <span className="text-gray-900 font-medium">{employee.employeeId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Department:</span>
                  <span className="text-gray-900">{employee.department}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Email:</span>
                  <span className="text-gray-900 truncate">{employee.user.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Role:</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    employee.user.role === UserRole.ADMIN ? 'bg-red-100 text-red-800' :
                    employee.user.role === UserRole.MANAGER ? 'bg-blue-100 text-blue-800' :
                    employee.user.role === UserRole.HR ? 'bg-purple-100 text-purple-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {employee.user.role}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex space-x-2">
              <Link to={`/dashboard/employees/${employee._id}`} className="btn-secondary flex-1 text-sm py-2">
                View Details
              </Link>
              <button 
                className="btn-primary flex-1 text-sm py-2"
                onClick={() => openEditModal(employee)}
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredEmployees.length === 0 && !loading && (
        <div className="text-center py-12">
          <PlusIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No employees found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterDepartment ? 'No employees match your current filters.' : 'Get started by adding your first employee.'}
          </p>
          <div className="mt-6">
            <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Employee
            </button>
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