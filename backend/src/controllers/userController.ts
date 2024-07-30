import {Request, Response} from 'express';
import * as userService from '../services/userService';
import transporter from "../config/mailConfig";
import {updateEmailById} from "../services/userService";

interface CustomError extends Error {
    message: string;
}

export const register = async (req: Request, res: Response): Promise<void> => {
    const {username, password} = req.body;
    try {
        const {newUser, accessToken, roles} = await userService.registerUser(username, password);
        res.status(201).json({message: 'User registered', accessToken, roles, username: newUser.username});
    } catch (e) {
        const error = e as CustomError;
        res.status(409).json({message: error.message});
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    const user = req.user as any; // Adjust according to your user type
    try {
        const {accessToken, newRefreshToken} = await userService.authenticateUser(user);
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.json({
            message: 'Logged in successfully',
            accessToken,
            username: user.username,
            roles: user.roles,
            email: user.email,
        });
    } catch (e) {
        const error = e as CustomError;
        res.status(500).json({message: 'Error logging in', error: error.message});
    }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies.refreshToken;
    try {
        const {accessToken, newRefreshToken, user} = await userService.refreshUserToken(refreshToken);
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.json({
            message: 'Token refreshed',
            accessToken,
            username: user.username,
            roles: user.roles,
            email: user.email,
        });
    } catch (e) {
        const error = e as CustomError;
        res.status(401).json({message: 'Invalid request or expired refresh token', error: error.message});
    }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req.user as any; // Adjust according to your user type
        await userService.logoutUser(user);
        res.status(204).send();
    } catch (e) {
        const error = e as CustomError;
        res.status(500).json({message: 'Error logging out', error: error.message});
    }
};

export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req.user as any; // Adjust according to your user type
        await userService.deleteUserAccount(user);
        res.status(204).send();
    } catch (e) {
        const error = e as CustomError;
        res.status(500).json({message: 'Error deleting account', error: error.message});
    }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    const {userId} = req.params;
    const adminUser = req.user as any; // Adjust according to your user type
    try {
        await userService.deleteUserById(userId, adminUser);
        res.status(204).send();
    } catch (e) {
        const error = e as CustomError;
        res.status(500).json({message: 'Error deleting user', error: error.message});
    }
};

export const updateEmail = async (req: Request, res: Response): Promise<void> => {
    const {email} = req.body;
    const user = req.user as any;
    try {
        await userService.updateEmail(user, email)
        res.status(200).json({message: 'Email updated', username: user.username});
    } catch (e) {
        const error = e as CustomError;
        res.status(500).json({message: 'Error update user email', error: error.message});
    }
}

export const updateAvatar = async (req: Request, res: Response): Promise<void> => {
    const {avatar} = req.body;
    const user = req.user as any;
    try {
        await userService.updateAvatar(user, avatar)
        res.status(200).json({message: 'Avatar updated', username: user.username});
    } catch (e) {
        const error = e as CustomError;
        res.status(500).json({message: 'Error update user avatar', error: error.message});
    }
}

export const changePassword = async (req: Request, res: Response): Promise<void> => {
    const {oldPassword, newPassword} = req.body;
    const user = req.user as any;
    try {
        await userService.changePassword(user, oldPassword, newPassword)
        res.status(200).json({message: '密码更改成功！', username: user.username});
    } catch (e) {
        const error = e as CustomError;
        res.status(500).json({message: error.message});
    }
}

export const sendPasswordResetEmail = async (req: Request, res: Response) => {
    const {email, frontendUrl} = req.body;

    try {
        const {resetToken} = await userService.sendPasswordResetEmail(email)

        // 创建重置链接
        const resetLink = `${frontendUrl}/reset-password/${resetToken}`;

        let info = await transporter.sendMail({
            from: process.env.EMAIL_AUTH_USER,
            to: email,
            subject: '密码重置请求(DevicePool)',
            text: `您收到此电子邮件是因为您（或其他人）已请求重置与此电子邮件地址关联的账户的密码。\n\n请点击以下链接，或将其复制到浏览器以完成过程：\n\n${resetLink}\n\n如果您没有请求此操作，请忽略此电子邮件，您的密码将保持不变。\n`,
        });

        res.status(200).json({message: '重置密码的邮件已发送'});
    } catch (error: any) {
        res.status(500).json({message: error.message});
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    const {token, newPassword} = req.body;

    try {
        await userService.resetPassword(token, newPassword)
        res.status(200).json({message: '密码已成功重置'});
    } catch (error) {
        res.status(500).json({message: '密码重置失败，请稍后再试', error});
    }
};


export const getCurrentUser = async (req: Request, res: Response) => {
    try {
        // 从请求中的用户信息获取用户 ID
        const user = req.user as IUser;

        if (!user) {
            return res.status(401).json({message: 'Unauthorized'});
        }

        const fullUser = await userService.getCurrentUser(user)

        // 返回用户信息
        return res.status(200).json(fullUser);
    } catch (error) {
        console.error('Error fetching current user:', error);
        return res.status(500).json({message: 'Internal server error'});
    }
};

export const getAllUser = async (req: Request, res: Response) => {
    const user = req.user as IUser;
    if (!user) return res.status(401).json({message: 'Unauthorized'});
    if (!user.roles.includes("admin")) return res.status(403).json({message: 'Permission denied'});
    const users = await userService.getAllUser()
    res.status(200).json(users);
}

export const updateEmailByAdmin = async (req: Request, res: Response): Promise<any> => {
    const user = req.user as IUser;
    const {_id, email} = req.body;
    if (!user) return res.status(401).json({message: 'Unauthorized'});
    if (!user.roles.includes("admin")) return res.status(403).json({message: 'Permission denied'});
    try {
        await userService.updateEmailById(_id, email)
        res.status(200).json({message: 'Email updated', username: user.username});
    } catch (e) {
        const error = e as CustomError;
        res.status(500).json({message: 'Error update user email', error: error.message});
    }
}

export const updateRolesByAdmin = async (req: Request, res: Response): Promise<any> => {
    const user = req.user as IUser;
    const {_id, roles} = req.body;
    if (!user) return res.status(401).json({message: 'Unauthorized'});
    if (!user.roles.includes("admin")) return res.status(403).json({message: 'Permission denied'});
    try {
        await userService.updateRolesById(_id, roles)
        res.status(200).json({message: 'Email updated', username: user.username});
    } catch (e) {
        const error = e as CustomError;
        res.status(500).json({message: 'Error update user email', error: error.message});
    }
}

export const updatePasswordByAdmin = async (req: Request, res: Response): Promise<any> => {
    const user = req.user as IUser;
    const {_id, newPassword} = req.body;
    if (!user) return res.status(401).json({message: 'Unauthorized'});
    if (!user.roles.includes("admin")) return res.status(403).json({message: 'Permission denied'});
    try {
        await userService.changePasswordById(_id, newPassword)
        res.status(200).json({message: 'Email updated', username: user.username});
    } catch (e) {
        const error = e as CustomError;
        res.status(500).json({message: 'Error update user email', error: error.message});
    }
}