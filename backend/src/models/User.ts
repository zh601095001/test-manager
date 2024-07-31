import mongoose from "mongoose";

// 定义接口描述用户数据结构

// 创建 mongoose 模型的 Schema
const UserSchema = new mongoose.Schema<IUser>({
    // _id:{type:String,unique:true,required: true},
    username: {type: String, unique: true, required: true},
    nickName: {type: String},
    password: {type: String, required: true},
    roles: [{type: String}],
    refreshToken: {type: String, default: null}, // 弃用
    refreshTokens: {type: [String], default: []},
    email: {type: String, default: null},
    avatar: {type: String},
    settings: {
        deviceFilters: [String],
    },
    resetPasswordToken: {type: String, default: null}, // 新增的字段
    resetPasswordExpires: {type: Date, default: null}   // 新增的字段
});

// 创建 mongoose 模型
const User = mongoose.model<IUser>('User', UserSchema);

export default User;
