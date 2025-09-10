import mongoose, { Document, Schema } from 'mongoose';

export interface ILeaveType extends Document {
  name: string;
  description?: string;
  maxDaysPerYear: number;
  maxConsecutiveDays: number;
  carryForwardAllowed: boolean;
  maxCarryForwardDays: number;
  encashmentAllowed: boolean;
  attachmentRequired: boolean;
  eligibilityMonths: number; // Months of service required to be eligible
  applicableToGenders: ('all' | 'male' | 'female')[];
  isActive: boolean;
  color: string; // For calendar display
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveTypeSchema: Schema = new Schema<ILeaveType>({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  description: { 
    type: String,
    trim: true 
  },
  maxDaysPerYear: { 
    type: Number, 
    required: true,
    min: 0 
  },
  maxConsecutiveDays: { 
    type: Number, 
    required: true,
    min: 1 
  },
  carryForwardAllowed: { 
    type: Boolean, 
    default: false 
  },
  maxCarryForwardDays: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  encashmentAllowed: { 
    type: Boolean, 
    default: false 
  },
  attachmentRequired: { 
    type: Boolean, 
    default: false 
  },
  eligibilityMonths: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  applicableToGenders: [{ 
    type: String, 
    enum: ['all', 'male', 'female'],
    default: ['all']
  }],
  isActive: { 
    type: Boolean, 
    default: true 
  },
  color: { 
    type: String, 
    default: '#3B82F6' 
  },
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, { timestamps: true });

LeaveTypeSchema.index({ name: 1 });
LeaveTypeSchema.index({ isActive: 1 });

export default mongoose.model<ILeaveType>('LeaveType', LeaveTypeSchema);
