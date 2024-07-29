import nodemailer from 'nodemailer';
import {checkEnvVars} from "../utils/utils";

const requiredEmailEnvVars = ["EMAIL_HOST", "EMAIL_PORT", "EMAIL_AUTH_USER", "EMAIL_AUTH_PASS"];
checkEnvVars(requiredEmailEnvVars);

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT as string),
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_AUTH_USER,
        pass: process.env.EMAIL_AUTH_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});
export default transporter;
