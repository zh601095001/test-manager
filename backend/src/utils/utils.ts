import moment from "moment-timezone";
import {format} from 'date-fns';
import {Client, ConnectConfig} from 'ssh2';
import {createHash} from "crypto";
import {createReadStream} from "fs";
import {Document, Model, Schema} from 'mongoose';
import axios from "axios";
import {Request} from 'express';
import {EventEmitter} from 'events';

function formatDuration(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function getDateInUTC8() {
    return moment().tz('Asia/Shanghai').toDate();
}

function formatDate(date: Date): string {
    return format(date, 'yyyy/MM/dd HH:mm:ss');
}


/**
 * Execute a command over SSH and return the results.
 *
 * @param {ConnectConfig} config - The SSH connection configuration.
 * @param {string} command - The command to execute.
 * @returns {Promise<SSHResult>} - The execution result.
 */
async function executeSSHCommand(config: Config, command: string): Promise<SSHResult> {
    let {executionPath, runtimeEnv, ...connectConfig} = config
    return new Promise((resolve, reject) => {
        const conn = new Client();
        let result: SSHResult = {
            stdout: '',
            stderr: '',
            code: null,
            signal: null,
            error: null
        };
        const envObject = runtimeEnv ? Object.fromEntries(runtimeEnv) : {}
        conn.on('ready', () => {
            console.log('Client :: ready');
            const fullCommand = executionPath ? `cd ${executionPath} && ${command}` : command;
            conn.exec(fullCommand, {env: envObject}, (err, stream) => {
                if (err) {
                    result.error = err.message;
                    reject(result);
                    return;
                }

                stream.on('close', (code: any, signal: any) => {
                    result.code = code;
                    result.signal = signal;
                    resolve(result);
                    conn.end();
                }).on('data', (data: any) => {
                    result.stdout += data.toString();
                }).stderr.on('data', (data) => {
                    result.stderr += data.toString();
                });
            });
        }).on('error', (err) => {
            result.error = err.message;
            reject(result);
        }).connect(connectConfig);
    });
}

export class SSHStream extends EventEmitter {
    execute(config: Config, command: string) {
        let {executionPath, runtimeEnv, ...connectConfig} = config;
        const conn = new Client();
        const envObject = runtimeEnv ? Object.fromEntries(runtimeEnv) : {};

        conn.on('ready', () => {
            this.emit('ready');
            const fullCommand = executionPath ? `cd ${executionPath} && ${command}` : command;
            conn.exec(fullCommand, {env: envObject}, (err, stream) => {
                if (err) {
                    this.emit('error', err.message);
                    conn.end();
                    return;
                }

                let stdoutBuffer = '';
                let stderrBuffer = '';

                stream.on('close', (code: number | undefined, signal: string | undefined) => {
                    // 在关闭前发送任何剩余的输出
                    if (stdoutBuffer.length) {
                        this.emit('data', stdoutBuffer);
                    }
                    if (stderrBuffer.length) {
                        this.emit('stderr', stderrBuffer);
                    }
                    this.emit('close', {code, signal});
                    conn.end();
                }).on('data', (data: Buffer | string) => {
                    stdoutBuffer += data.toString();
                    let lines = stdoutBuffer.split('\n');
                    while (lines.length > 1) {
                        this.emit('data', lines.shift());
                    }
                    stdoutBuffer = lines.join('');
                }).stderr.on('data', (data) => {
                    stderrBuffer += data.toString();
                    let lines = stderrBuffer.split('\n');
                    while (lines.length > 1) {
                        this.emit('stderr', lines.shift());
                    }
                    stderrBuffer = lines.join('');
                });
            });
        }).on('error', (err) => {
            this.emit('error', err.message);
        }).connect(connectConfig);
    }
}

const getFileHash = (filePath: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const hash = createHash('md5');
        const stream = createReadStream(filePath);

        stream.on('data', (chunk) => {
            hash.update(chunk);
        });

        stream.on('end', () => {
            resolve(hash.digest('hex'));
        });

        stream.on('error', (err) => {
            reject(err);
        });
    });
};


async function findOneAndUpdate<T extends Document>(
    model: Model<T>,
    query: Record<string, any>,
    update: Record<string, any>,
    options: UpdateOptions,
    req: Request  // 添加了 req 参数来检查连接状态
): Promise<T | null> {
    const {delay = 1000, ...mongooseOptions} = options;

    while (true) {
        if (req.socket.destroyed) {
            console.log('客户端连接已断开，停止进程');
            return null;  // 如果客户端连接已断开，则退出函数
        }

        // 使用 findOneAndUpdate 并等待 Promise 解析
        const doc: T | null = await model.findOneAndUpdate(query, update, {...mongooseOptions, new: true}).exec();
        if (doc) {
            return doc;  // Document found and updated, returning result
        } else if (!mongooseOptions.upsert) {
            // No document found and upsert is not enabled, retry after delay
            await new Promise(resolve => setTimeout(resolve, delay));
            console.log('No document found, retrying...');
        } else {
            return null;  // If upsert is enabled and still no document, no need to retry, return null
        }
    }
}


async function getHarborLatestImageVersion(
    {
        harborHost,
        projectName,
        repositoryName,
        username,
        password
    }: {
        harborHost: string;
        projectName: string;
        repositoryName: string;
        username: string;
        password: string;
    }
) {
    const url = `http://${harborHost}/api/v2.0/projects/${projectName}/repositories/${repositoryName}/artifacts?with_scan_overview=true`;
    try {
        const response = await axios.get(url, {
            auth: {
                username: username,
                password: password
            }
        });
        if (response.data.length > 0 && response.data[0].tags) {
            return response.data[0].tags[0].name;
        }
        return null;
    } catch (error:any) {
        console.error('Error fetching the latest image version:', error.message);
        return null;
    }
}

function setPostUpdateMiddleware<T extends Document>(schema: Schema<T>, postUpdate: (result: any) => void): void {
    schema.post(/update/i, postUpdate)
}

function renderScript(templateVariables: Map<string, string | number>, script: string): string {
    return script.replace(/{{(\w+)}}/g, (match, key) => {
        if (templateVariables.has(key)) {
            const value = templateVariables.get(key);
            return value !== undefined ? String(value) : match;
        }
        return match;
    }) + "\n";
}

function checkEnvVars(envVars: string[]): void {
    for (let env of envVars) {
        if (!process.env[env]) {
            throw new Error(`${env} Required`);
        }
    }
}

export {
    formatDuration,
    getDateInUTC8,
    formatDate,
    executeSSHCommand,
    getFileHash,
    findOneAndUpdate,
    getHarborLatestImageVersion,
    setPostUpdateMiddleware,
    renderScript,
    checkEnvVars
}