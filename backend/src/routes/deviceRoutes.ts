import * as express from "express";
import * as deviceController from "../controllers/deviceController";

const router = express.Router();

/**
 * @swagger
 * /devices/lock-free:
 *   post:
 *     summary: Get and lock a free random device with a specific purpose
 *     tags: [设备池]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *               comment:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully locked a random device for a specific purpose
 */
router.post('/lock-free', deviceController.lockFreeDevice);

/**
 * @swagger
 * /devices/lock/{device_ip}:
 *   post:
 *     summary: Lock a specific device by IP address with a purpose
 *     tags: [设备池]
 *     parameters:
 *       - name: device_ip
 *         in: path
 *         description: IP address of the device to be locked
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully locked the device with a specific purpose
 *       404:
 *         description: Device not found or already locked
 */
router.post('/lock/:device_ip', deviceController.lockDeviceByIp);

/**
 * @swagger
 * /devices/release/{device_ip}:
 *   post:
 *     summary: Release a device by IP address
 *     tags: [设备池]
 *     parameters:
 *       - name: device_ip
 *         in: path
 *         description: IP address of the device to be released
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Device released successfully
 *       404:
 *         description: Device not found or not locked
 */
router.post('/release/:device_ip', deviceController.releaseDeviceByIp);

/**
 * @swagger
 * /devices:
 *   get:
 *     summary: Get the status of all devices
 *     tags: [设备池]
 *     responses:
 *       200:
 *         description: A list of devices and their status
 */
router.get('/', deviceController.getAllDevices);

/**
 * @swagger
 * /devices:
 *   post:
 *     summary: Add a new device to the pool
 *     tags: [设备池]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deviceIp:
 *                 type: string
 *               deviceName:
 *                 type: string
 *               deviceMac:
 *                 type: string
 *     responses:
 *       201:
 *         description: Device added successfully
 *       400:
 *         description: deviceIP, deviceMac and deviceName are required or IP already exists
 */
router.post('/', deviceController.addDevice);

/**
 * @swagger
 * /devices/{device_ip}:
 *   delete:
 *     summary: Remove a device from the pool by IP address
 *     tags: [设备池]
 *     parameters:
 *       - name: device_ip
 *         in: path
 *         description: IP address of the device to be removed
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Device removed successfully
 *       404:
 *         description: Device not found
 */
router.delete('/:device_ip', deviceController.removeDeviceByIp);


/**
 * @swagger
 * /devices/{device_ip}:
 *   put:
 *     summary: Update a device's information by IP address
 *     tags: [设备池]
 *     parameters:
 *       - name: device_ip
 *         in: path
 *         description: IP address of the device to be updated
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deviceName:
 *                 type: string
 *                 description: New name of the device
 *               deviceMac:
 *                 type: string
 *                 description: New MAC address of the device
 *               deviceFirmware:
 *                 type: string
 *                 description: Firmware version of the device
 *               status:
 *                 type: string
 *                 description: New status of the device (e.g., locked, unlocked, maintained)
 *               comment:
 *                 type: string
 *                 description: Any additional comments about the device
 *     responses:
 *       200:
 *         description: Device updated successfully
 *       400:
 *         description: Validation error for missing or invalid fields
 *       404:
 *         description: Device not found
 */
router.put('/:device_ip', deviceController.updateDevice);

/**
 * @swagger
 * /devices/ssh-config/{device_ip}:
 *   post:
 *     summary: Update SSH configuration for a device
 *     description: Updates the SSH configuration details for a specific device using its IP address.
 *     tags:
 *       - 设备池
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
 *     parameters:
 *       - in: path
 *         name: device_ip
 *         required: true
 *         schema:
 *           type: string
 *         description: IP address of the device
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
router.post('/ssh-config/:device_ip',deviceController.setSshConfig)

/**
 * @swagger
 * /devices/refresh-firmware/{device_ip}:
 *   post:
 *     summary: Update refresh firmware configuration
 *     description: Updates the firmware refresh settings for a specified device by IP.
 *     tags: [设备固件版本]
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
 *       500:
 *         description: Error updating firmware refresh configuration
 */
router.post('/refresh-firmware/:device_ip',deviceController.setRefreshFirmware)


/**
 * @swagger
 * /devices/switch-firmware/{device_ip}:
 *   post:
 *     summary: Update switch firmware configuration
 *     description: Updates the firmware switch settings for a specified device by IP.
 *     tags: [设备固件版本]
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
 *               currentFileName:
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
 *       500:
 *         description: Error updating switch firmware configuration
 */
router.post('/switch-firmware/:device_ip', deviceController.setSwitchFirmware)

/**
 * @swagger
 * /devices/{deviceIp}/switch-firmware:
 *   post:
 *     summary: Adds a firmware item to the device's firmware list.
 *     description: Adds a firmware item based on the device IP.
 *     tags:
 *       - [设备固件版本]
 *     parameters:
 *       - in: path
 *         name: deviceIp
 *         required: true
 *         schema:
 *           type: string
 *         description: The IP address of the device.
 *       - in: body
 *         name: firmwareListItem
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             fileName:
 *               type: string
 *             objectName:
 *               type: string
 *     responses:
 *       200:
 *         description: Successfully added the firmware item.
 *       500:
 *         description: Error message if the addition fails.
 */
router.post('/devices/:device_ip/switch-firmware', deviceController.addSwitchFirmwareListItem);

/**
 * @swagger
 * /devices/{deviceIp}/switch-firmware/{fileName}:
 *   delete:
 *     summary: Removes a specific firmware item from the device's firmware list.
 *     description: Removes a firmware item based on the device IP and file name.
 *     tags:
 *       - [设备固件版本]
 *     parameters:
 *       - in: path
 *         name: deviceIp
 *         required: true
 *         schema:
 *           type: string
 *         description: The IP address of the device.
 *       - in: path
 *         name: fileName
 *         required: true
 *         schema:
 *           type: string
 *         description: The file name of the firmware to be removed.
 *     responses:
 *       200:
 *         description: Successfully removed the firmware item.
 *       500:
 *         description: Error message if the removal fails.
 */
router.delete('/devices/:device_ip/switch-firmware/:filename', deviceController.rmSwitchFirmwareListItem);

/**
 * @swagger
 * /devices/{deviceIp}/switch-firmware/current:
 *   put:
 *     summary: Sets the current firmware item for the device.
 *     description: Sets the current firmware item based on the device IP and the specified file name.
 *     tags:
 *       - [设备固件版本]
 *     parameters:
 *       - in: path
 *         name: deviceIp
 *         required: true
 *         schema:
 *           type: string
 *         description: The IP address of the device.
 *       - in: body
 *         name: currentFileName
 *         required: true
 *         schema:
 *           type: string
 *         description: The file name of the firmware to be set as current.
 *     responses:
 *       200:
 *         description: Successfully set the current firmware item.
 *       500:
 *         description: Error message if the operation fails.
 */
router.put('/devices/:device_ip/switch-firmware/current', deviceController.setCurrentSwitchFirmwareListItem);

/**
 * @swagger
 * /devices/{deviceIp}/switch-firmware/script:
 *   put:
 *     summary: Sets the switch script for the device's firmware.
 *     description: Sets the switch script for a device based on the device IP.
 *     tags:
 *       - [设备固件版本]
 *     parameters:
 *       - in: path
 *         name: deviceIp
 *         required: true
 *         schema:
 *           type: string
 *         description: The IP address of the device.
 *       - in: body
 *         name: switchScript
 *         required: true
 *         schema:
 *           type: string
 *         description: The script to set for the switch firmware.
 *     responses:
 *       200:
 *         description: Successfully set the switch script.
 *       500:
 *         description: Error message if the setting fails.
 */
router.put('/devices/:device_ip/switch-firmware/script', deviceController.setSwitchScript);
export default router;
