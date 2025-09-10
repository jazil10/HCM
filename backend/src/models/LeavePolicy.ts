import mongoose, { Document, Schema } from 'mongoose';

export interface ILeavePolicy extends Document {
  name: string;
  description?: string;
  applicableTo: {
    departments: string[];
    roles: string[];
    employeeGrades: string[];
  };
  leaveTypes: {
    leaveType: mongoose.Types.ObjectId;
    allocation: number;
    carryForwardLimit: number;
    maxConsecutiveDays: number;
  }[];
  probationPeriodMonths: number;
  accrualType: 'monthly' | 'yearly' | 'quarterly';
  accrualStartDate: 'joining' | 'calendar_year' | 'financial_year';
  weekendPolicy: 'include' | 'exclude';
  holidayPolicy: 'include' | 'exclude';
  sandwichLeavePolicy: boolean;
  advanceLeaveAllowed: boolean;
  maxAdvanceDays: number;
  effectiveFrom: Date;
  effectiveTo?: Date;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LeavePolicySchema: Schema = new Schema<ILeavePolicy>({
  name: { 
    type: String, 
    required: true,
    trim: true,
    unique: true 
  },
  description: { 
    type: String,
    trim: true 
  },
  applicableTo: {
    departments: [{ type: String }],
    roles: [{ type: String }],
    employeeGrades: [{ type: String }]
  },
  leaveTypes: [{
    leaveType: { 
      type: Schema.Types.ObjectId, 
      ref: 'LeaveType', 
      required: true 
    },
    allocation: { 
      type: Number, 
      required: true,
      min: 0 
    },
    carryForwardLimit: { 
      type: Number, 
      default: 0,
      min: 0 
    },
    maxConsecutiveDays: { 
      type: Number, 
      required: true,
      min: 1 
    }
  }],
  probationPeriodMonths: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  accrualType: { 
    type: String, 
    enum: ['monthly', 'yearly', 'quarterly'],
    default: 'yearly' 
  },
  accrualStartDate: { 
    type: String, 
    enum: ['joining', 'calendar_year', 'financial_year'],
    default: 'calendar_year' 
  },
  weekendPolicy: { 
    type: String, 
    enum: ['include', 'exclude'],
    default: 'exclude' 
  },
  holidayPolicy: { 
    type: String, 
    enum: ['include', 'exclude'],
    default: 'exclude' 
  },
  sandwichLeavePolicy: { 
    type: Boolean, 
    default: false 
  },
  advanceLeaveAllowed: { 
    type: Boolean, 
    default: false 
  },
  maxAdvanceDays: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  effectiveFrom: { 
    type: Date, 
    required: true 
  },
  effectiveTo: { 
    type: Date 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, { timestamps: true });

LeavePolicySchema.index({ name: 1 });
LeavePolicySchema.index({ isActive: 1 });
LeavePolicySchema.index({ effectiveFrom: 1, effectiveTo: 1 });

export default mongoose.model<ILeavePolicy>('LeavePolicy', LeavePolicySchema);
