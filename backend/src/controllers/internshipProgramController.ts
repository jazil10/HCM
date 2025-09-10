import { Response, Request } from 'express';
import InternshipProgram, { IInternshipProgram, ProgramStatus } from '../models/InternshipProgram';
import { AuthenticatedRequest } from '../types/auth';
import { UserRole } from '../models/User';

// Get all internship programs (Admin/HR view)
export const getAllPrograms = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status, department, page = 1, limit = 10 } = req.query;
    
    const filter: any = {};
    if (status) filter.status = status;
    if (department) filter.department = department;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const programs = await InternshipProgram.find(filter)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await InternshipProgram.countDocuments(filter);

    res.json({
      programs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching programs:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Get active programs for public view
export const getActivePrograms = async (req: Request, res: Response): Promise<void> => {
  try {
    const programs = await InternshipProgram.find({
      status: ProgramStatus.ACTIVE,
      applicationDeadline: { $gte: new Date() }
    })
    .select('title description department location duration startDate endDate applicationDeadline maxApplicants currentApplicants requirements skills benefits stipend isRemote publicSlug')
    .sort({ applicationDeadline: 1 });

    res.json(programs);
  } catch (error) {
    console.error('Error fetching active programs:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Get program by slug (public access)
export const getProgramBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;    const program = await InternshipProgram.findOne({
      publicSlug: slug,
      status: ProgramStatus.ACTIVE,
      applicationDeadline: { $gte: new Date() }
    }).select('title description department location duration startDate endDate applicationDeadline maxApplicants currentApplicants requirements skills benefits stipend isRemote applicationForm');

    if (!program) {
      // Check if program exists but with different status
      const draftProgram = await InternshipProgram.findOne({ publicSlug: slug });
      if (draftProgram) {
        res.status(404).json({ 
          message: `Program found but not available for applications. Status: ${draftProgram.status}`,
          debug: {
            status: draftProgram.status,
            deadline: draftProgram.applicationDeadline,
            isExpired: new Date(draftProgram.applicationDeadline) < new Date()
          }
        });
      } else {
        res.status(404).json({ message: 'Program not found' });
      }
      return;
    }

    res.json(program);
  } catch (error) {
    console.error('Error fetching program by slug:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Get program by ID (Admin/HR access)
export const getProgramById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const program = await InternshipProgram.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!program) {
      res.status(404).json({ message: 'Program not found' });
      return;
    }

    res.json(program);
  } catch (error) {
    console.error('Error fetching program:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Create new internship program (Admin/HR only)
export const createProgram = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      department,
      location,
      duration,
      startDate,
      endDate,
      applicationDeadline,
      maxApplicants,
      requirements,
      skills,
      benefits,
      stipend,
      isRemote,
      applicationForm,
      publicSlug
    } = req.body;

    // Validate required fields
    if (!title || !description || !department || !location || !duration || !startDate || !endDate || !applicationDeadline || !maxApplicants) {
      res.status(400).json({ 
        message: 'Missing required fields: title, description, department, location, duration, startDate, endDate, applicationDeadline, maxApplicants' 
      });
      return;
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const deadline = new Date(applicationDeadline);
    const now = new Date();

    if (deadline <= now) {
      res.status(400).json({ message: 'Application deadline must be in the future' });
      return;
    }

    if (start >= end) {
      res.status(400).json({ message: 'Start date must be before end date' });
      return;
    }

    if (deadline >= start) {
      res.status(400).json({ message: 'Application deadline must be before program start date' });
      return;
    }    // Generate publicSlug if not provided
    let generatedSlug = publicSlug;
    if (!generatedSlug) {
      const baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      generatedSlug = `${baseSlug}-${Date.now()}`;
      
      // Ensure uniqueness
      let counter = 1;
      while (await InternshipProgram.findOne({ publicSlug: generatedSlug })) {
        generatedSlug = `${baseSlug}-${Date.now()}-${counter}`;
        counter++;
      }
    } else {
      // Check if provided slug is unique
      const existingProgram = await InternshipProgram.findOne({ publicSlug: generatedSlug });
      if (existingProgram) {
        res.status(400).json({ message: 'Public slug already exists' });
        return;
      }
    }

    const program = new InternshipProgram({
      title,
      description,
      department,
      location,
      duration,
      startDate: start,
      endDate: end,
      applicationDeadline: deadline,
      maxApplicants,
      requirements: requirements || [],
      skills: skills || [],
      benefits: benefits || [],      stipend,
      isRemote: isRemote || false,
      createdBy: req.user!.id,
      publicSlug: generatedSlug,      applicationForm: applicationForm || {
        requiredFields: ['name', 'email', 'phone', 'university', 'major', 'graduationYear', 'resume'],
        optionalFields: ['gpa', 'portfolio', 'linkedIn', 'github', 'coverLetter'],
        customQuestions: []
      }
    });

    await program.save();

    const populatedProgram = await InternshipProgram.findById(program._id)
      .populate('createdBy', 'name email');

    res.status(201).json(populatedProgram);
  } catch (error) {
    console.error('Error creating program:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Update internship program (Admin/HR only)
export const updateProgram = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Add updatedBy field
    updateData.updatedBy = req.user!.id;

    // Validate dates if provided
    if (updateData.startDate || updateData.endDate || updateData.applicationDeadline) {
      const program = await InternshipProgram.findById(id);
      if (!program) {
        res.status(404).json({ message: 'Program not found' });
        return;
      }

      const start = new Date(updateData.startDate || program.startDate);
      const end = new Date(updateData.endDate || program.endDate);
      const deadline = new Date(updateData.applicationDeadline || program.applicationDeadline);

      if (start >= end) {
        res.status(400).json({ message: 'Start date must be before end date' });
        return;
      }

      if (deadline >= start) {
        res.status(400).json({ message: 'Application deadline must be before program start date' });
        return;
      }
    }

    // Check if slug is unique (if being updated)
    if (updateData.publicSlug) {
      const existingProgram = await InternshipProgram.findOne({ 
        publicSlug: updateData.publicSlug,
        _id: { $ne: id }
      });
      if (existingProgram) {
        res.status(400).json({ message: 'Public slug already exists' });
        return;
      }
    }

    const updatedProgram = await InternshipProgram.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

    if (!updatedProgram) {
      res.status(404).json({ message: 'Program not found' });
      return;
    }

    res.json(updatedProgram);
  } catch (error) {
    console.error('Error updating program:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Delete internship program (Admin only)
export const deleteProgram = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const program = await InternshipProgram.findById(id);
    if (!program) {
      res.status(404).json({ message: 'Program not found' });
      return;
    }

    // Check if program has applications before deleting
    const InternshipApplication = require('../models/InternshipApplication').default;
    const applicationCount = await InternshipApplication.countDocuments({ program: id });
    
    if (applicationCount > 0) {
      res.status(400).json({ 
        message: `Cannot delete program with ${applicationCount} applications. Archive it instead.` 
      });
      return;
    }

    await InternshipProgram.findByIdAndDelete(id);
    res.json({ message: 'Program deleted successfully' });
  } catch (error) {
    console.error('Error deleting program:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Get program statistics (Admin/HR only)
export const getProgramStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const program = await InternshipProgram.findById(id);
    if (!program) {
      res.status(404).json({ message: 'Program not found' });
      return;
    }

    const InternshipApplication = require('../models/InternshipApplication').default;
    
    // Get application statistics
    const stats = await InternshipApplication.aggregate([
      { $match: { program: program._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalApplications = await InternshipApplication.countDocuments({ program: id });
    
    // Get recent applications
    const recentApplications = await InternshipApplication.find({ program: id })
      .select('name email appliedDate status')
      .sort({ appliedDate: -1 })
      .limit(10);

    // Calculate application rate over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const applicationTrend = await InternshipApplication.aggregate([
      { 
        $match: { 
          program: program._id,
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

    res.json({
      program: {
        id: program._id,
        title: program.title,
        maxApplicants: program.maxApplicants,
        currentApplicants: program.currentApplicants
      },
      totalApplications,
      statusBreakdown: stats,
      recentApplications,
      applicationTrend
    });
  } catch (error) {
    console.error('Error fetching program stats:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};
