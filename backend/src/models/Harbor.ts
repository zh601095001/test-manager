import mongoose, {Schema} from "mongoose";


const harborSchema: Schema = new Schema({
    imageName: {type: String, required: true, unique: true},
    info: {type: Object}
});


const Harbor = mongoose.model<IDevice>('Harbor', harborSchema);

export default Harbor;