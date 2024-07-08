import {Router} from 'express';
import * as gitlabRunnerController from '../controllers/gitlabRunnerController';

/**
 * @swagger
 * tags:
 *   name: GitlabRunners
 *   description: Gitlab Runner management
 */

const router = Router();
/**
 * @swagger
 * components:
 *   schemas:
 *     GitlabRunner:
 *       type: object
 *       required:
 *         - runnerName
 *         - runnerIp
 *         - runnerPort
 *         - tags
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the Gitlab Runner
 *         runnerName:
 *           type: string
 *         runnerIp:
 *           type: string
 *         runnerPort:
 *           type: number
 *         status:
 *           type: string
 *           default: "pause"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         comment:
 *           type: string
 *           default: "-"
 *         sshConfig:
 *           type: object
 *           properties:
 *             username:
 *               type: string
 *               default: "root"
 *             password:
 *               type: string
 *               default: "admin"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the Gitlab Runner was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the Gitlab Runner was last updated
 */
/**
 * @swagger
 * /gitlab-runners:
 *   post:
 *     summary: Create a new Gitlab Runner
 *     tags: [GitlabRunners]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - runnerName
 *               - runnerIp
 *               - runnerPort
 *               - tags
 *             properties:
 *               runnerName:
 *                 type: string
 *               runnerIp:
 *                 type: string
 *               runnerPort:
 *                 type: number
 *               status:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               comment:
 *                 type: string
 *               sshConfig:
 *                 type: object
 *                 properties:
 *                   username:
 *                     type: string
 *                   password:
 *                     type: string
 *     responses:
 *       201:
 *         description: The Gitlab Runner was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GitlabRunner'
 *       500:
 *         description: Some server error
 */
router.post('/gitlab-runner', gitlabRunnerController.createGitlabRunner);

/**
 * @swagger
 * /gitlab-runners:
 *   get:
 *     summary: Get all Gitlab Runners
 *     tags: [GitlabRunners]
 *     responses:
 *       200:
 *         description: The list of the Gitlab Runners
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GitlabRunner'
 *       500:
 *         description: Some server error
 */
router.get('/gitlab-runners', gitlabRunnerController.getAllGitlabRunners);

/**
 * @swagger
 * /gitlab-runners/{id}:
 *   get:
 *     summary: Get a Gitlab Runner by ID
 *     tags: [GitlabRunners]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Gitlab Runner ID
 *     responses:
 *       200:
 *         description: The Gitlab Runner description by ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GitlabRunner'
 *       404:
 *         description: The Gitlab Runner was not found
 *       500:
 *         description: Some server error
 */
router.get('/gitlab-runner/:id', gitlabRunnerController.getGitlabRunnerById);

/**
 * @swagger
 * /gitlab-runners/{id}:
 *   put:
 *     summary: Update a Gitlab Runner by ID
 *     tags: [GitlabRunners]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Gitlab Runner ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               runnerName:
 *                 type: string
 *               runnerIp:
 *                 type: string
 *               runnerPort:
 *                 type: number
 *               status:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               comment:
 *                 type: string
 *               sshConfig:
 *                 type: object
 *                 properties:
 *                   username:
 *                     type: string
 *                   password:
 *                     type: string
 *     responses:
 *       200:
 *         description: The Gitlab Runner was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GitlabRunner'
 *       404:
 *         description: The Gitlab Runner was not found
 *       500:
 *         description: Some server error
 */
router.put('/gitlab-runner/:id', gitlabRunnerController.updateGitlabRunner);

/**
 * @swagger
 * /gitlab-runners/{id}:
 *   delete:
 *     summary: Remove a Gitlab Runner by ID
 *     tags: [GitlabRunners]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Gitlab Runner ID
 *     responses:
 *       204:
 *         description: The Gitlab Runner was deleted
 *       404:
 *         description: The Gitlab Runner was not found
 *       500:
 *         description: Some server error
 */
router.delete('/gitlab-runner/:id', gitlabRunnerController.deleteGitlabRunner);

export default router;
