import * as deviceController from "../controllers/deviceController";
import * as express from "express";
import {reInstallCurrentSwitchFirmwareAndWaitForComplete} from "../controllers/deviceController";

const router = express.Router();

/**
 * @swagger
 * /device/{device_ip}/ssh-config:
 *   put:
 *     summary: Update SSH configuration for a device
 *     description: Updates the SSH configuration details for a specific device using its IP address.
 *     tags:
 *       - 设备池
 *     parameters:
 *       - in: path
 *         name: device_ip
 *         required: true
 *         schema:
 *           type: string
 *         description: IP address of the device
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               port:
 *                 type: number
 *                 description: SSH port number
 *                 example: 22
 *               username:
 *                 type: string
 *                 description: Username for SSH login
 *                 example: admin
 *               password:
 *                 type: string
 *                 description: Password for SSH login
 *                 example: admin123
 *     responses:
 *       200:
 *         description: SSH configuration updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "SSH configuration updated successfully"
 */
router.put('/:device_ip/ssh-config', deviceController.setSshConfig);

/**
 * @swagger
 * /device/{device_ip}/ssh-config:
 *   get:
 *     summary: Retrieve SSH configuration for a device
 *     description: Retrieves the SSH configuration details for a specific device using its IP address.
 *     tags:
 *       - 设备池
 *     parameters:
 *       - in: path
 *         name: device_ip
 *         required: true
 *         schema:
 *           type: string
 *         description: IP address of the device
 *     responses:
 *       200:
 *         description: SSH configuration retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 port:
 *                   type: number
 *                   description: SSH port number
 *                   example: 22
 *                 username:
 *                   type: string
 *                   description: Username for SSH login
 *                   example: admin
 *                 password:
 *                   type: string
 *                   description: Password for SSH login
 *                   example: admin123
 */
router.get('/:device_ip/ssh-config', deviceController.getSshConfig);

/**
 * @swagger
 * /device/{device_ip}/refresh-firmware:
 *   put:
 *     summary: Update refresh firmware configuration
 *     description: Updates the firmware refresh settings for a specified device by IP.
 *     tags: [设备设置]
 *     parameters:
 *       - in: path
 *         name: device_ip
 *         required: true
 *         schema:
 *           type: string
 *         description: The IP address of the device
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               flag:
 *                 type: boolean
 *                 description: Enable or disable firmware refresh
 *               refreshScript:
 *                 type: string
 *                 description: Script to refresh the firmware
 *     responses:
 *       200:
 *         description: Firmware refresh configuration updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Firmware refresh configuration updated successfully"
 *       500:
 *         description: Error updating firmware refresh configuration
 */
router.put('/:device_ip/refresh-firmware', deviceController.setRefreshFirmware);

/**
 * @swagger
 * /device/{device_ip}/switch-firmware:
 *   post:
 *     summary: Update switch firmware configuration
 *     description: Updates the firmware switch settings for a specified device by IP.
 *     tags: [设备设置]
 *     parameters:
 *       - in: path
 *         name: device_ip
 *         required: true
 *         schema:
 *           type: string
 *         description: The IP address of the device
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firmwareList:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     fileName:
 *                       type: string
 *                       description: Name of the firmware file
 *                     objectName:
 *                       type: string
 *                       description: Object name in the storage system
 *                 description: List of firmware files and their storage identifiers
 *               switchScript:
 *                 type: string
 *                 description: Script to switch the firmware
 *               currentObjectName:
 *                 type: string
 *                 description: Currently active firmware file name
 *     responses:
 *       200:
 *         description: Firmware switch configuration updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Firmware switch configuration updated successfully"
 *       500:
 *         description: Error updating switch firmware configuration
 */
router.post('/:device_ip/switch-firmware', deviceController.setSwitchFirmware);

/**
 * @swagger
 * /device/{device_ip}/switch-firmware:
 *   put:
 *     summary: Adds a firmware item to the device's firmware list.
 *     description: Adds a firmware item based on the device IP.
 *     tags: [设备设置]
 *     parameters:
 *       - in: path
 *         name: device_ip
 *         required: true
 *         schema:
 *           type: string
 *         description: The IP address of the device.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fileName:
 *                 type: string
 *                 description: The name of the firmware file
 *               objectName:
 *                 type: string
 *                 description: The object name in the storage system
 *     responses:
 *       200:
 *         description: Successfully added the firmware item.
 *       500:
 *         description: Error message if the addition fails.
 */
router.put('/:device_ip/switch-firmware', deviceController.addSwitchFirmwareListItem);

/**
 * @swagger
 * /device/{device_ip}/switch-firmware/{object_name}:
 *   delete:
 *     summary: Removes a specific firmware item from the device's firmware list.
 *     description: Removes a firmware item based on the device IP and file name.
 *     tags: [设备设置]
 *     parameters:
 *       - in: path
 *         name: device_ip
 *         required: true
 *         schema:
 *           type: string
 *         description: The IP address of the device.
 *       - in: body
 *         name: object_name
 *         required: true
 *         schema:
 *           type: string
 *         description:  The file name of the firmware to be removed.
 *     responses:
 *       200:
 *         description: Successfully removed the firmware item.
 *       500:
 *         description: Error message if the removal fails.
 */
router.delete('/:device_ip/switch-firmware', deviceController.rmSwitchFirmwareListItem);

/**
 * @swagger
 * /device/{device_ip}/switch-firmware/current:
 *   put:
 *     summary: Sets the current firmware item for the device.
 *     description: Sets the current firmware item based on the device IP and the specified file name.
 *     tags: [设备设置]
 *     parameters:
 *       - in: path
 *         name: device_ip
 *         required: true
 *         schema:
 *           type: string
 *         description: The IP address of the device.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               objectName:
 *                 type: string
 *                 description: The file name of the firmware to be set as current.
 *               installFlag:
 *                 type: boolean
 *                 description: Flag indicating whether to install the firmware.
 *     responses:
 *       200:
 *         description: Successfully set the current firmware item.
 *       500:
 *         description: Error message if the operation fails.
 */
router.put('/:device_ip/switch-firmware/current', deviceController.setCurrentSwitchFirmwareListItem);

/**
 * @swagger
 * /device/{device_ip}/switch-firmware/script:
 *   put:
 *     summary: Sets the switch script for the device's firmware.
 *     description: Sets the switch script for a device based on the device IP.
 *     tags: [设备设置]
 *     parameters:
 *       - in: path
 *         name: device_ip
 *         required: true
 *         schema:
 *           type: string
 *         description: The IP address of the device.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               switchScript:
 *                 type: string
 *                 description: The script to set for the switch firmware.
 *     responses:
 *       200:
 *         description: Successfully set the switch script.
 *       500:
 *         description: Error message if the setting fails.
 */
router.put('/:device_ip/switch-firmware/script', deviceController.setSwitchScript);

/**
 * @swagger
 * /device/{device_ip}/switch-firmware:
 *   get:
 *     summary: Retrieve firmware information for a specified device
 *     description: Fetches firmware details including available firmware files and the current firmware file for the device.
 *     tags: [设备设置]
 *     parameters:
 *       - in: path
 *         name: device_ip
 *         required: true
 *         description: IP address of the device
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A successful response with firmware information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SwitchFirmware'
 *       404:
 *         description: Device not found
 *       500:
 *         description: Internal server error
 *
 * components:
 *   schemas:
 *     SwitchFirmware:
 *       type: object
 *       properties:
 *         firmwareList:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               fileName:
 *                 type: string
 *                 description: The name of the firmware file
 *               objectName:
 *                 type: string
 *                 description: The object name in the storage system
 *         switchScript:
 *           type: string
 *           description: The script used to switch firmware
 *         currentObjectName:
 *           type: string
 *           description: The name of the currently active firmware file
 */
router.get("/:device_ip/switch-firmware", deviceController.getSwitchInfo);


/**
 * @swagger
 * /device/{device_ip}/reinstall-firmware:
 *   post:
 *     tags: [设备设置]
 *     summary: 重新安装设备固件
 *     description: 创建一个任务来重新安装指定设备的固件，并轮询任务状态直到完成或失败。
 *     parameters:
 *       - in: path
 *         name: device_ip
 *         required: true
 *         description: 设备的IP地址
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 固件重新安装任务已完成
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 任务已完成
 *       500:
 *         description: 任务失败或检查任务状态时出错
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 任务失败
 */
router.post('/:device_ip/reinstall-firmware', reInstallCurrentSwitchFirmwareAndWaitForComplete);

export default router;
