import * as express from "express";
import * as deviceController from "../controllers/deviceController";

const router = express.Router();

/**
 * @swagger
 * /devices/lock-free:
 *   post:
 *     summary: Get and lock a free random device with a specific purpose
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               purpose:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully locked a random device for a specific purpose
 */
router.post('/lock-free', deviceController.lockFreeDevice);

/**
 * @swagger
 * /devices/lock/{ip}:
 *   post:
 *     summary: Lock a specific device by IP address with a purpose
 *     parameters:
 *       - name: ip
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
 *               purpose:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully locked the device with a specific purpose
 *       404:
 *         description: Device not found or already locked
 */
router.post('/lock/:ip', deviceController.lockDeviceByIp);

/**
 * @swagger
 * /devices/release/{ip}:
 *   post:
 *     summary: Release a device by IP address
 *     parameters:
 *       - name: ip
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
router.post('/release/:ip', deviceController.releaseDeviceByIp);

/**
 * @swagger
 * /devices:
 *   get:
 *     summary: Get the status of all devices
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ip:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Device added successfully
 *       400:
 *         description: IP and name are required or IP already exists
 */
router.post('/', deviceController.addDevice);

/**
 * @swagger
 * /devices/{ip}:
 *   delete:
 *     summary: Remove a device from the pool by IP address
 *     parameters:
 *       - name: ip
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
router.delete('/:ip', deviceController.removeDeviceByIp);

export default router;
