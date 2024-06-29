import mongoose, {Schema, Document} from "mongoose";
import {IDevice} from "./types";


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


const DeviceSettings = mongoose.model<IDevice>('DeviceSettings', deviceSettingsSchema);

export default DeviceSettings;