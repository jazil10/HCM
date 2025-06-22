import mongoose, { Document } from 'mongoose';
export interface IAttendance extends Document {
    employee: mongoose.Types.ObjectId;
    date: Date;
    checkIn?: Date;
    checkOut?: Date;
    breakTime?: number;
    totalHours?: number;
    status: 'present' | 'absent' | 'late' | 'half-day' | 'holiday' | 'leave';
    notes?: string;
    approvedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    calculateTotalHours(): number | undefined;
}
declare const _default: mongoose.Model<IAttendance, {}, {}, {}, mongoose.Document<unknown, {}, IAttendance, {}> & IAttendance & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Attendance.d.ts.map