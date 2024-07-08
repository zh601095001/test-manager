import {Client} from 'minio';
import * as process from "node:process";
import {checkEnvVars} from "../utils/utils";

checkEnvVars(["MINIO_ENDPOINT", "MINIO_ACCESS_KEY", "MINIO_SECRET_KEY", "MINIO_PORT"])
export const BUCKET_NAME = "gitlab"
export const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT as string
export const MINIO_PORT = parseInt(process.env.MINIO_PORT as string)
const minioClient = new Client({
    endPoint: MINIO_ENDPOINT, // 替换为你的MinIO服务器地址
    port: MINIO_PORT, // 替换为你的MinIO服务器端口
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY as string, // 替换为你的访问密钥
    secretKey: process.env.MINIO_SECRET_KEY as string, // 替换为你的密钥
});

export default minioClient;

