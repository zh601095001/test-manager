const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const reportPath = './report.json';  // 替换为实际的报告文件路径
const apiEndpoint = 'http://localhost:3000/files';  // 替换为你的API端点

async function uploadFile(filePath) {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    const response = await axios.post(apiEndpoint, formData, {
        headers: {
            ...formData.getHeaders(),
        },
    });

    return response.data.url;  // 确保你的API返回的对象中有url属性
}

async function processReport() {
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

    for (let suite of report.suites) {
        for (let spec of suite.suites) {
            for (let test of spec.specs) {
                for (let result of test.tests) {
                    for (let attachment of result.attachments) {
                        const url = await uploadFile(attachment.path);
                        attachment.url = url;  // 添加url到附件中
                        delete attachment.path;  // 可选择删除原始路径
                    }
                }
            }
        }
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));  // 写回更新后的报告
    console.log('Report processed and updated.');
}

processReport().catch(console.error);
