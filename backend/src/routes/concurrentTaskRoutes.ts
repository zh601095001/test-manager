// routes/concurrentTaskRoutes.ts
import { Router } from 'express';
import ConcurrentTaskController from '../controllers/concurrentTaskController';

const router = Router();
/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: oid
 *           description: Unique identifier for the Task
 *         title:
 *           type: string
 *           description: The title of the task
 *         description:
 *           type: string
 *           description: A brief description of the task
 *         taskType:
 *           type: string
 *           enum: [ssh, python, sql, bash]
 *           description: The type of the task, which defines the script to be executed
 *         script:
 *           type: string
 *           description: The script content to be executed for the task
 *         environment:
 *           type: object
 *           additionalProperties: true
 *           description: Environmental variables required for the task
 *         executionPath:
 *           type: string
 *           description: The directory path where the task will be executed
 *         runtimeEnv:
 *           type: object
 *           additionalProperties: true
 *           description: Runtime environment settings for the task
 *         status:
 *           type: string
 *           enum: [pending, running, completed, failed]
 *           description: The current status of the task
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The creation time of the task
 *         username:
 *           type: string
 *           description: Username of the user who created the task
 *         stdout:
 *           type: array
 *           items:
 *             type: string
 *           description: Standard output of the task execution
 *         stderr:
 *           type: array
 *           items:
 *             type: string
 *           description: Standard error output of the task execution
 *         callbackName:
 *           type: string
 *           description: Name of the callback function if applicable
 *         exitCode:
 *           type: integer
 *           description: Exit code of the task script after execution
 *         exitSignal:
 *           type: string
 *           description: Signal received on task termination
 *         error:
 *           type: string
 *           description: Error message if the task fails
 *         info:
 *           type: object
 *           additionalProperties: true
 *           description: Additional information about the task
 *         templateVariables:
 *           type: object
 *           additionalProperties: true
 *           description: Template variables used within the task script
 *       required:
 *         - _id
 *         - title
 *         - taskType
 *         - script
 *         - status
 *         - createdAt
 *         - username
 *       description: Detailed schema of a task
 */

/**
 * @swagger
 * /concurrent/task:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Bad request
 */
router.post('/task', ConcurrentTaskController.createTask);

/**
 * @swagger
 * /concurrent/tasks:
 *   get:
 *     summary: Get all tasks
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: A list of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 */
router.get('/tasks', ConcurrentTaskController.getAllTasks);

/**
 * @swagger
 * /concurrent/task/{id}:
 *   get:
 *     summary: Get a task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The task id
 *     responses:
 *       200:
 *         description: Task found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 */
router.get('/task/:id', ConcurrentTaskController.getTask);

/**
 * @swagger
 * /concurrent/tasks/user/{username}:
 *   get:
 *     summary: Get tasks by username and optional status
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: The username of the task owner
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: The status of the tasks to filter by
 *     responses:
 *       200:
 *         description: A list of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 */
router.get('/tasks/user/:username', ConcurrentTaskController.getTasksByUsernameAndStatus);

export default router;
