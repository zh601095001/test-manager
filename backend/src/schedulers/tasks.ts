import axios from 'axios';
import {executeSSHCommand} from '../utils/utils';  // 引入SSH执行函数
import Device from "../models/Device";

export async function fetchDevicesAndUpdateFirmware() {
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
            device.deviceFirmware = result.stdout.trim()
            await device.save()
        } catch (error) {
            device.deviceFirmware = "获取固件版本失败"
            // device.status = "maintained"
            await device.save()
        }
    }
}
