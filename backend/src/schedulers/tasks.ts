import {executeSSHCommand, getHarborLatestImageVersion} from '../utils/utils'; // 引入SSH执行函数
import Device from "../models/Device";
import cron from "node-cron";
import harborService from "../services/harborService";
import ConcurrentTask from "../models/ConcurrentTask";

async function fetchDevicesAndUpdateFirmware() {
    const devices = await Device.find({"refreshFirmware.flag": true});

    for (const device of devices) {
        const {port, username, password} = device.sshConfig
        if (!port || !username || !password) {
            console.error("ssh配置不完整")
        }
        const {refreshScript} = device.refreshFirmware || {}
        if (!refreshScript) {
            continue
        }
        const config = {
            host: device.deviceIp,
            port,
            username,  // 替换为实际的SSH用户名
            password   // 替换为实际的SSH密码
        };
        try {
            const isExistTask = await ConcurrentTask.exists({
                "info.deviceIp": device.deviceIp,
                status: "pending"
            })
            if (!isExistTask) {
                await ConcurrentTask.create({
                    environment: new Map(Object.entries(config)),
                    script: refreshScript,
                    info: {
                        deviceIp: device.deviceIp
                    },
                    callbackName: "updateFirmware",
                    title: "固件版本刷新",
                    taskType: "ssh"
                });
            }
        } catch (error) {
            console.error('Failed to create task:', error);
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
