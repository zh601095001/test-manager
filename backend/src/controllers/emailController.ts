import {Request, Response} from "express";
import {getEmail, getIntegrationEmail} from "../services/emailServices"
import getTransporter from "../config/mailConfig";

const sendEmail = async (req: Request, res: Response) => {
    const {test_id} = req.body;
    try {
        const infos = await getEmail(test_id)
        const {
            passed,
            failed,
            passRate,
            remote_url,
            html,
            csv
        } = infos
        const emails = infos["emails"] as string[]
        const sendMailWithFrom  = await getTransporter()
        let info = await sendMailWithFrom({
            to: emails,
            subject: "自动化测试报告",
            text: `自动化测试报告详见附件\n在线地址:${remote_url}\n通过:${passed}\n失败:${failed}\n通过率:${passRate}%`,
            attachments: [
                {
                    filename: 'report.html', // 附件文件名
                    content: html, // 附件内容
                    contentType: 'text/html' // 附件内容类型
                },
                {
                    filename: 'report.csv', // 附件文件名
                    content: `\ufeff${csv}`, // 附件内容
                    contentType: 'text/csv' // 附件内容类型
                }
            ]
        });

        console.log('Message sent: %s', info.messageId);
        res.send(`Email sent to ${emails.join(",")}`);
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send('Failed to send email.');
    }
};

const sendIntegrationEmail = async (req: Request, res: Response) => {
    const {test_id} = req.body;
    try {
        const {reportMessage, emails, htmlAttachment} = await getIntegrationEmail(test_id)
        const sendMailWithFrom  = await getTransporter()
        let info = await sendMailWithFrom ({
            to: emails,
            subject: "集成测试报告",
            text: reportMessage,
            attachments: [
                {
                    filename: 'report.html', // 附件文件名
                    content: htmlAttachment, // 附件内容
                    contentType: 'text/html' // 附件内容类型
                },
            ]
        });
        res.send(`Email sent to ${emails.join(",")}`);
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send('Failed to send email.');
    }
};

export default {sendEmail, sendIntegrationEmail}
