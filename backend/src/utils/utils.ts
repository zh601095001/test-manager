import moment from "moment-timezone";
import {format} from 'date-fns';
import {Client, ConnectConfig} from 'ssh2';
import {createHash} from "crypto";
import {createReadStream} from "fs";

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


interface SSHResult {
    stdout: string;
    stderr: string;
    code: number | null;
    signal: string | null;
    error: string | null;
}

/**
 * Execute a command over SSH and return the results.
 *
 * @param {ConnectConfig} config - The SSH connection configuration.
 * @param {string} command - The command to execute.
 * @returns {Promise<SSHResult>} - The execution result.
 */
async function executeSSHCommand(config: ConnectConfig, command: string): Promise<SSHResult> {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        let result: SSHResult = {
            stdout: '',
            stderr: '',
            code: null,
            signal: null,
            error: null
        };

        conn.on('ready', () => {
            console.log('Client :: ready');
            conn.exec(command, (err, stream) => {
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
        }).connect(config);
    });
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
export {
    formatDuration,
    getDateInUTC8,
    formatDate,
    executeSSHCommand,
    getFileHash
}