import Harbor from "../models/Harbor";


async function getAllHarbors() {
    return Harbor.find();
}

async function getHarbor(imageName: string) {
    return Harbor.findOne({imageName});
}

async function updateHarbor(imageName: string, data: object) {
    const options = {new: true, upsert: true}; // 设置 upsert 为 true 来启用插入或更新功能
    try {
        return Harbor.findOneAndUpdate({imageName}, {imageName, ...data}, options); // 返回更新后的文档
    } catch (error) {
        // @ts-ignore
        throw new Error('Error updating or creating harbor: ' + error.message);
    }
}


export default {
    getAllHarbors,
    updateHarbor,
    getHarbor
}