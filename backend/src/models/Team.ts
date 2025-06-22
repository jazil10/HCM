import mongoose, { Document, Schema } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  manager: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema: Schema = new Schema<ITeam>({
  name: { type: String, required: true },
  manager: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

export default mongoose.model<ITeam>('Team', TeamSchema); 