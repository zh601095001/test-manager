import mongoose, {Document} from "mongoose";

// 定义接口描述用户数据结构
export interface IUser extends Document {
    username: string;
    password: string;
    roles: string[];
    refreshToken: string | null;
    email: string | null;
    avatar: string;
    settings: {
        deviceFilter: string[];
    }
}

// 创建 mongoose 模型的 Schema
const UserSchema = new mongoose.Schema<IUser>({
    // _id:{type:String,unique:true,required: true},
    username: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    roles: [{type: String}],
    refreshToken: {type: String, default: null},
    email: {type: String, default: null},
    avatar: {type: String},
    settings: {
        deviceFilters: [{type: Array}],
    }
});

// 创建 mongoose 模型
const User = mongoose.model<IUser>('User', UserSchema);

export default User;
