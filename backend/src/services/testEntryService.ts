import TestEntry, {ITestEntry} from "../models/testEntry";

interface TestData {
    blob_urls?: string[];
    status?: string;
}

async function createOrUpdateTestEntry(testId: string, data: TestData): Promise<any> {
    const existingEntry = await TestEntry.findOne({test_id: testId});
    if (existingEntry) {
        // 使用 $addToSet 而不是 $push，以避免重复
        let updateData: any = {};
        if (data.blob_urls && data.blob_urls.length > 0) {
            updateData = {
                $addToSet: {blob_urls: {$each: data.blob_urls}}
            };
        }
        if (data.status) {
            updateData['$set'] = {status: data.status};
        }
        return TestEntry.findOneAndUpdate({test_id: testId}, updateData, {new: true});
    } else {
        return TestEntry.create({test_id: testId, ...data});
    }
}


async function getEntriesByStatus(status: string): Promise<ITestEntry[]> {
    return TestEntry.find({status: status});
}

export default {
    createOrUpdateTestEntry,
    getEntriesByStatus
};
