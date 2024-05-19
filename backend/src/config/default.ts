export default {
    db: {
        uri: 'mongodb://localhost:27017/deviceManagement',
    },
    swaggerOptions: {
        swaggerDefinition: {
            openapi: '3.0.0',
            info: {
                title: 'Device Management API',
                version: '1.0.0',
                description: 'API for managing device pool with locking and unlocking features'
            }
        },
        apis: ['./src/routes/*.ts'],
    }
};
