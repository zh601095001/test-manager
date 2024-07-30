import {PassportStatic} from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';
import {ExtractJwt, Strategy as JwtStrategy} from 'passport-jwt';
import User from '../models/User'; // 确保 User 模型有 IUser 接口
import bcrypt from 'bcryptjs';
import * as process from "node:process";
import {checkEnvVars} from "../utils/utils";


checkEnvVars(["MINIO_ENDPOINT", "MINIO_ACCESS_KEY", "MINIO_SECRET_KEY", "MINIO_PORT", "JWT_SECRET", "REFRESH_SECRET", "REDIS_URL"])

const JWT_SECRET = process.env.JWT_SECRET as string;
const REFRESH_SECRET = process.env.REFRESH_SECRET as string;
const MONGODB_URL = process.env.MONGODB_URL as string
const REDIS_URL = process.env.REDIS_URL as string
const configPassport = (passport: PassportStatic) => {
    // 使用本地策略进行用户认证
    passport.use(new LocalStrategy({
        usernameField: 'username'
    }, async (username: string, password: string, done) => {
        try {
            const user = await User.findOne({username}) as IUser | null;
            if (!user || !bcrypt.compareSync(password, user.password)) {
                return done(null, false, {message: 'Incorrect username or password.'});
            }
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }));

    // 使用JWT策略进行用户认证
    passport.use(new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: JWT_SECRET
    }, async (jwt_payload, done) => {
        try {
            const user = await User.findById(jwt_payload.sub) as IUser | null;
            if (!user) {
                return done(null, false);
            }
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }));
}

const appConfig: AppConfig = {
    db: {
        uri: MONGODB_URL,
    },
    redis: {
        uri: REDIS_URL
    },
    swaggerOptions: {
        swaggerDefinition: {
            openapi: '3.0.0',
            info: {
                title: '设备池管理 & 自动化测试',
                version: '2.0.0',
                description: '自动化测试设备池管理及自动化测试CI/CD流程'
            },
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT'
                    }
                }
            },
            servers: [
                {
                    "url": "/api",
                    "description": "Base path for all endpoints"
                }
            ],
        },
        apis: ['./src/routes/*.ts'],
    },
    passport: configPassport,
    JWT_SECRET,
    REFRESH_SECRET,
};

export default appConfig;
