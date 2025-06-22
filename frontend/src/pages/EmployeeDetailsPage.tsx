import { useParams } from 'react-router-dom';

export default function EmployeeDetailsPage() {
  const { employeeId } = useParams<{ employeeId: string }>();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Employee Details</h1>
      <p className="mt-2 text-lg text-gray-600">
        Details for employee ID: {employeeId}
      </p>
    </div>
  );
} 