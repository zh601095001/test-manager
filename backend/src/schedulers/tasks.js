import axios from 'axios';
import { executeSSHCommand } from './sshCommand';  // 引入SSH执行函数

async function fetchDevicesAndUpdateFirmware() {
    try {
        // 请求API获取设备列表
        const response = await axios.get('http://192.168.6.94:8888/devices');
        const devices = response.data;
        const results = [];

        for (const device of devices) {
            const config = {
                host: device.deviceIp,
                port: 22,
                username: 'your_ssh_username',  // 替换为实际的SSH用户名
                password: 'your_ssh_password'   // 替换为实际的SSH密码
            };
            const command = 'command_to_get_firmware';  // 替换为获取固件版本的命令

            try {
                const result = await executeSSHCommand(config, command);
                results.push({
                    deviceName: device.deviceName,
                    firmwareVersion: result.stdout.trim(),  // 假设固件版本信息在stdout中
                    error: null
                });
            } catch (error) {
                results.push({
                    deviceName: device.deviceName,
                    firmwareVersion: null,
                    error: error.message
                });
            }
        }

        console.log(results);  // 在控制台打印结果
        return results;  // 返回结果，以便进一步处理
    } catch (error) {
        console.error('Failed to fetch devices:', error);
        throw error;
    }
}

fetchDevicesAndUpdateFirmware();  // 调用函数
