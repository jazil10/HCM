import mongoose, { Document, Schema } from 'mongoose';

export interface IHoliday extends Document {
  name: string;
  date: Date;
  description?: string;
  isRecurring: boolean;
  type: 'national' | 'regional' | 'company' | 'optional';
  applicableTo: string[]; // Department IDs or 'all'
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const HolidaySchema: Schema = new Schema<IHoliday>({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  description: { 
    type: String,
    trim: true 
  },
  isRecurring: { 
    type: Boolean, 
    default: false 
  },
  type: { 
    type: String, 
    enum: ['national', 'regional', 'company', 'optional'],
    required: true 
  },
  applicableTo: [{ 
    type: String,
    default: ['all']
  }],
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

HolidaySchema.index({ date: 1 });
HolidaySchema.index({ type: 1 });
HolidaySchema.index({ isActive: 1 });

export default mongoose.model<IHoliday>('Holiday', HolidaySchema);
