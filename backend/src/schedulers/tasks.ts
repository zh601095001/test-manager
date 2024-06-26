import {executeSSHCommand, getHarborLatestImageVersion} from '../utils/utils'; // 引入SSH执行函数
import Device from "../models/Device";
import cron from "node-cron";
import harborService from "../services/harborService";

async function fetchDevicesAndUpdateFirmware() {
    const devices = await Device.find({"refreshFirmware.flag": true});

    for (const device of devices) {
        const {port, username, password} = device.sshConfig
        if (!port || !username || !password) {
            console.error("ssh配置不完整")
        }
        const {refreshScript} = device.refreshFirmware || {}
        if (!refreshScript) {
            console.log("刷新脚本不存在")
        }
        console.log(`开始处理设备: ${device.id}, IP: ${device.deviceIp}`);
        const config = {
            host: device.deviceIp,
            port,
            username,  // 替换为实际的SSH用户名
            password   // 替换为实际的SSH密码
        };

        try {
            const result = await executeSSHCommand(config, refreshScript);
            console.log(result)
            // 由系统自动触发的设备获取到ip后恢复到非锁定状态
            await Device.findOneAndUpdate(
                {
                    _id: device._id,
                    comment: "-",
                    user: null,
                    status: "maintained"
                },
                {
                    $set: {
                        status: "unlocked"
                    }
                },
                {new: true}
            );
            device.deviceFirmware = result.stdout.trim()
            await device.save()
        } catch (error) {
            // 非锁定状态的设备在获取ip失败后才设置为维护状态
            await Device.findOneAndUpdate(
                {
                    _id: device._id,
                    status: {$ne: "locked"}
                },
                {
                    $set: {
                        comment: "-",
                        status: "maintained"
                    }
                },
                {new: true}
            );
            device.deviceFirmware = "获取固件版本失败"
            await device.save()
        }
    }
}


async function clearAllLockedDevice() {
    const devices = await Device.find({status: "locked"})
    for (const device of devices) {
        device.status = "unlocked"
        device.user = ""
        device.lockTime = null
        device.comment = null
        await device.save()
    }
}

async function fetchHarborsAndUpdate() {
    const harborHost = "repository.bxplc.cn";
    const projectName = "auto";
    const repositoryName = "xin3-theia-app";
    const xin3TheiaLatestImageVersion = await getHarborLatestImageVersion({
        harborHost,
        projectName,
        repositoryName,
        username: "esuser",
        password: "Esuser123123"
    })
    const fullImageName = `${harborHost}/${projectName}/${repositoryName}`;
    await harborService.updateHarbor(repositoryName, {
        info: {
            version: xin3TheiaLatestImageVersion,
            fullImageName
        }
    })
}

export default function () {
    cron.schedule('* * * * *', async () => {
        await fetchDevicesAndUpdateFirmware();
        await fetchHarborsAndUpdate()
    });
    cron.schedule('0 2 * * *', async () => {
        await clearAllLockedDevice()
    });
}
