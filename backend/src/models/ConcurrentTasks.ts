import mongoose, {Document} from "mongoose";

const ConcurrentTaskSchema = new mongoose.Schema({});

// 创建 mongoose 模型
const ConcurrentTask = mongoose.model('ConcurrentTask', ConcurrentTasksSchema);

export default ConcurrentTask;