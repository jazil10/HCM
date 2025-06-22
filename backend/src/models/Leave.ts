import mongoose, { Document, Schema } from 'mongoose';

export interface ILeave extends Document {
  employee: mongoose.Types.ObjectId;
  leaveType: 'sick' | 'vacation' | 'personal' | 'maternity' | 'paternity' | 'emergency' | 'other';
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: Date;
  approvedBy?: mongoose.Types.ObjectId;
  approvedDate?: Date;
  rejectionReason?: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const LeaveSchema: Schema = new Schema<ILeave>({
  employee: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  leaveType: { 
    type: String, 
    enum: ['sick', 'vacation', 'personal', 'maternity', 'paternity', 'emergency', 'other'],
    required: true 
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  totalDays: { 
    type: Number, 
    required: true,
    min: 0.5 
  },
  reason: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending' 
  },
  appliedDate: { 
    type: Date, 
    default: Date.now 
  },
  approvedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  approvedDate: { 
    type: Date 
  },
  rejectionReason: { 
    type: String 
  },
  attachments: [{ 
    type: String 
  }]
}, { timestamps: true });

// Validation: End date should be after start date
LeaveSchema.pre<ILeave>('save', function(next) {
  if (this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
  } else {
    next();
  }
});

// Index for efficient queries
LeaveSchema.index({ employee: 1, status: 1 });
LeaveSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.model<ILeave>('Leave', LeaveSchema);
