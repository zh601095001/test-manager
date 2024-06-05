import mongoose from "mongoose";

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
    }
}, {timestamps: true});

const TestEntry = mongoose.model('TestEntry', testEntrySchema);


export interface ITestEntry {
    _id?: string;
    test_id: string;
    blob_urls: string[];
    status: string;
}


export default TestEntry
