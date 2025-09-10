import mongoose, { Document, Schema } from 'mongoose';

export enum ApplicationStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  SHORTLISTED = 'shortlisted',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  INTERVIEWED = 'interviewed',
  OFFER_EXTENDED = 'offer_extended',
  OFFER_ACCEPTED = 'offer_accepted',
  OFFER_DECLINED = 'offer_declined',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn'
}

export interface IApplicationComment extends Document {
  user: mongoose.Types.ObjectId;
  comment: string;
  isInternal: boolean; // HR/Admin internal notes vs communication with applicant
  timestamp: Date;
}

export interface IInternshipApplication extends Document {
  program: mongoose.Types.ObjectId;
  // Personal Information
  name: string;
  email: string;
  phone: string;
  // Academic Information
  university: string;
  major: string;
  graduationYear: number;
  gpa?: number;
  // Professional Information
  portfolio?: string;
  linkedIn?: string;
  github?: string;
  resume: string; // File path/URL
  coverLetter?: string;
  // Application Status
  status: ApplicationStatus;
  appliedDate: Date;
  lastStatusUpdate: Date;
  // Tracking
  reviewedBy?: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId; // HR person handling this application
  // Interview Information
  interviewDate?: Date;
  interviewType?: 'phone' | 'video' | 'in-person';
  interviewNotes?: string;
  // Offer Information
  offerDetails?: {
    stipend?: number;
    startDate?: Date;
    offerDate?: Date;
    responseDeadline?: Date;
  };
  // Custom form responses
  customResponses: {
    question: string;
    answer: string | string[];
  }[];
  // Communication
  comments: IApplicationComment[];
  emailHistory: {
    subject: string;
    sentBy: mongoose.Types.ObjectId;
    sentAt: Date;
    emailType: 'status_update' | 'interview_invite' | 'offer_letter' | 'rejection' | 'general';
  }[];
  // Scoring (optional)
  score?: number;
  scoreBreakdown?: {
    criteria: string;
    score: number;
    maxScore: number;
  }[];
  // Metadata
  source?: string; // How they found the internship
  referredBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationCommentSchema: Schema = new Schema({
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
  isInternal: { 
    type: Boolean, 
    default: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

const InternshipApplicationSchema: Schema = new Schema<IInternshipApplication>({
  program: { 
    type: Schema.Types.ObjectId, 
    ref: 'InternshipProgram', 
    required: true 
  },
  // Personal Information
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxLength: 100
  },
  email: { 
    type: String, 
    required: true,
    lowercase: true,
    trim: true 
  },
  phone: { 
    type: String, 
    required: true,
    trim: true 
  },
  // Academic Information
  university: { 
    type: String, 
    required: true,
    trim: true 
  },
  major: { 
    type: String, 
    required: true,
    trim: true 
  },
  graduationYear: { 
    type: Number, 
    required: true,
    min: new Date().getFullYear(),
    max: new Date().getFullYear() + 10
  },
  gpa: { 
    type: Number,
    min: 0,
    max: 4.0 
  },
  // Professional Information
  portfolio: { 
    type: String,
    trim: true 
  },
  linkedIn: { 
    type: String,
    trim: true 
  },
  github: { 
    type: String,
    trim: true 
  },
  resume: { 
    type: String, 
    required: true // File path or URL
  },
  coverLetter: { 
    type: String,
    trim: true 
  },
  // Application Status
  status: { 
    type: String, 
    enum: Object.values(ApplicationStatus),
    default: ApplicationStatus.SUBMITTED 
  },
  appliedDate: { 
    type: Date, 
    default: Date.now 
  },
  lastStatusUpdate: { 
    type: Date, 
    default: Date.now 
  },
  // Tracking
  reviewedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  assignedTo: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  // Interview Information
  interviewDate: { 
    type: Date 
  },
  interviewType: { 
    type: String,
    enum: ['phone', 'video', 'in-person']
  },
  interviewNotes: { 
    type: String,
    trim: true 
  },
  // Offer Information
  offerDetails: {
    stipend: { type: Number, min: 0 },
    startDate: { type: Date },
    offerDate: { type: Date },
    responseDeadline: { type: Date }
  },
  // Custom form responses
  customResponses: [{
    question: { type: String, required: true },
    answer: { type: Schema.Types.Mixed, required: true }
  }],
  // Communication
  comments: [ApplicationCommentSchema],
  emailHistory: [{
    subject: { type: String, required: true },
    sentBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sentAt: { type: Date, default: Date.now },
    emailType: { 
      type: String, 
      enum: ['status_update', 'interview_invite', 'offer_letter', 'rejection', 'general'],
      default: 'general'
    }
  }],
  // Scoring
  score: { 
    type: Number,
    min: 0,
    max: 100 
  },
  scoreBreakdown: [{
    criteria: { type: String, required: true },
    score: { type: Number, required: true },
    maxScore: { type: Number, required: true }
  }],
  // Metadata
  source: { 
    type: String,
    trim: true 
  },
  referredBy: { 
    type: String,
    trim: true 
  }
}, { timestamps: true });

// Indexes for efficient querying
InternshipApplicationSchema.index({ program: 1, status: 1 });
InternshipApplicationSchema.index({ email: 1 });
InternshipApplicationSchema.index({ status: 1 });
InternshipApplicationSchema.index({ appliedDate: 1 });
InternshipApplicationSchema.index({ assignedTo: 1 });
InternshipApplicationSchema.index({ reviewedBy: 1 });

// Compound index to prevent duplicate applications
InternshipApplicationSchema.index({ program: 1, email: 1 }, { unique: true });

// Pre-save middleware to update lastStatusUpdate when status changes
InternshipApplicationSchema.pre<IInternshipApplication>('save', function(next) {
  if (this.isModified('status')) {
    this.lastStatusUpdate = new Date();
  }
  next();
});

export default mongoose.model<IInternshipApplication>('InternshipApplication', InternshipApplicationSchema);
