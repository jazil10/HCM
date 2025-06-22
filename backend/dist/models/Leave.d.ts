import mongoose, { Document } from 'mongoose';
export interface ILeave extends Document {
    employee: mongoose.Types.ObjectId;
    leaveType: 'sick' | 'vacation' | 'personal' | 'maternity' | 'paternity' | 'emergency' | 'other';
    startDate: Date;
    endDate: Date;
    totalDays: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    appliedDate: Date;
    approvedBy?: mongoose.Types.ObjectId;
    approvedDate?: Date;
    rejectionReason?: string;
    attachments?: string[];
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ILeave, {}, {}, {}, mongoose.Document<unknown, {}, ILeave, {}> & ILeave & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Leave.d.ts.map