import mongoose, {Schema} from "mongoose";
import {IDeviceSettings} from "./types";


const deviceSettingsSchema: Schema = new Schema({
    _id: String,
    firmwareList: [
        {
            fileName: {type: String},
            objectName: {type: String}
        }
    ],
    switchScript: {type: String},
});


const DeviceSettings = mongoose.model<IDeviceSettings>('DeviceSettings', deviceSettingsSchema);

export default DeviceSettings;