import mongoose, { Document } from 'mongoose';
export declare enum UserRole {
    ADMIN = "admin",
    HR = "hr",
    MANAGER = "manager",
    EMPLOYEE = "employee"
}
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    team?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=User.d.ts.map