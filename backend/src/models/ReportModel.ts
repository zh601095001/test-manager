import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    test_id: {type: String, required: true, unique: true},
    config: {type: Object},
    suites: {type: Array},
    stats: {type: Object},
}, {timestamps: true});


const TestReport = mongoose.model('TestReport', reportSchema);

export default TestReport;
