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
 *               deviceName:
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


export default router;
