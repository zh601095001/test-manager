import nodemailer, {SendMailOptions, Transporter} from 'nodemailer';
import EmailSettings, {IEmailSettings} from "../models/EmailSettings";

// 定义 getTransporter 函数返回类型
type SendMailWithFrom = (mailOptions: Omit<SendMailOptions, 'from'>) => Promise<nodemailer.SentMessageInfo>;

const getTransporter = async (): Promise<SendMailWithFrom> => {
    const emailSettings: IEmailSettings | null = await EmailSettings.findOne();
    if (!emailSettings) throw new Error("邮箱未正确配置");

    const transporter: Transporter = nodemailer.createTransport({
        host: emailSettings.emailHost,
        port: emailSettings.emailPort,
        secure: true, // true for 465, false for other ports
        auth: {
            user: emailSettings.emailAuthUser,
            pass: emailSettings.emailAuthPass
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    // 封装一个带有默认 from 的 sendMail 方法
    return (mailOptions) => {
        return transporter.sendMail({
            from: emailSettings.emailAuthUser, // 默认的 from 地址
            ...mailOptions
        });
    };
};

export default getTransporter;