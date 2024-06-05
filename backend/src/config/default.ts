import passport from 'passport';
import {Strategy as LocalStrategy, IVerifyOptions} from 'passport-local';
import {Strategy as JwtStrategy, ExtractJwt, VerifiedCallback} from 'passport-jwt';
import User, {IUser} from '../models/User'; // 确保 User 模型有 IUser 接口
import bcrypt from 'bcryptjs';
import {config} from "dotenv"
import * as process from "node:process";
import path from "path";
import {PassportStatic} from 'passport';

const envPath = path.join(__dirname, '../../.env');

config({
    path: envPath
})

interface DbConfig {
    uri: string;
}

interface SwaggerDefinition {
    openapi: string;
    info: {
        title: string;
        version: string;
        description: string;
    };
    components: {
        securitySchemes: {
            bearerAuth: {
                type: string;
                scheme: string;
                bearerFormat: string;
            }
        }
    };
    servers: any[]
}

interface SwaggerOptions {
    swaggerDefinition: SwaggerDefinition;
    apis: string[];
}

interface AppConfig {
    db: DbConfig;
    swaggerOptions: SwaggerOptions;
    passport: (passport: passport.PassportStatic) => void;
    JWT_SECRET: string,
    REFRESH_SECRET: string,
    // minio: any
}

const JWT_SECRET = process.env.JWT_SECRET || 'DB5ndHn0jEGvjzUoOxVZeCXvcZAMkyjIfj79sfbtS-w_2024-05-25T09:10:10.890366';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'C2z_X_OTmAW-VkDIZg2Jqr33FevNQBPGz1NnN5jrd1E';


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
        uri: process.env.MONGODB_URL || 'mongodb://mongodb:27017/deviceManagement',
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
