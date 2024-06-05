// reportService.ts
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import {exec as execCallback} from 'child_process';
import * as tar from 'tar';
import TestEntry from '../models/testEntry';
import {promisify} from 'util';
import fileService from '../services/htmlReportService';


const exec = promisify(execCallback);

interface Entry {
    test_id: string;
    blob_urls: string[];
}

async function downloadFile(url: string, filepath: string): Promise<void> {
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });
    return new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(filepath);
        response.data.pipe(writer);
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

async function compressDirectory(sourceDir: string, outputFilePath: string): Promise<string> {
    const files = fs.readdirSync(sourceDir);

    return tar.c(
        {
            gzip: true,            // 开启 gzip 压缩
            file: outputFilePath,  // 指定输出文件路径
            cwd: sourceDir         // 设置当前工作目录为源目录
        },
        files  // 直接传递读取到的文件列表，而不是目录本身
    ).then(() => {
        console.log('Compression complete');
        return outputFilePath;
    }).catch(err => {
        console.error('Error compressing directory:', err);
        throw err;
    });
}

async function downloadAndMergeReports(testId: string): Promise<{ message: string; url: string; }> {
    const entry: Entry | null = await TestEntry.findOne({test_id: testId});
    if (!entry) {
        throw new Error('Test entry not found');
    }

    const downloadDir = path.join(__dirname, '../downloads', `${testId}_${Date.now()}`);
    const zipFilename = `${testId}_${Date.now()}.tar.gz`;
    const zipPath = path.join(downloadDir, zipFilename);
    fs.mkdirSync(downloadDir, {recursive: true});

    const filepaths: string[] = await Promise.all(entry.blob_urls.map(async (blobUrl) => {
        const filename = path.basename(new URL(blobUrl).pathname) + ".zip";
        const filepath = path.join(downloadDir, filename);
        await downloadFile(blobUrl, filepath);
        return filepath;
    }));

    const config = `export default {
        reporter: [['html', { open: 'never', outputFolder: './html' }]],
        testDir: "/ui-test/src/tests"
    };`
    const configPath = path.join(downloadDir, "merge.config.ts")
    fs.writeFileSync(configPath, config)

    await exec(`npx playwright merge-reports ${downloadDir} -c ${configPath}`);

    filepaths.forEach(file => {
        fs.unlinkSync(file);
    });

    const zippedPath = await compressDirectory(path.join(downloadDir, "html"), zipPath);
    const url = await fileService.handleFileUpload(zippedPath)
    fs.rmSync(downloadDir, { recursive: true, force: true });
    return {
        message: 'Reports are processed',
        url
    };
}

export {
    downloadAndMergeReports
};
