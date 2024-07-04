import express from 'express';
import * as DeviceSettingsController from '../controllers/deviceSettingsController';

const router = express.Router();
/**
 * @swagger
 * components:
 *   schemas:
 *     DeviceSettings:
 *       type: object
 *       required:
 *         - switchScript
 *       properties:
 *         firmwareList:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               fileName:
 *                 type: string
 *                 description: The name of the firmware file.
 *               objectName:
 *                 type: string
 *                 description: The object name in the storage system.
 *         switchScript:
 *           type: string
 *           description: The script used to switch device configurations.
 */

/**
 * @swagger
 * /device-settings:
 *   get:
 *     tags: [设备批量设置]
 *     summary: Retrieve the current device settings
 *     description: Returns the device settings
 *     responses:
 *       200:
 *         description: A successful response with the current device settings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeviceSettings'
 */
router.get('/', DeviceSettingsController.getDeviceSettings);
/**
 * @swagger
 * /device-settings:
 *   put:
 *     tags: [设备批量设置]
 *     summary: Update the device settings
 *     description: Updates and returns the device settings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeviceSettings'
 *     responses:
 *       200:
 *         description: Successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeviceSettings'
 *       400:
 *         description: Invalid request format
 */
router.put('/', DeviceSettingsController.updateDeviceSettings);

/**
 * @swagger
 * /device-settings/firmware:
 *   post:
 *     tags: [设备批量设置]
 *     summary: Add a firmware to the firmware list
 *     description: Adds a new firmware entry to the device settings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fileName:
 *                 type: string
 *               objectName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Firmware added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeviceSettings'
 *       500:
 *         description: Error adding firmware
 */
router.post('/firmware', DeviceSettingsController.addFirmware);

/**
 * @swagger
 * /device-settings/firmware/{objectName}:
 *   delete:
 *     tags: [设备批量设置]
 *     summary: Remove a firmware from the firmware list
 *     description: Removes a firmware entry from the device settings by object name
 *     parameters:
 *       - in: path
 *         name: objectName
 *         required: true
 *         schema:
 *           type: string
 *         description: The object name of the firmware to remove
 *     responses:
 *       200:
 *         description: Firmware removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeviceSettings'
 *       500:
 *         description: Error removing firmware
 */
router.delete('/firmware/:objectName', DeviceSettingsController.removeFirmwareByObjectName);

export default router;
