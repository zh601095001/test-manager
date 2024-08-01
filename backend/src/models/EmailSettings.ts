// models/EmailSettings.ts

import mongoose, { Document, Schema } from 'mongoose';

// 定义接口
export interface IEmailSettings extends Document {
    emailHost: string;
    emailPort: number;
    emailAuthUser: string;
    emailAuthPass: string;
    createdAt: Date;
}

// 定义Schema
const EmailSettingsSchema: Schema = new Schema({
    emailHost: { type: String, required: true },
    emailPort: { type: Number, required: true },
    emailAuthUser: { type: String, required: true },
    emailAuthPass: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// 创建并导出模型
export default mongoose.model<IEmailSettings>('EmailSettings', EmailSettingsSchema);
