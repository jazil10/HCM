import mongoose, { Document, Schema } from 'mongoose';

export interface IEmployee extends Document {
  user: mongoose.Types.ObjectId;
  employeeId: string;
  department: string;
  position: string;
  joinDate: Date;
  salary: number;
  status: 'active' | 'inactive' | 'terminated';
  manager?: mongoose.Types.ObjectId;
  workLocation: string;
  phoneNumber?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema: Schema = new Schema<IEmployee>({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true 
  },
  employeeId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  department: { 
    type: String, 
    required: true 
  },
  position: { 
    type: String, 
    required: true 
  },
  joinDate: { 
    type: Date, 
    required: true,
    default: Date.now 
  },
  salary: { 
    type: Number, 
    required: true,
    min: 0 
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'terminated'],
    default: 'active'
  },
  manager: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  workLocation: { 
    type: String, 
    required: true 
  },
  phoneNumber: { 
    type: String 
  },
  emergencyContact: {
    name: { type: String },
    relationship: { type: String },
    phone: { type: String }
  },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String }
  }
}, { timestamps: true });

// Remove manual index for employeeId to avoid duplicate index warning
EmployeeSchema.index({ department: 1 });
EmployeeSchema.index({ status: 1 });

export default mongoose.model<IEmployee>('Employee', EmployeeSchema);
