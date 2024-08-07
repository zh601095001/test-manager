import express from 'express';
import {
    register,
    login,
    refreshToken,
    logout,
    deleteAccount,
    deleteUser,
    updateEmail,
    updateAvatar,
    changePassword,
    sendPasswordResetEmail,
    resetPassword,
    getCurrentUser,
    getAllUser,
    updateEmailByAdmin,
    updateRolesByAdmin,
    updatePasswordByAdmin,
    getAllAvatars,
    updateUserDeviceFilters,
    getUserDeviceFilters,
    setUserNickName
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
 * components:
 *   schemas:
 *     FullUser:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         _id:
 *           type: string
 *           description: 用户的唯一标识符
 *           example: 60c72b2f5f1b2c001f8e4c50
 *         username:
 *           type: string
 *           description: 用户名
 *           example: johndoe
 *         roles:
 *           type: array
 *           items:
 *             type: string
 *           description: 用户角色列表
 *           example: ["admin", "user"]
 *         email:
 *           type: string
 *           description: 用户邮箱
 *           example: johndoe@example.com
 *         avatar:
 *           type: string
 *           description: 用户头像URL
 *           example: "https://example.com/avatar.jpg"
 *         settings:
 *           type: object
 *           properties:
 *             deviceFilters:
 *               type: array
 *               items:
 *                 type: object
 *               description: 设备过滤器列表
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
router.post('/login', passport.authenticate('local', {session: false}), login);
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
router.post('/logout', passport.authenticate('jwt', {session: false}), logout);
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
router.delete('/user', passport.authenticate('jwt', {session: false}), deleteAccount);


/**
 * @swagger
 * /user/update-email:
 *   post:
 *     summary: Update user email
 *     description: Update the email address of the authenticated user.
 *     tags: [用户]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 description: New email address of the user
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Email updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email updated
 *                 username:
 *                   type: string
 *                   description: The username of the user
 *                   example: john_doe
 *       500:
 *         description: Error updating user email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error update user email
 *                 error:
 *                   type: string
 *                   description: Detailed error message
 *                   example: Email already in use
 */
router.post('/user/update-email', passport.authenticate('jwt', {session: false}), updateEmail);


/**
 * @swagger
 * /user/update-avatar:
 *   post:
 *     summary: Update user avatar
 *     description: Update the avatar url of the authenticated user.
 *     tags: [用户]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 description: New avatar url of the user
 *                 example: http://xxx.com/aasfasfasgasgasgag
 *     responses:
 *       200:
 *         description: Avatar updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: avatar updated
 *                 username:
 *                   type: string
 *                   description: The username of the user
 *                   example: john_doe
 *       500:
 *         description: Error updating user avatar
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error update user avatar
 *                 error:
 *                   type: string
 *                   description: Detailed error message
 *                   example: avatar already in use
 */
router.post('/user/update-avatar', passport.authenticate('jwt', {session: false}), updateAvatar);


/**
 * @swagger
 * /user/change-password:
 *   post:
 *     summary: 更改用户密码
 *     description: 允许经过身份验证的用户更改他们的密码
 *     tags:
 *       - 用户
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 description: 用户的旧密码
 *               newPassword:
 *                 type: string
 *                 description: 用户的新密码
 *     responses:
 *       200:
 *         description: 密码更改成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: 成功消息
 *                 username:
 *                   type: string
 *                   description: 用户名
 *       400:
 *         description: 错误的请求
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器内部错误
 */
router.post('/user/change-password', passport.authenticate('jwt', {session: false}), changePassword);


/**
 * @swagger
 * /user/send-reset-password-email:
 *   post:
 *     summary: 发送密码重置邮件
 *     description: 根据提供的电子邮件地址发送密码重置链接到用户的邮箱。
 *     tags:
 *       - 用户
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - frontendUrl
 *             properties:
 *               email:
 *                 type: string
 *                 description: 用户的电子邮件地址
 *               frontendUrl:
 *                 type: string
 *                 description: 前端应用的基本 URL，用于构建密码重置链接
 *     responses:
 *       200:
 *         description: 成功发送重置邮件
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: 成功消息
 *       404:
 *         description: 用户不存在
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: 错误消息
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: 错误消息
 *                 error:
 *                   type: string
 *                   description: 详细错误信息
 */
router.post('/user/send-reset-password-email', sendPasswordResetEmail);


/**
 * @swagger
 * /user/reset-password:
 *   post:
 *     summary: 重置密码
 *     description: 用户通过邮件中的链接访问后，设置新密码。
 *     tags:
 *       - 用户
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: 邮件中提供的重置令牌
 *               newPassword:
 *                 type: string
 *                 description: 用户的新密码
 *     responses:
 *       200:
 *         description: 密码重置成功
 *       400:
 *         description: 令牌无效或已过期
 *       500:
 *         description: 服务器内部错误
 */
router.post('/user/reset-password', resetPassword);


/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get the current user's details
 *     tags: [用户]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 roles:
 *                   type: array
 *                   items:
 *                     type: string
 *                 avatar:
 *                   type: string
 *                 settings:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/user', passport.authenticate('jwt', {session: false}), getCurrentUser);


/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: 获取所有用户
 *     tags: [admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 返回所有用户信息
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FullUser'
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 */
router.get('/admin/users', passport.authenticate('jwt', {session: false}), getAllUser);


/**
 * @swagger
 * /admin/user/update-email:
 *   put:
 *     summary: 管理员更新用户邮箱
 *     description: 允许具有管理员权限的用户更新指定用户的电子邮箱。
 *     tags:
 *       - admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *                 description: 要更新邮箱的id
 *                 example: asasfasfasf
 *               email:
 *                 type: string
 *                 description: 新的电子邮箱地址
 *                 example: johndoe@example.com
 *     responses:
 *       200:
 *         description: 邮箱更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email updated
 *                 username:
 *                   type: string
 *                   example: johndoe
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: 权限拒绝
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Permission denied
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error update user email
 *                 error:
 *                   type: string
 *                   example: Some error message
 */
router.put('/admin/user/update-email', passport.authenticate('jwt', {session: false}), updateEmailByAdmin);


/**
 * @swagger
 * /admin/user/update-roles:
 *   put:
 *     summary: 管理员更新用户角色
 *     description: 允许具有管理员权限的用户更新指定用户的角色。
 *     tags:
 *       - admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *                 description: 要更新角色的用户 ID
 *                 example: 60c72b2f9b1d8e1f8c8b4567
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 新的用户角色数组
 *                 example: ["admin", "user"]
 *     responses:
 *       200:
 *         description: 用户角色更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Roles updated
 *                 username:
 *                   type: string
 *                   example: johndoe
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: 权限拒绝
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Permission denied
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error updating user roles
 *                 error:
 *                   type: string
 *                   example: Some error message
 */
router.put('/admin/user/update-roles', passport.authenticate('jwt', {session: false}), updateRolesByAdmin);


/**
 * @swagger
 * /admin/user/update-password:
 *   put:
 *     summary: 管理员更新用户密码
 *     description: 允许具有管理员权限的用户更新指定用户的密码。
 *     tags:
 *       - admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *                 description: 要更新密码的用户 ID
 *                 example: 60c72b2f9b1d8e1f8c8b4567
 *               newPassword:
 *                 type: string
 *                 description: 用户的新密码
 *                 example: NewSecurePassword123!
 *     responses:
 *       200:
 *         description: 用户密码更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password updated
 *                 username:
 *                   type: string
 *                   example: johndoe
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: 权限拒绝
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Permission denied
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error updating user password
 *                 error:
 *                   type: string
 *                   example: Some error message
 */
router.put('/admin/user/update-password', passport.authenticate('jwt', {session: false}), updatePasswordByAdmin);

/**
 * @swagger
 * /admin/user/{userId}:
 *   delete:
 *     summary: Delete a user account by admin
 *     tags: [admin]
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
router.delete('/admin/user/:userId', passport.authenticate('jwt', {session: false}), deleteUser);


/**
 * @swagger
 * /avatars:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Retrieve all user avatars
 *     description: Retrieve a list of all user avatars with usernames. Access is restricted for users with only the "guest" role.
 *     tags:
 *       - 用户
 *     responses:
 *       200:
 *         description: A list of avatars with usernames
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   username:
 *                     type: string
 *                     description: The user's username
 *                     example: johndoe
 *                   avatar:
 *                     type: string
 *                     description: URL or path to the user's avatar
 *                     example: /avatars/johndoe.jpg
 *       401:
 *         description: Unauthorized access, user not logged in
 *       403:
 *         description: Permission denied, user only has the "guest" role
 *       500:
 *         description: Error retrieving avatars
 */
router.get('/avatars', passport.authenticate('jwt', {session: false}), getAllAvatars);


/**
 * @swagger
 * /user/device-filters:
 *   put:
 *     summary: Update the device filters for the current user
 *     description: This endpoint allows the authenticated user to update their device filters.
 *     tags:
 *       - 用户
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deviceFilters:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["filter1", "filter2"]
 *     responses:
 *       200:
 *         description: Device filters updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: DeviceFilters update successful!
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: DeviceFilters update failed!
 *                 error:
 *                   type: string
 *                   example: Detailed error message
 */
router.put('/user/device-filters', passport.authenticate('jwt', {session: false}), updateUserDeviceFilters);


/**
 * @swagger
 * /user/device-filters:
 *   get:
 *     tags:
 *       - 用户
 *     security:
 *       - bearerAuth: []
 *     summary: 获取用户的设备过滤器
 *     description: 获取当前登录用户的设备过滤器设置。
 *     responses:
 *       200:
 *         description: 成功获取设备过滤器
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 deviceFilters:
 *                   type: array
 *                   items:
 *                     type: object
 *                     example: []
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Unauthorized'
 *       500:
 *         description: 获取设备过滤器失败
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'DeviceFilters get failed!'
 *                 error:
 *                   type: string
 *                   example: 'Detailed error message'
 */
router.get('/user/device-filters', passport.authenticate('jwt', {session: false}), getUserDeviceFilters);


/**
 * @swagger
 * /user/nickname:
 *   post:
 *     summary: Update user nickname
 *     description: Allows a user to update their nickname.
 *     tags:
 *       - 用户
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickName:
 *                 type: string
 *                 description: The new nickname for the user
 *                 example: "new_nickname"
 *     responses:
 *       200:
 *         description: Nickname update successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "nickname update successful!"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: Nickname update failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "nickname update failed!"
 *                 error:
 *                   type: string
 *                   example: "Error message"
 */
router.post('/user/nickname',  passport.authenticate('jwt', {session: false}), setUserNickName);
export default router;
