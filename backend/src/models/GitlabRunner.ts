import mongoose, {Schema} from "mongoose";


const sshConfigSchema: Schema = new Schema({
    username: {type: String},
    password: {type: String}
}, {_id: false, default: {username: "root", password: "admin"}});


const gitlabRunnerSchema: Schema = new Schema({
    runnerName: {type: String, required: true},
    runnerIp: {type: String, required: true},
    runnerPort: {type: Number, required: true},
    status: {type: String, default: "pause"},
    tags: {type: [String], required: true},
    comment: {type: String, default: "-"},
    sshConfig: sshConfigSchema,
}, {timestamps: true});

const GitlabRunner = mongoose.model<IGitlabRunner>('GitlabRunner', gitlabRunnerSchema);

export default GitlabRunner;
