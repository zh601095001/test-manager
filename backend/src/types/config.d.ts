declare global {
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
        JWT_SECRET: string;
        REFRESH_SECRET: string;
        redis: {
            uri: string;
        };
        // minio: any;
    }
}

export {};
