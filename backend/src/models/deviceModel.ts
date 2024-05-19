import mongoose, {Schema, Document} from "mongoose";
import {IDevice} from "./types";
import {formatDate, formatDuration} from "../utils/utils";


const deviceSchema: Schema = new Schema({
    ip: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    locked: {type: Boolean, default: false},
    lockStartTime: {type: Date, default: null},
    purpose: {type: String, default: null},
});

deviceSchema.virtual('lockedDuration').get(function () {
    if (this.lockStartTime) {
        const lockEndTime = new Date();
        const lockStartTime = new Date(this.lockStartTime as Date);
        const lockDuration = Math.floor((lockEndTime.getTime() - lockStartTime.getTime()) / 1000);
        return formatDuration(lockDuration);
    }
    return null;
});

deviceSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        if (ret.lockStartTime) {
            ret.lockStartTime = formatDate(ret.lockStartTime); // 使用自定义的格式化日期函数
        }
        return ret;
    }
});
deviceSchema.set('toObject', {virtuals: true});

const Device = mongoose.model<IDevice>('Device', deviceSchema);

export default Device;