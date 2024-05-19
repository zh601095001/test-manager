/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                // 当你的前端代码尝试访问 /api/* 路径时
                source: '/api/:path*',
                // 这些请求将被重定向到另一个域上的相应API路径
                destination: 'http://localhost:8080/:path*',
            },
        ]
    },
};


export default nextConfig;
