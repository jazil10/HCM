import mongoose, { Document } from 'mongoose';
export interface IEmployee extends Document {
    user: mongoose.Types.ObjectId;
    employeeId: string;
    department: string;
    position: string;
    joinDate: Date;
    salary: number;
    status: 'active' | 'inactive' | 'terminated';
    manager?: mongoose.Types.ObjectId;
    workLocation: string;
    phoneNumber?: string;
    emergencyContact?: {
        name: string;
        relationship: string;
        phone: string;
    };
    address?: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IEmployee, {}, {}, {}, mongoose.Document<unknown, {}, IEmployee, {}> & IEmployee & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Employee.d.ts.map