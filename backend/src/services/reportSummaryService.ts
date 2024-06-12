// reportService.ts
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import {exec as execCallback} from 'child_process';
import * as tar from 'tar';
import TestEntry from '../models/testEntry';
import {promisify} from 'util';
import fileService from '../services/htmlReportService';
// import pLimit from 'p-limit';
import async from "async";

import {PassThrough} from "stream";
import * as process from "node:process";
import {ENDPOINT} from "../config/minioConfig";

// const limit = pLimit(10);
const exec = promisify(execCallback);

interface Entry {
    test_id: string;
    blob_urls: string[];
}

async function downloadFile(url: string, filepath: string): Promise<void> {
    const url_ = new URL(url)
    url_.hostname = ENDPOINT
    url_.search = ""
    const response = await axios({
        url: url_.href,
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
    const output = fs.createWriteStream(outputFilePath);
    const passThrough = new PassThrough();

    output.on('close', () => {
        console.log('Compression complete');
    });

    tar.c(
        {
            gzip: true,
            cwd: sourceDir
        },
        fs.readdirSync(sourceDir)
    ).pipe(passThrough);

    passThrough.pipe(output).on('error', (err) => {
        console.error('Error compressing directory:', err);
        throw err;
    });

    return new Promise((resolve, reject) => {
        output.on('finish', () => resolve(outputFilePath));
        output.on('error', reject);
    });
}

async function downloadAndMergeReports(testId: string): Promise<{ message: string; url: string; remote_url: string }> {
    const entry: Entry | null = await TestEntry.findOne({test_id: testId});
    if (!entry) {
        throw new Error('Test entry not found');
    }

    const downloadDir = path.join(__dirname, '../downloads', `${testId}_${Date.now()}`);
    const zipFilename = `${testId}_${Date.now()}.tar.gz`;
    const zipPath = path.join(downloadDir, zipFilename);
    fs.mkdirSync(downloadDir, {recursive: true});

    const filepaths: string[] = await new Promise((resolve, reject) => {
        const downloadTasks = entry.blob_urls.map(blobUrl => {
            return async (callback: any) => {
                const filename = path.basename(new URL(blobUrl).pathname) + ".zip";
                const filepath = path.join(downloadDir, filename);
                downloadFile(blobUrl, filepath).then(() => {
                    callback(null, filepath);
                }).catch(err => {
                    callback(err);
                });
            };
        });

        async.parallelLimit(downloadTasks, 5, (err, results) => {
            if (err) {
                console.error("Error executing downloads:", err);
                reject(err)
            } else {
                // @ts-ignore
                resolve(results)
                console.log("All files downloaded:", results);
            }
        });
    })


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
    fs.rmSync(downloadDir, {recursive: true, force: true});
    const remote_url = new URL(url)
    remote_url.hostname = "10.25.46.28"
    return {
        message: 'Reports are processed',
        url,
        remote_url: remote_url.href
    };
}

export {
    downloadAndMergeReports
};
