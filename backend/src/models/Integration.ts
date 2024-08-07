import mongoose, {Schema} from "mongoose";


const integrationSchema: Schema = new Schema({
    testid: {type: String, required: true, unique: true},
    settings: {type: Object, default: {}, _id: false},
    integrationResult: [{type: Object, _id: false}]
});


const Integration = mongoose.model<IIntegration>('Integration', integrationSchema);

export default Integration;