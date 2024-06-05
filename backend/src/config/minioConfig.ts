import {Client} from 'minio';

export const BUCKET_NAME = "gitlab"
export const ENDPOINT = "192.168.6.90"
export const PORT = 8003

const minioClient = new Client({
    endPoint: ENDPOINT, // 替换为你的MinIO服务器地址
    port: PORT, // 替换为你的MinIO服务器端口
    useSSL: false,
    accessKey: 'Nifu8RV0nwLh1muFFaSw', // 替换为你的访问密钥
    secretKey: '53cw1tBzSNr118vCwu6dyJwUd6C597M0Yjhf7IEZ', // 替换为你的密钥
});

export default minioClient;

