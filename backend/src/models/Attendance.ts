import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
  employee: mongoose.Types.ObjectId;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  breakTime?: number; // in minutes
  totalHours?: number;
  status: 'present' | 'absent' | 'late' | 'half-day' | 'holiday' | 'leave';
  notes?: string;
  approvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  calculateTotalHours(): number | undefined;
}

const AttendanceSchema: Schema = new Schema<IAttendance>({
  employee: { 
    type: Schema.Types.ObjectId, 
    ref: 'Employee', 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  checkIn: { 
    type: Date 
  },
  checkOut: { 
    type: Date 
  },
  breakTime: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  totalHours: { 
    type: Number,
    min: 0 
  },
  status: { 
    type: String, 
    enum: ['present', 'absent', 'late', 'half-day', 'holiday', 'leave'],
    required: true 
  },
  notes: { 
    type: String 
  },
  approvedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { timestamps: true });

// Compound index to ensure one attendance record per employee per day
AttendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

// Method to calculate total hours
AttendanceSchema.methods.calculateTotalHours = function() {
  if (this.checkIn && this.checkOut) {
    const diffInMs = this.checkOut.getTime() - this.checkIn.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const breakHours = (this.breakTime || 0) / 60;
    this.totalHours = Math.max(0, diffInHours - breakHours);
  }
  return this.totalHours;
};

export default mongoose.model<IAttendance>('Attendance', AttendanceSchema);
