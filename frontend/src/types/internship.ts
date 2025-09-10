export enum ProgramStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  CLOSED = 'closed',
  ARCHIVED = 'archived'
}

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

export interface InternshipProgram {
  _id: string;
  title: string;
  description: string;
  department: string;
  location: string;
  duration: number;
  startDate: string;
  endDate: string;
  applicationDeadline: string;
  maxApplicants: number;
  currentApplicants: number;
  requirements: string[];
  skills: string[];
  benefits: string[];
  stipend?: number;
  isRemote: boolean;
  status: ProgramStatus;
  publicSlug: string;
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
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  updatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface InternshipApplication {
  _id: string;
  program: InternshipProgram | string;
  name: string;
  email: string;
  phone: string;
  university: string;
  major: string;
  graduationYear: number;
  gpa?: number;
  portfolio?: string;
  linkedIn?: string;
  github?: string;
  resume: string;
  coverLetter?: string;
  status: ApplicationStatus;
  appliedDate: string;
  lastStatusUpdate: string;
  reviewedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  interviewDate?: string;
  interviewType?: 'phone' | 'video' | 'in-person';
  interviewNotes?: string;
  offerDetails?: {
    stipend?: number;
    startDate?: string;
    offerDate?: string;
    responseDeadline?: string;
  };
  customResponses: {
    question: string;
    answer: string | string[];
  }[];
  comments: {
    _id: string;
    user: {
      _id: string;
      name: string;
      email: string;
    };
    comment: string;
    isInternal: boolean;
    timestamp: string;
  }[];
  emailHistory: {
    subject: string;
    sentBy: {
      _id: string;
      name: string;
      email: string;
    };
    sentAt: string;
    emailType: 'status_update' | 'interview_invite' | 'offer_letter' | 'rejection' | 'general';
  }[];
  score?: number;
  scoreBreakdown?: {
    criteria: string;
    score: number;
    maxScore: number;
  }[];
  source?: string;
  referredBy?: string;
}

export interface ApplicationFormData {
  name: string;
  email: string;
  phone: string;
  university: string;
  major: string;
  graduationYear: number;
  gpa?: number;
  portfolio?: string;
  linkedIn?: string;
  github?: string;
  coverLetter?: string;
  resume: File | null;
  customResponses: { [key: string]: string | string[] };
  source?: string;
  referredBy?: string;
}

export interface ProgramStats {
  program: {
    id: string;
    title: string;
    maxApplicants: number;
    currentApplicants: number;
  };
  totalApplications: number;
  statusBreakdown: {
    _id: ApplicationStatus;
    count: number;
  }[];
  recentApplications: {
    name: string;
    email: string;
    appliedDate: string;
    status: ApplicationStatus;
  }[];
  applicationTrend: {
    _id: {
      year: number;
      month: number;
      day: number;
    };
    count: number;
  }[];
}

export interface ApplicationStats {
  totalApplications: number;
  statusBreakdown: {
    _id: ApplicationStatus;
    count: number;
  }[];
  timeline: {
    _id: {
      year: number;
      month: number;
      day: number;
    };
    count: number;
  }[];
  universityBreakdown: {
    _id: string;
    count: number;
  }[];
  programBreakdown: {
    _id: string;
    programTitle: string;
    department: string;
    count: number;
  }[];
}
