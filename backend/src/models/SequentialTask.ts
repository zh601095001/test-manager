import mongoose, {Document, ObjectId, Schema} from 'mongoose';

export interface ISequentialTask extends Document {
    _id: ObjectId
    description: string;
    taskType: 'ssh' | 'python' | 'sql' | 'bash';
    script: string;
    environment?: {
        host?: string;
        port?: number;
        username?: string;
        password?: string;
        privateKey?: string;
        passphrase?: string;
    };
    executionPath: string;
    runtimeEnv?: Map<string, string>;
    parameters?: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    createdAt: Date;
    username: string;
    stdout: string[];
    stderr: string[]
}

const SequentialTaskSchema: Schema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    taskType: {
        type: String,
        required: true,
        enum: ['ssh', 'python', 'sql', 'bash'],
        trim: true
    },
    script: {
        type: String,
        required: true,
        trim: true
    },
    environment: {
        type: Map,
        of: new Schema({
            host: String,
            port: Number,
            username: String,
            password: String,
            privateKey: String,
            passphrase: String
        }, {_id: false}) // Prevents _id creation for subdocument
    },
    executionPath: {
        type: String,
        default: './',
        trim: true
    },
    runtimeEnv: {
        type: Map,
        of: String,
    },
    parameters: {
        type: [String],
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'running', 'completed', 'failed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    username: {
        type: String
    },
    stdout: {
        type: [String],
        default: []
    },
    stderr: {
        type: [String],
        default: []
    }
});

const SequentialTask = mongoose.model<ISequentialTask>('SequentialTask', SequentialTaskSchema);

export default SequentialTask;
