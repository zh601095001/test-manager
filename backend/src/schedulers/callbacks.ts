import {IConcurrentTask} from "../models/ConcurrentTask";
import {ISequentialTask} from "../models/SequentialTask";
import mongoose from "mongoose";
import Device from "../models/Device";

interface Callbacks {
    [key: string]: (task: IConcurrentTask | ISequentialTask, model: mongoose.Model<IConcurrentTask | ISequentialTask>) => Promise<any>;
}

const callbacks: Callbacks = {
    updateFirmware: async (task, model) => {
        const _id = task._id
        const _task = await model.findById(_id)
        if (_task) {
            const {stdout, error, info} = _task
            const deviceIp = info.get("deviceIp")
            if (stdout && stdout.length) {
                await Device.findOneAndUpdate(
                    {
                        deviceIp,
                        comment: "-",
                        user: null,
                        status: "maintained"
                    },
                    {
                        $set: {
                            status: "unlocked",
                            deviceFirmware: stdout.join("")
                        }
                    },
                    {new: true}
                );
            }
            if (error) {
                await Device.findOneAndUpdate(
                    {
                        deviceIp,
                        status: {$ne: "locked"}
                    },
                    {
                        $set: {
                            comment: "-",
                            status: "maintained",
                            deviceFirmware: "获取固件版本失败"
                        }
                    },
                    {new: true}
                );
            }
        }
    }
}

export default callbacks;
