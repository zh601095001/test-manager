import mongoose, {Schema} from 'mongoose';


const ConcurrentTaskSchema: Schema = new mongoose.Schema({
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
        of: Schema.Types.Mixed
    },
    info: {
        type: Map,
        of: Schema.Types.Mixed
    },
    executionPath: {
        type: String,
        default: './',
        trim: true
    },
    runtimeEnv: {
        type: Map,
        of: Schema.Types.Mixed
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

const ConcurrentTask = mongoose.model<IConcurrentTask>('ConcurrentTask', ConcurrentTaskSchema);

export default ConcurrentTask;
