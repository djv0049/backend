import { Request, Response } from 'express';
import DailyTaskInstance from '../models/DailyTaskInstance';

export const updateTaskStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, remainingTime } = req.body;
    
    const task = await DailyTaskInstance.findByIdAndUpdate(
      id,
      { status, remainingTime, startedAt: status === 'in-progress' ? new Date() : undefined },
      { new: true }
    );
    
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
};
