import mongoose, { Document, Schema } from 'mongoose';

export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  WITHDRAWN = 'withdrawn'
}

export interface ILeaveComment extends Document {
  user: mongoose.Types.ObjectId;
  comment: string;
  timestamp: Date;
}

export interface ILeave extends Document {
  employee: mongoose.Types.ObjectId;
  leaveType: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  appliedDate: Date;
  approvedBy?: mongoose.Types.ObjectId;
  approvedDate?: Date;
  rejectedBy?: mongoose.Types.ObjectId;
  rejectedDate?: Date;
  rejectionReason?: string;
  attachments: string[];
  comments: ILeaveComment[];
  isEmergency: boolean;
  handoverNotes?: string;
  contactDuringLeave?: {
    phone: string;
    email: string;
    address: string;
  };
  managerId?: mongoose.Types.ObjectId;
  hrComments?: string;
  createdAt: Date;
  updatedAt: Date;
  calculateTotalDays(): number;
}

const LeaveCommentSchema: Schema = new Schema({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  comment: { 
    type: String, 
    required: true,
    trim: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

const LeaveSchema: Schema = new Schema<ILeave>({
  employee: { 
    type: Schema.Types.ObjectId, 
    ref: 'Employee', 
    required: true 
  },
  leaveType: { 
    type: Schema.Types.ObjectId, 
    ref: 'LeaveType', 
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
    required: true,
    trim: true 
  },
  status: { 
    type: String, 
    enum: Object.values(LeaveStatus),
    default: LeaveStatus.PENDING 
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
  rejectedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  rejectedDate: { 
    type: Date 
  },
  rejectionReason: { 
    type: String,
    trim: true 
  },
  attachments: [{ 
    type: String 
  }],
  comments: [LeaveCommentSchema],
  isEmergency: { 
    type: Boolean, 
    default: false 
  },
  handoverNotes: { 
    type: String,
    trim: true 
  },
  contactDuringLeave: {
    phone: { type: String },
    email: { type: String },
    address: { type: String }
  },
  managerId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  hrComments: { 
    type: String,
    trim: true 
  }
}, { timestamps: true });

// Indexes for efficient querying
LeaveSchema.index({ employee: 1, status: 1 });
LeaveSchema.index({ managerId: 1, status: 1 });
LeaveSchema.index({ startDate: 1, endDate: 1 });
LeaveSchema.index({ leaveType: 1 });
LeaveSchema.index({ status: 1 });

// Method to calculate total days
LeaveSchema.methods.calculateTotalDays = function() {
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end date
  this.totalDays = diffDays;
  return diffDays;
};

// Pre-save hook to calculate total days and validation
LeaveSchema.pre<ILeave>('save', function(next) {
  if (this.endDate <= this.startDate) {
    return next(new Error('End date must be after start date'));
  }
  
  if (this.isModified('startDate') || this.isModified('endDate')) {
    this.calculateTotalDays();
  }
  next();
});

export default mongoose.model<ILeave>('Leave', LeaveSchema);
