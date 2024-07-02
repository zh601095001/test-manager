import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    async rewrites() {
        return [
            {
                // 当你的前端代码尝试访问 /api/* 路径时
                source: '/api/:path*',
                // 这些请求将被重定向到另一个域上的相应API路径
                destination: 'http://192.168.6.94:8888/api/:path*',
            },
        ]
    },
    sassOptions: {
        includePaths: [path.join(import.meta.url, 'styles')],
    },
    webpack: (config, context) => {
        config.watchOptions = {
            poll: 1000,
            aggregateTimeout: 300
        }
        return config
    }
};


export default nextConfig;
