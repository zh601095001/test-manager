import express from 'express';
import {
    register,
    login,
    refreshToken,
    logout,
    deleteAccount,
    deleteUser
} from '../controllers/userController';
import passport from "passport";
const router = express.Router();
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *         password:
 *           type: string
 *         roles:
 *           type: array
 *           items:
 *             type: string
 *       example:
 *         username: "admin"
 *         password: "admin"
 */
/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login a user
 *     tags: [登录]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Logged in successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/login', passport.authenticate('local', { session: false }), login);
/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [登录]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User registered
 *       500:
 *         description: Error message
 */
router.post('/register', register);
/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Logout a user
 *     tags: [登录]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/logout', passport.authenticate('jwt', { session: false }), logout);
/**
 * @swagger
 * /refresh-token:
 *   post:
 *     summary: Refresh the authentication token
 *     tags: [登录]
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid request or expired refresh token
 */
router.post('/refresh-token', refreshToken);

/**
 * @swagger
 * /user:
 *   delete:
 *     summary: Delete the authenticated user's account
 *     tags: [用户]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Account deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete('/user', passport.authenticate('jwt', { session: false }), deleteAccount);
/**
 * @swagger
 * /user/{userId}:
 *   delete:
 *     summary: Delete a user account by admin
 *     tags: [用户]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID of the user to delete
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden, only admins can perform this action
 */
router.delete('/user/:userId', passport.authenticate('jwt', { session: false }), deleteUser);

export default router;
