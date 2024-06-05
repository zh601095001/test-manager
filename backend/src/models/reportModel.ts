import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    test_id: {type: String, required: true, unique: true},
    config: {type: Object},
    suites: {type: Array},
    stats: {type: Object},
}, {timestamps: true});

export interface ITestReport {
    test_id: string;
    config?: any; // 如果 config 结构是固定的，可以具体定义它的类型
    suites?: any[]; // 同样，如果 suites 的结构是已知的，可以更详细地定义类型
    stats?: {
        duration?: number;
        expected?: number;
        unexpected?: number;
        skipped?: number;
        flaky?: number;
        [key: string]: any; // 如果有其他统计数据，可以添加更多可选属性
    };
}

const TestReport = mongoose.model('TestReport', reportSchema);

export default TestReport;
