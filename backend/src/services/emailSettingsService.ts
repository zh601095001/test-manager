// services/emailSettingsService.ts

import EmailSettings, {IEmailSettings} from '../models/EmailSettings';

// 获取当前的邮件服务器设置
export const getEmailSettings = async (): Promise<IEmailSettings | null> => {
    return EmailSettings.findOne();
};

// 创建或更新唯一的邮件服务器设置
export const saveEmailSettings = async (settings: {
    emailHost: string;
    emailPort: number;
    emailAuthUser: string;
    emailAuthPass: string;
}): Promise<IEmailSettings> => {
    const {emailHost, emailPort, emailAuthUser, emailAuthPass} = settings;

    return EmailSettings.findOneAndUpdate(
        {},
        {emailHost, emailPort, emailAuthUser, emailAuthPass},
        {new: true, upsert: true} // new: 返回更新后的文档, upsert: 如果没有找到则创建
    );
};
