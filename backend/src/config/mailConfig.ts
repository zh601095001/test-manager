import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: 'smtp.qq.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: "601095001@qq.com",  // 你的 QQ 邮箱地址
        pass: "mshnwblxawogbdih"  // 你的 QQ 邮箱授权码
    }
});

export default transporter
