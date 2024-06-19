import mongoose from 'mongoose';

export interface ErrorLog {
    timestamp: Date;
    level: string;  // 如 'error', 'warn', 'info'
    message: string;
    stack?: string;  // 错误堆栈，可选
    service: string;  // 服务名，例如 'UserService'
    extraInfo?: any;  // 额外信息，用于存储额外的错误细节或上下文
}


const errorLogSchema = new mongoose.Schema({
    timestamp: {type: Date, default: Date.now},
    level: {type: String, required: true},
    message: {type: String, required: true},
    stack: {type: String},
    service: {type: String, required: true},
    extraInfo: {type: mongoose.Schema.Types.Mixed}
});

export const ErrorLogModel = mongoose.model('ErrorLog', errorLogSchema);
