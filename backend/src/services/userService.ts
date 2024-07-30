import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User'; // 假设您的用户模型保存在这个位置
import {generateToken} from './tokenService';
import config from '../config';
import crypto from 'crypto';

interface TokenPayload {
    sub: string;
    iat: number;
    exp: number;
}

interface CustomError extends Error {
    message: string;
}

export const registerUser = async (username: string, password: string, email: string) => {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const userExists = await User.findOne({username});
    if (userExists) {
        throw new Error('用户名已存在');
    }
    const adminUserExists = await User.findOne({roles: 'admin'});
    const roles = adminUserExists ? ['user'] : ['admin'];
    const newUser = new User({username, password: hashedPassword, roles, email});
    await newUser.save();
    const accessToken = await generateToken({user: newUser, forceRefreshToken: true});
    return {newUser, accessToken, roles};
};

export const authenticateUser = async (user: any) => {
    const {accessToken, newRefreshToken} = await generateToken({user, forceRefreshToken: true});
    return {accessToken, newRefreshToken};
};

export const refreshUserToken = async (refreshToken: string) => {
    const payload = jwt.verify(refreshToken, config.REFRESH_SECRET!) as TokenPayload;
    const user = await User.findOne({_id: payload.sub, refreshTokens: refreshToken});
    if (!user) {
        throw new Error('Invalid refresh token');
    }
    const {accessToken, newRefreshToken} = await generateToken({user, currentRefreshToken: refreshToken});
    return {accessToken, newRefreshToken, user};
};

export const logoutUser = async (user: any) => {
    user.refreshToken = null; // 删除刷新令牌
    await user.save();
};

export const deleteUserAccount = async (user: any) => {
    await User.findByIdAndDelete(user._id);
};

export const deleteUserById = async (userId: string, adminUser: any) => {
    if (!adminUser.roles.includes('admin')) {
        throw new Error('Forbidden, only admins can perform this action');
    }

    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
        throw new Error('User not found');
    }
    await User.findByIdAndDelete(userId);
};

export const updateEmail = async (user: any, email: string) => {
    return User.findByIdAndUpdate(user._id, {
        $set: {
            email
        }
    })
}

export const updateAvatar = async (user: any, avatar: string) => {
    return User.findByIdAndUpdate(user._id, {
        $set: {
            avatar
        }
    })
}


export const changePassword = async (user: any, oldPassword: string, newPassword: string) => {
    // 验证旧密码是否正确
    const isMatch = bcrypt.compareSync(oldPassword, user.password);
    if (!isMatch) {
        throw new Error('旧密码不正确');
    }
    user.password = bcrypt.hashSync(newPassword, 10);
    await user.save();

    return {message: '密码已成功更新'};
};

export const sendPasswordResetEmail = async (email: string) => {
    const user = await User.findOne({email});
    if (!user) {
        throw new Error("用户不存在")
    }
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1小时后过期
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();
    return {resetToken}
}

export const resetPassword = async (token: string, newPassword: string) => {
    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: {$gt: Date.now()}, // 检查令牌是否过期
    });

    if (!user) {
        throw new Error('重置密码令牌无效或已过期');
    }

    user.password = bcrypt.hashSync(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
}

export const getCurrentUser = async (user: any) => {
    // 查找完整的用户信息，排除密码和令牌相关的字段
    const fullUser = await User.findById(user._id).select('-password -refreshToken -refreshTokens -resetPasswordToken -resetPasswordExpires');

    if (!fullUser) {
        throw new Error('User not found');
    }
    return fullUser
}

export const getAllUser = async () => {
    return User.find().select('-password -refreshToken -refreshTokens -resetPasswordToken -resetPasswordExpires').lean();
}


export const updateEmailById = async (_id: string, email: string) => {
    await User.findByIdAndUpdate(_id, {
        $set: {
            email
        }
    })
    return {message: '邮箱更新成功'};

}

export const updateRolesById = async (_id: string, roles: string[]) => {
    await User.findByIdAndUpdate(_id, {
        $set: {
            roles
        }
    })
    return {message: '权限更新成功'};
}

export const changePasswordById = async (_id: string, newPassword: string) => {
    // 验证旧密码是否正确
    await User.findByIdAndUpdate(_id, {
        $set: {
            password: bcrypt.hashSync(newPassword, 10)
        }
    })

    return {message: '密码已成功更新'};
}