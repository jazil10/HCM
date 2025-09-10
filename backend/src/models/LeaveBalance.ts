import mongoose, { Document, Schema } from 'mongoose';

export interface ILeaveBalance extends Document {
  employee: mongoose.Types.ObjectId;
  leaveType: mongoose.Types.ObjectId;
  year: number;
  allocated: number;
  used: number;
  pending: number;
  carriedForward: number;
  encashed: number;
  remaining: number;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
  calculateRemaining(): number;
}

const LeaveBalanceSchema: Schema = new Schema<ILeaveBalance>({
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
  year: { 
    type: Number, 
    required: true 
  },
  allocated: { 
    type: Number, 
    required: true,
    min: 0 
  },
  used: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  pending: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  carriedForward: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  encashed: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  remaining: { 
    type: Number, 
    default: 0 
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// Compound index to ensure one balance record per employee per leave type per year
LeaveBalanceSchema.index({ employee: 1, leaveType: 1, year: 1 }, { unique: true });
LeaveBalanceSchema.index({ year: 1 });

// Method to calculate remaining balance
LeaveBalanceSchema.methods.calculateRemaining = function() {
  this.remaining = this.allocated + this.carriedForward - this.used - this.pending - this.encashed;
  return this.remaining;
};

// Pre-save hook to update remaining balance
LeaveBalanceSchema.pre<ILeaveBalance>('save', function(next) {
  this.calculateRemaining();
  this.lastUpdated = new Date();
  next();
});

export default mongoose.model<ILeaveBalance>('LeaveBalance', LeaveBalanceSchema);
