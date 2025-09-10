import mongoose, { Document, Schema } from 'mongoose';

export enum ProgramStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  CLOSED = 'closed',
  ARCHIVED = 'archived'
}

export interface IInternshipProgram extends Document {
  title: string;
  description: string;
  department: string;
  location: string;
  duration: number; // in months
  startDate: Date;
  endDate: Date;
  applicationDeadline: Date;
  maxApplicants: number;
  currentApplicants: number;
  requirements: string[];
  skills: string[];
  benefits: string[];
  stipend?: number;
  isRemote: boolean;
  status: ProgramStatus;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  publicSlug: string; // URL-friendly identifier for public access
  applicationForm: {
    requiredFields: string[];
    optionalFields: string[];
    customQuestions: {
      question: string;
      type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox';
      options?: string[];
      required: boolean;
    }[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const InternshipProgramSchema: Schema = new Schema<IInternshipProgram>({
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxLength: 200
  },
  description: { 
    type: String, 
    required: true,
    trim: true 
  },
  department: { 
    type: String, 
    required: true,
    trim: true 
  },
  location: { 
    type: String, 
    required: true,
    trim: true 
  },
  duration: { 
    type: Number, 
    required: true,
    min: 1,
    max: 12 
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  applicationDeadline: { 
    type: Date, 
    required: true 
  },
  maxApplicants: { 
    type: Number, 
    required: true,
    min: 1 
  },
  currentApplicants: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  requirements: [{ 
    type: String,
    trim: true 
  }],
  skills: [{ 
    type: String,
    trim: true 
  }],
  benefits: [{ 
    type: String,
    trim: true 
  }],
  stipend: { 
    type: Number,
    min: 0 
  },
  isRemote: { 
    type: Boolean, 
    default: false 
  },
  status: { 
    type: String, 
    enum: Object.values(ProgramStatus),
    default: ProgramStatus.DRAFT 
  },
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  updatedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  publicSlug: { 
    type: String, 
    required: true,
    unique: true,
    lowercase: true,
    trim: true 
  },  applicationForm: {
    requiredFields: [{ 
      type: String,
      enum: ['name', 'email', 'phone', 'university', 'major', 'graduationYear', 'gpa', 'portfolio', 'linkedIn', 'github', 'resume', 'coverLetter']
    }],
    optionalFields: [{ 
      type: String,
      enum: ['name', 'email', 'phone', 'university', 'major', 'graduationYear', 'gpa', 'portfolio', 'linkedIn', 'github', 'resume', 'coverLetter']
    }],
    customQuestions: [{
      question: { type: String, required: true, trim: true },
      type: { 
        type: String, 
        enum: ['text', 'textarea', 'select', 'radio', 'checkbox'],
        required: true 
      },
      options: [{ type: String, trim: true }],
      required: { type: Boolean, default: false }
    }]
  }
}, { timestamps: true });

// Indexes for efficient querying
InternshipProgramSchema.index({ status: 1 });
InternshipProgramSchema.index({ department: 1 });
InternshipProgramSchema.index({ applicationDeadline: 1 });
InternshipProgramSchema.index({ publicSlug: 1 }, { unique: true });
InternshipProgramSchema.index({ startDate: 1, endDate: 1 });

// Pre-save middleware to generate slug if not provided
InternshipProgramSchema.pre<IInternshipProgram>('save', function(next) {
  if (!this.publicSlug) {
    this.publicSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') + '-' + Date.now();
  }
  next();
});

export default mongoose.model<IInternshipProgram>('InternshipProgram', InternshipProgramSchema);
