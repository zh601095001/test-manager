import TestReport, { ITestReport } from "../models/ReportModel";

interface IReportService {
    mergeReports(testId: string, newReport: ITestReport): Promise<ITestReport>;
    getReportByTestId(testId: string): Promise<ITestReport | null>;
    getAllReports(): Promise<ITestReport[]>;
}

const reportService: IReportService = {
    async mergeReports(testId: string, newReport: ITestReport): Promise<ITestReport> {
        let existingReport = await TestReport.findOne({ test_id: testId });
        if (existingReport) {
            existingReport.suites = existingReport.suites.concat(newReport.suites);

            if (newReport.stats) {
                existingReport.stats.duration += newReport.stats.duration ?? 0;
                existingReport.stats.expected += newReport.stats.expected ?? 0;
                existingReport.stats.unexpected += newReport.stats.unexpected ?? 0;
                existingReport.stats.skipped += newReport.stats.skipped ?? 0;
                existingReport.stats.flaky += newReport.stats.flaky ?? 0;
            }

            await existingReport.save();
            return existingReport;
        } else {
            newReport.config = {}
            let report = new TestReport(newReport);
            await report.save();
            return report;
        }
    },

    async getReportByTestId(testId: string): Promise<ITestReport | null> {
        return TestReport.findOne({test_id: testId});
    },

    async getAllReports(): Promise<ITestReport[]> {
        return TestReport.find({});
    }
};

export default reportService;
