import {Client} from 'minio';

export const BUCKET_NAME = "gitlab"
export const ENDPOINT = "192.168.2.4"
export const PORT = 9000

const minioClient = new Client({
    endPoint: ENDPOINT, // 替换为你的MinIO服务器地址
    port: PORT, // 替换为你的MinIO服务器端口
    useSSL: false,
    accessKey: 'QCrV8tE638VFL7YYDt6v', // 替换为你的访问密钥
    secretKey: 'tptOxLlyB86kHelfWqpshITUyLAU7DwrFyRnnvya', // 替换为你的密钥
});

export default minioClient;

