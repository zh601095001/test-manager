import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User'; // 假设您的用户模型保存在这个位置
import {Request, Response} from 'express';
import {generateToken} from "../services/token";
import config from "../config"

interface TokenPayload {
    sub: string;
    iat: number;
    exp: number;
}

interface CustomError extends Error {
    message: string; // 明确错误的message为string类型
}

export const register = async (req: Request, res: Response): Promise<void> => {
    const {username, password} = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    try {
        const userExists = await User.findOne({username});
        if (userExists) {
            res.status(409).json({message: "用户名已存在"})
            return
        }
        const adminUserExists = await User.findOne({roles: "admin"});
        const roles = adminUserExists ? ['user'] : ['admin'];
        const newUser = new User({username, password: hashedPassword, roles});
        await newUser.save();
        const accessToken = generateToken(newUser);
        res.status(201).json({message: 'User registered', accessToken, roles, username: newUser.username,});
    } catch (e) {
        const error = e as CustomError
        res.status(500).json({message: error.message});
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    const user = req.user as IUser
    const accessToken = generateToken(user);
    res.cookie('refreshToken', user.refreshToken, {
        httpOnly: true, // 使 cookie 仅可通过 HTTP 访问
        secure: false, // 只有在 HTTPS 上才发送 cookie
        maxAge: 7 * 24 * 60 * 60 * 1000 // 设置 cookie 的有效期
    });
    res.json({
        message: 'Logged in successfully',
        accessToken,
        username: user.username,
        roles: user.roles,
        email: user.email
    });
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies.refreshToken;  // 从 cookie 中获取 refreshToken
    try {
        const payload = jwt.verify(refreshToken, config.REFRESH_SECRET!) as TokenPayload;
        const user = await User.findOne({_id: payload.sub, refreshToken: refreshToken});
        if (!user) {
            throw new Error('Invalid refresh token');
        }
        const accessToken = await generateToken(user);
        res.cookie('refreshToken', user.refreshToken, {
            httpOnly: true, // 使 cookie 仅可通过 HTTP 访问
            secure: false, // 只有在 HTTPS 上才发送 cookie
            maxAge: 7 * 24 * 60 * 60 * 1000 // 设置 cookie 的有效期
        });
        res.json({
            message: 'Token refreshed',
            accessToken,
            username: user.username,
            roles: user.roles,
            email: user.email
        });
    } catch (e) {
        const error = e as CustomError
        res.status(401).json({message: 'Invalid request or expired refresh token', error: error.message});
    }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req.user as IUser;
        user.refreshToken = null; // 删除刷新令牌
        await user.save();
        res.status(204).send(); // 没有内容返回
    } catch (e) {
        const error = e as CustomError
        res.status(500).json({message: 'Error logging out', error: error.message});
    }
};

export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req.user as IUser;
        await User.findByIdAndDelete(user._id);
        res.status(204).send(); // 没有内容返回
    } catch (e) {
        const error = e as CustomError
        res.status(500).json({message: 'Error deleting account', error: error.message});
    }
};

export const deleteUser = async (req: Request, res: Response): Promise<any> => {
    const {userId} = req.params;
    const adminUser = req.user as IUser;
    if (!adminUser.roles.includes('admin')) {
        return res.status(403).json({message: 'Forbidden, only admins can perform this action'});
    }

    try {
        const userToDelete = await User.findById(userId);
        if (!userToDelete) {
            return res.status(404).json({message: 'User not found'});
        }
        await User.findByIdAndDelete(userId);
        res.status(204).send();
    } catch (e) {
        const error = e as CustomError
        res.status(500).json({message: 'Error deleting user', error: error.message});
    }
};