import mongoose, {Document} from "mongoose";

const SequentialTaskSchema = new mongoose.Schema({

});

// 创建 mongoose 模型
const SequentialTask = mongoose.model('SequentialTask', SequentialTaskSchema);

export default SequentialTask;