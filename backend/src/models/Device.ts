import mongoose, {Schema, Document} from "mongoose";
import {IDevice} from "./types";
import {formatDate, formatDuration} from "../utils/utils";


const deviceSchema: Schema = new Schema({
    deviceName: {type: String, required: true},
    deviceIp: {type: String, required: true, unique: true},
    deviceMac: {type: String, required: true},
    deviceFirmware: {type: String},
    lockTime: {type: Date},
    user: {type: String},
    comment: {type: String, default: "-"},
    status: {type: String, default: "unlocked"},
});

deviceSchema.virtual('duration').get(function () {
    if (this.lockTime) {
        const lockEndTime = new Date();
        const lockStartTime = new Date(this.lockTime as Date);
        const lockDuration = Math.floor((lockEndTime.getTime() - lockStartTime.getTime()) / 1000);
        return formatDuration(lockDuration);
    }
    return null;
});

deviceSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        if (ret.lockTime) {
            ret.lockTime = formatDate(ret.lockTime); // 使用自定义的格式化日期函数
        }
        return ret;
    }
});
deviceSchema.set('toObject', {virtuals: true});

const Device = mongoose.model<IDevice>('Device', deviceSchema);

export default Device;