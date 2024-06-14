import mongoose, {Document} from "mongoose";

const testEntrySchema = new mongoose.Schema({
    test_id: {
        type: String,
        required: true,
        unique: true
    },
    blob_urls: [String],
    status: {
        type: String,
        enum: ['unmerged', 'merged'],
        default: 'unmerged'
    },
    url: String,
    remote_url: String
}, {timestamps: true});

const TestEntry = mongoose.model('TestEntry', testEntrySchema);


export interface ITestEntry extends Document {
    _id?: string;
    test_id: string;
    blob_urls: string[];
    status: string;
    url: string;
    remote_url: string
}


export default TestEntry
