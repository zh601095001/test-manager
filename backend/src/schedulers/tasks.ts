import {executeSSHCommand, getHarborLatestImageVersion} from '../utils/utils'; // 引入SSH执行函数
import Device from "../models/Device";
import cron from "node-cron";
import harborService from "../services/harborService";

async function fetchDevicesAndUpdateFirmware() {
    // 请求API获取设备列表
    const devices = await Device.find();
    for (const device of devices) {
        const config = {
            host: device.deviceIp,
            port: 22,
            username: 'root',  // 替换为实际的SSH用户名
            password: 'root'   // 替换为实际的SSH密码
        };
        const command = "dpkg -l txpf | grep txpf | awk '{print $3}'\n";  // 替换为获取固件版本的命令

        try {
            const result = await executeSSHCommand(config, command);
            if (device.deviceFirmware === "获取固件版本失败" && device.comment === "-" && device.user !== null){
                device.status = "unlocked"
            }
            device.deviceFirmware = result.stdout.trim()
            await device.save()
        } catch (error) {
            device.deviceFirmware = "获取固件版本失败"
            device.status = "maintained"
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
