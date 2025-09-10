import { Request, Response } from 'express';
import Holiday from '../models/Holiday';
import { AuthenticatedRequest } from '../types/auth';

// Get all holidays
export const getHolidays = async (req: Request, res: Response): Promise<void> => {
  try {
    const { year, type } = req.query;
    
    let filter: any = {};
    
    if (year) {
      const startDate = new Date(parseInt(year as string), 0, 1);
      const endDate = new Date(parseInt(year as string), 11, 31);
      filter.date = { $gte: startDate, $lte: endDate };
    }
    
    if (type) {
      filter.type = type;
    }

    const holidays = await Holiday.find(filter)
      .populate('createdBy', 'name email')
      .sort({ date: 1 });

    res.json(holidays);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get holiday by ID
export const getHolidayById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const holiday = await Holiday.findById(id)
      .populate('createdBy', 'name email');
    
    if (!holiday) {
      res.status(404).json({ message: 'Holiday not found' });
      return;
    }

    res.json(holiday);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Create new holiday
export const createHoliday = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      date,
      description,
      isRecurring,
      type,
      applicableTo
    } = req.body;

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Check for duplicate holiday on the same date
    const existingHoliday = await Holiday.findOne({
      date: new Date(date),
      name: { $regex: new RegExp('^' + name + '$', 'i') }
    });

    if (existingHoliday) {
      res.status(400).json({ message: 'Holiday with this name already exists on this date' });
      return;
    }

    const holiday = new Holiday({
      name,
      date: new Date(date),
      description,
      isRecurring: isRecurring || false,
      type: type || 'company',
      applicableTo: applicableTo || ['all'],
      createdBy: userId
    });

    await holiday.save();
    
    const populatedHoliday = await Holiday.findById(holiday._id)
      .populate('createdBy', 'name email');

    res.status(201).json(populatedHoliday);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update holiday
export const updateHoliday = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name,
      date,
      description,
      isRecurring,
      type,
      applicableTo
    } = req.body;

    const holiday = await Holiday.findById(id);
    if (!holiday) {
      res.status(404).json({ message: 'Holiday not found' });
      return;
    }

    // Check for duplicate holiday on the same date (excluding current holiday)
    if (name && date) {
      const existingHoliday = await Holiday.findOne({
        _id: { $ne: id },
        date: new Date(date),
        name: { $regex: new RegExp('^' + name + '$', 'i') }
      });

      if (existingHoliday) {
        res.status(400).json({ message: 'Holiday with this name already exists on this date' });
        return;
      }
    }

    const updatedHoliday = await Holiday.findByIdAndUpdate(
      id,
      {
        name,
        date: date ? new Date(date) : holiday.date,
        description,
        isRecurring,
        type,
        applicableTo
      },
      { new: true }
    ).populate('createdBy', 'name email');

    res.json(updatedHoliday);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Delete holiday
export const deleteHoliday = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const holiday = await Holiday.findById(id);
    if (!holiday) {
      res.status(404).json({ message: 'Holiday not found' });
      return;
    }

    await Holiday.findByIdAndDelete(id);
    res.json({ message: 'Holiday deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get holidays for current month
export const getCurrentMonthHolidays = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const holidays = await Holiday.find({
      date: { $gte: startOfMonth, $lte: endOfMonth }
    }).sort({ date: 1 });

    res.json(holidays);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get upcoming holidays
export const getUpcomingHolidays = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 5 } = req.query;
    const today = new Date();
    
    const holidays = await Holiday.find({
      date: { $gte: today }
    })
    .sort({ date: 1 })
    .limit(parseInt(limit as string));

    res.json(holidays);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
