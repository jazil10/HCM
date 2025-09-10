import { Response, Request } from 'express';
import InternshipApplication, { IInternshipApplication, ApplicationStatus } from '../models/InternshipApplication';
import InternshipProgram from '../models/InternshipProgram';
import { AuthenticatedRequest } from '../types/auth';
import { UserRole } from '../models/User';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';

// Extend Request interface to include file
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/resumes');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, and DOCX files are allowed!'));
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Submit application (Public endpoint)
export const submitApplication = async (req: MulterRequest, res: Response): Promise<void> => {
  try {
    const { programSlug } = req.params;
    const {
      name,
      email,
      phone,
      university,
      major,
      graduationYear,
      gpa,
      portfolio,
      linkedIn,
      github,
      coverLetter,
      customResponses,
      source,
      referredBy
    } = req.body;

    // Find the program
    const program = await InternshipProgram.findOne({ 
      publicSlug: programSlug,
      status: 'active',
      applicationDeadline: { $gte: new Date() }
    });

    if (!program) {
      res.status(404).json({ message: 'Program not found or no longer accepting applications' });
      return;
    }

    // Check if application limit reached
    if (program.currentApplicants >= program.maxApplicants) {
      res.status(400).json({ message: 'Application limit reached for this program' });
      return;
    }

    // Check if user already applied
    const existingApplication = await InternshipApplication.findOne({
      program: program._id,
      email: email.toLowerCase()
    });

    if (existingApplication) {
      res.status(400).json({ message: 'You have already applied for this program' });
      return;
    }

    // Check if resume file was uploaded
    if (!req.file) {
      res.status(400).json({ message: 'Resume file is required' });
      return;
    }    // Validate required fields based on program configuration
    const requiredFields = program.applicationForm.requiredFields;
    const missingFields = [];

    // Core fields always required by the backend model
    if (!name || !name.trim()) missingFields.push('name');
    if (!email || !email.trim()) missingFields.push('email');
    if (!phone || !phone.trim()) missingFields.push('phone');
    if (!university || !university.trim()) missingFields.push('university');
    if (!major || !major.trim()) missingFields.push('major');
    if (!graduationYear) missingFields.push('graduationYear');

    // Additional fields specified in program configuration
    if (requiredFields.includes('gpa') && !gpa) missingFields.push('gpa');
    if (requiredFields.includes('portfolio') && (!portfolio || !portfolio.trim())) missingFields.push('portfolio');
    if (requiredFields.includes('linkedIn') && (!linkedIn || !linkedIn.trim())) missingFields.push('linkedIn');
    if (requiredFields.includes('github') && (!github || !github.trim())) missingFields.push('github');
    if (requiredFields.includes('coverLetter') && (!coverLetter || !coverLetter.trim())) missingFields.push('coverLetter');

    if (missingFields.length > 0) {
      res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
      return;
    }// Parse custom responses if provided
    let processedCustomResponses: Array<{question: string, answer: string | string[]}> = [];
    if (customResponses) {
      try {
        const parsedResponses = typeof customResponses === 'string' 
          ? JSON.parse(customResponses) 
          : customResponses;
          
        // Convert from {question: answer} format to [{question, answer}] format
        if (typeof parsedResponses === 'object' && parsedResponses !== null) {
          const entries = Object.entries(parsedResponses);
          // Only process if there are actual entries with non-empty questions and answers
          processedCustomResponses = entries
            .filter(([question, answer]) => 
              question && question.trim() && 
              answer && (Array.isArray(answer) ? answer.length > 0 : answer.toString().trim())
            )
            .map(([question, answer]) => ({
              question: question.trim(),
              answer: answer as string | string[]
            }));
        }
      } catch (error) {
        res.status(400).json({ message: 'Invalid custom responses format' });
        return;
      }
    }

    // Validate custom questions if they exist
    if (program.applicationForm.customQuestions.length > 0) {
      const requiredQuestions = program.applicationForm.customQuestions.filter(q => q.required);
      for (const requiredQuestion of requiredQuestions) {
        const response = processedCustomResponses.find(r => r.question === requiredQuestion.question);
        if (!response || !response.answer) {
          res.status(400).json({ 
            message: `Required custom question not answered: "${requiredQuestion.question}"` 
          });
          return;
        }
      }
    }

    // Create application
    const application = new InternshipApplication({
      program: program._id,
      name,
      email: email.toLowerCase(),
      phone,
      university,
      major,
      graduationYear: parseInt(graduationYear),
      gpa: gpa ? parseFloat(gpa) : undefined,
      portfolio,
      linkedIn,
      github,
      resume: req.file.path,
      coverLetter,
      customResponses: processedCustomResponses,
      source,
      referredBy
    });

    await application.save();

    // Update program application count
    await InternshipProgram.findByIdAndUpdate(
      program._id,
      { $inc: { currentApplicants: 1 } }
    );

    // Return success response (limited info for security)
    res.status(201).json({
      message: 'Application submitted successfully',
      applicationId: application._id,
      submittedAt: application.appliedDate
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Get all applications (HR/Admin only)
export const getAllApplications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { 
      program, 
      status, 
      assignedTo, 
      search,
      page = 1, 
      limit = 20 
    } = req.query;

    const filter: any = {};
    if (program) filter.program = program;
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;

    // Search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { university: { $regex: search, $options: 'i' } },
        { major: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const applications = await InternshipApplication.find(filter)
      .populate('program', 'title department location')
      .populate('assignedTo', 'name email')
      .populate('reviewedBy', 'name email')
      .select('-resume -customResponses -emailHistory -comments') // Exclude large fields for list view
      .sort({ appliedDate: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await InternshipApplication.countDocuments(filter);

    res.json({
      applications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Get application by ID (HR/Admin only)
export const getApplicationById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const application = await InternshipApplication.findById(id)
      .populate('program', 'title department location duration stipend')
      .populate('assignedTo', 'name email')
      .populate('reviewedBy', 'name email')
      .populate('comments.user', 'name email')
      .populate('emailHistory.sentBy', 'name email');

    if (!application) {
      res.status(404).json({ message: 'Application not found' });
      return;
    }

    res.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Update application status (HR/Admin only)
export const updateApplicationStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, comment, assignedTo, interviewDate, interviewType, offerDetails } = req.body;

    const application = await InternshipApplication.findById(id);
    if (!application) {
      res.status(404).json({ message: 'Application not found' });
      return;
    }

    // Update status
    if (status) {
      application.status = status;
      application.lastStatusUpdate = new Date();
    }

    // Update assignment
    if (assignedTo !== undefined) {
      application.assignedTo = assignedTo;
    }

    // Update interview details
    if (interviewDate) {
      application.interviewDate = new Date(interviewDate);
    }
    if (interviewType) {
      application.interviewType = interviewType;
    }

    // Update offer details
    if (offerDetails) {
      application.offerDetails = {
        ...application.offerDetails,
        ...offerDetails
      };
    }    // Mark as reviewed by current user
    application.reviewedBy = new mongoose.Types.ObjectId(req.user!.id);

    // Add comment if provided
    if (comment) {    application.comments.push({
      user: new mongoose.Types.ObjectId(req.user!.id),
      comment,
      isInternal: true,
      timestamp: new Date()
    } as any);
    }

    await application.save();

    const updatedApplication = await InternshipApplication.findById(id)
      .populate('program', 'title department')
      .populate('assignedTo', 'name email')
      .populate('reviewedBy', 'name email');

    res.json(updatedApplication);
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Add comment to application (HR/Admin only)
export const addComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { comment, isInternal = true } = req.body;

    if (!comment || comment.trim().length === 0) {
      res.status(400).json({ message: 'Comment is required' });
      return;
    }

    const application = await InternshipApplication.findById(id);
    if (!application) {
      res.status(404).json({ message: 'Application not found' });
      return;
    }    application.comments.push({
      user: new mongoose.Types.ObjectId(req.user!.id),
      comment: comment.trim(),
      isInternal,
      timestamp: new Date()
    } as any);

    await application.save();

    const updatedApplication = await InternshipApplication.findById(id)
      .populate('comments.user', 'name email')
      .select('comments');

    res.json({ 
      message: 'Comment added successfully',
      comments: updatedApplication?.comments 
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Bulk update applications (HR/Admin only)
export const bulkUpdateApplications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { applicationIds, status, assignedTo } = req.body;

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      res.status(400).json({ message: 'Application IDs are required' });
      return;
    }

    const updateData: any = {};
    if (status) {
      updateData.status = status;
      updateData.lastStatusUpdate = new Date();
    }
    if (assignedTo !== undefined) {
      updateData.assignedTo = assignedTo;
    }

    const result = await InternshipApplication.updateMany(
      { _id: { $in: applicationIds } },
      updateData
    );

    res.json({
      message: `Updated ${result.modifiedCount} applications`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error bulk updating applications:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Get application statistics (HR/Admin only)
export const getApplicationStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { program } = req.query;

    const matchFilter: any = {};
    if (program) matchFilter.program = program;

    // Status breakdown
    const statusStats = await InternshipApplication.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Applications over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const timelineStats = await InternshipApplication.aggregate([
      { 
        $match: { 
          ...matchFilter,
          appliedDate: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$appliedDate' },
            month: { $month: '$appliedDate' },
            day: { $dayOfMonth: '$appliedDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // University breakdown
    const universityStats = await InternshipApplication.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$university',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Program breakdown (if not filtered by program)
    let programStats = [];
    if (!program) {
      programStats = await InternshipApplication.aggregate([
        {
          $group: {
            _id: '$program',
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'internshipprograms',
            localField: '_id',
            foreignField: '_id',
            as: 'programDetails'
          }
        },
        { $unwind: '$programDetails' },
        {
          $project: {
            programTitle: '$programDetails.title',
            department: '$programDetails.department',
            count: 1
          }
        },
        { $sort: { count: -1 } }
      ]);
    }

    const totalApplications = await InternshipApplication.countDocuments(matchFilter);

    res.json({
      totalApplications,
      statusBreakdown: statusStats,
      timeline: timelineStats,
      universityBreakdown: universityStats,
      programBreakdown: programStats
    });
  } catch (error) {
    console.error('Error fetching application stats:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Download resume file (HR/Admin only)
export const downloadResume = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const application = await InternshipApplication.findById(id).select('resume name');
    if (!application) {
      res.status(404).json({ message: 'Application not found' });
      return;
    }

    const filePath = application.resume;
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ message: 'Resume file not found' });
      return;
    }

    const fileName = `${application.name.replace(/\s+/g, '_')}_Resume${path.extname(filePath)}`;
    
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading resume:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};
