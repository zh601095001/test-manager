import mongoose, {Document, ObjectId, Schema} from 'mongoose';


export interface ISequentialTask extends Document {
    _id: ObjectId;
    title: string;
    description: string;
    taskType: 'ssh' | 'python' | 'sql' | 'bash';
    script: string;
    environment?: Map<string, string | number>;
    executionPath: string;
    runtimeEnv?: Map<string, string>;
    status: 'pending' | 'running' | 'completed' | 'failed';
    createdAt: Date;
    username: string;
    stdout: string[];
    stderr: string[],
    callbackName: string;
    exitCode: number;
    exitSignal: string;
    error: string;
    info: Map<string, string>;
    templateVariables: Map<string, string>;
}

const SequentialTaskSchema: Schema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
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
    templateVariables: {
        type: Map,
        of: Schema.Types.Mixed
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
    info: {
        type: Map,
        of: String,
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
    },
    exitCode: {
        type: Number
    },
    exitSignal: {
        type: String
    },
    error: {
        type: String
    },
    callbackName: {
        type: String
    }
});

const SequentialTask = mongoose.model<ISequentialTask>('SequentialTask', SequentialTaskSchema);

export default SequentialTask;
