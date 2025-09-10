import { useEffect, useState } from 'react';
import { ClockIcon, CheckCircleIcon, ArrowRightOnRectangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';
import { type Attendance } from '../../types/attendance';

export default function MyAttendance() {
  const [todaysRecord, setTodaysRecord] = useState<Attendance | null>(null);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const fetchTodaysRecord = async () => {
    try {
      const response = await api.get('/attendance/today');
      setTodaysRecord(response.data);
    } catch (err: any) {
      if (err.response && err.response.status !== 404) {
        setError('Failed to fetch today\'s attendance.');
      }
      // 404 is okay, it just means no record exists yet for today
    }
  };

  useEffect(() => {
    fetchTodaysRecord();
  }, []);

  const handleCheckIn = async () => {
    try {
      await api.post('/attendance/check-in');
      fetchTodaysRecord(); // Refresh data
    } catch (err) {
      setError('Check-in failed. Please try again.');
    }
  };
  const handleCheckOut = async () => {
    if (!todaysRecord) return;
    try {
      await api.post('/attendance/check-out', {
        attendanceId: todaysRecord._id
      });
      fetchTodaysRecord(); // Refresh data
    } catch (err) {
      setError('Check-out failed. Please try again.');
    }
  };
  const renderTime = (dateString?: string) => {
    if (!dateString) return '--:--';
    return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const getCheckInStatus = () => {
    if (!todaysRecord?.checkIn) return null;
    
    const checkInTime = new Date(todaysRecord.checkIn);
    const cutoffTime = new Date();
    cutoffTime.setHours(11, 0, 0, 0); // 11:00 AM
    
    return {
      isLate: checkInTime > cutoffTime,
      time: checkInTime
    };
  };

  const calculateWorkingHours = () => {
    if (!todaysRecord?.checkIn || !todaysRecord?.checkOut) return 0;
    
    const checkIn = new Date(todaysRecord.checkIn);
    const checkOut = new Date(todaysRecord.checkOut);
    const diffInMs = checkOut.getTime() - checkIn.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    
    return Math.max(0, diffInHours);
  };

  const formatWorkingHours = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  const checkInStatus = getCheckInStatus();
  
  const hasCheckedIn = !!todaysRecord?.checkIn;
  const hasCheckedOut = !!todaysRecord?.checkOut;
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">My Attendance Today</h2>
        
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Attendance Rules:</p>
              <ul className="mt-1 space-y-1">
                <li>• Check-in before 11:00 AM to be marked as "On Time"</li>
                <li>• Check-in after 11:00 AM will be marked as "Late"</li>
                <li>• You can only check-in once per day</li>
                <li>• You can check-out multiple times (most recent will be used)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        
        {/* Live Clock */}
        <div className="text-center">
          <p className="text-4xl font-bold text-primary-600">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
          <p className="text-gray-500">{currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>        {/* Statuses */}
        <div className="flex justify-around items-center flex-1 max-w-md mx-auto">
          <div className="text-center">
            <div className={`h-8 w-8 mx-auto rounded-full flex items-center justify-center ${
              checkInStatus 
                ? checkInStatus.isLate 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-green-100 text-green-600'
                : 'text-gray-400'
            }`}>
              <ClockIcon className="h-5 w-5" />
            </div>
            <p className={`mt-1 text-lg font-semibold ${
              checkInStatus 
                ? checkInStatus.isLate 
                  ? 'text-red-600' 
                  : 'text-green-600'
                : 'text-gray-900'
            }`}>
              {renderTime(todaysRecord?.checkIn)}
            </p>
            <p className="text-sm text-gray-500">
              Check-In {checkInStatus && (
                <span className={`ml-1 ${checkInStatus.isLate ? 'text-red-500' : 'text-green-500'}`}>
                  ({checkInStatus.isLate ? 'Late' : 'On Time'})
                </span>
              )}
            </p>
          </div>
          <div className="text-center">
            <ArrowRightOnRectangleIcon className="h-8 w-8 mx-auto text-gray-400" />
            <p className="mt-1 text-lg font-semibold">{renderTime(todaysRecord?.checkOut)}</p>
            <p className="text-sm text-gray-500">Check-Out</p>
          </div>
          <div className="text-center">
            <CheckCircleIcon className={`h-8 w-8 mx-auto ${
              todaysRecord?.status === 'present' ? 'text-green-500' :
              todaysRecord?.status === 'late' ? 'text-yellow-500' :
              todaysRecord?.status === 'absent' ? 'text-red-500' :
              'text-gray-400'
            }`} />
            <p className="mt-1 text-lg font-semibold capitalize">{todaysRecord?.status || 'Pending'}</p>
            <p className="text-sm text-gray-500">Status</p>
          </div>
        </div>
          {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          {!hasCheckedIn && (
            <button onClick={handleCheckIn} className="btn-primary w-full sm:w-auto">
              <ClockIcon className="h-5 w-5 mr-2" />
              Check In
            </button>
          )}
          {hasCheckedIn && (
            <button onClick={handleCheckOut} className="btn-secondary w-full sm:w-auto">
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
              {hasCheckedOut ? 'Check Out Again' : 'Check Out'}
            </button>
          )}          {hasCheckedIn && hasCheckedOut && (
            <div className="text-center">
              <p className="text-green-600 font-semibold">✓ Checked In Today</p>
              <p className="text-sm text-gray-500">You can check out multiple times</p>
            </div>          )}
        </div>
        
        {/* Working Hours Summary */}
        {hasCheckedIn && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Today's Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {formatWorkingHours(calculateWorkingHours())}
                </p>
                <p className="text-sm text-gray-500">Working Hours</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-600">
                  {todaysRecord?.totalHours ? `${todaysRecord.totalHours.toFixed(1)}h` : '0h'}
                </p>
                <p className="text-sm text-gray-500">Total Hours</p>
              </div>
              <div>
                <p className={`text-2xl font-bold ${checkInStatus?.isLate ? 'text-red-600' : 'text-green-600'}`}>
                  {checkInStatus?.isLate ? 'Late' : 'On Time'}
                </p>
                <p className="text-sm text-gray-500">Check-in Status</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {hasCheckedOut ? 'Yes' : 'No'}
                </p>
                <p className="text-sm text-gray-500">Checked Out</p>
              </div>
            </div>
          </div>
        )}
        </div>
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </div>
    </div>
  );
}