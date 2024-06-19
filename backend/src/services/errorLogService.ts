import {ErrorLogModel} from "../models/ErrorLog";

export function logError(error: Error, service: string, extraInfo?: any) {
    const errorLog = new ErrorLogModel({
        level: 'error',
        message: error.message,
        stack: error.stack,
        service: service,
        extraInfo: extraInfo
    });

    errorLog.save().catch(err => {
        console.error('Failed to save error log:', err);
    });
}
