import User from "../models/User"
import TestEntry from "../models/TestEntry";
import TestReport from "../models/ReportModel";

import Papa from "papaparse";
import Integration from "../models/Integration";

async function getEmail(test_id: string) {
    const users = await User.find({email: {$ne: null}, roles: "tester"})
    const test_entry = await TestEntry.findOne({test_id})
    const remote_url = test_entry?.remote_url
    const emails = users.map(user => user.email)
    const testreport: any = await TestReport.findOne({test_id});
    const suites: any = testreport.suites;
    const all_suites = suites.flatMap((suite: { suites: any; }) => suite.suites);
    const all_specs = all_suites.flatMap((all_suite: { specs: any; }) => all_suite.specs);
    const infos = all_specs.map((spec: { title: any; ok: any; tests: any[] }) => {
        const isOk = spec.tests.some((test: any) => test.status === "expected")
        return {
            title: spec.title,
            ok: isOk
        }
    });

    // 计算统计数据
    const passed = infos.filter((info: { ok: any; }) => info.ok).length;
    const failed = infos.filter((info: { ok: any; }) => !info.ok).length;
    const total = infos.length;
    const passRate: any = (passed / total * 100).toFixed(2);

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    button, input[type="text"] {
      font-size: 16px;
      padding: 10px 15px;
      border: none;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      cursor: pointer;
      transition: all 0.3s ease;
    }
    button:hover, input[type="text"]:hover {
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    }
    input[type="text"] {
      margin-top: 20px;
      display: block;
      width: calc(100% - 34px);
    }
    ul { padding: 0; }
    li { list-style: none; margin: 5px 0; padding: 5px 10px; border: 1px solid #ddd; position: relative; background-color: #fff; }
    .passed { background-color: #e0ffe0; }
    .failed { background-color: #ffe0e0; }
    .passed::before, .failed::before { 
      content: ''; 
      position: absolute; 
      left: 5px; 
      top: 50%; 
      transform: translateY(-50%); 
      font-size: 16px;
    }
    .passed::before { content: '✔'; color: green; }
    .failed::before { content: '✖'; color: red; }
    
    .progress-bar {
      width: 100%; 
      background-color: #ddd;
      border-radius: 5px;
      height: 20px;
      position: relative;
      margin-bottom: 20px;
    }
    .progress-bar .passed-bar, .progress-bar .failed-bar {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 14px;
      position: absolute;
    }
    .passed-bar {
      background-color: #4CAF50;
      width: ${passRate}%;
    }
    .failed-bar {
      background-color: #f44336;
      width: ${100 - passRate}%;
      left: ${passRate}%;
    }

  </style>
</head>
<body>
  <h1 style="text-align: center">自动化报告汇总</h1>
  <h2>详细报告参考：<a href="${remote_url}">${remote_url}</a></h2>
  <div class="progress-bar">
    <div class="passed-bar">${passed} Passed (${passRate}%)</div>
    <div class="failed-bar">${failed} Failed (${(100 - passRate).toFixed(2)}%)</div>
  </div>
  <div style="display: flex;width: 100%;justify-content: space-between;padding: 0 20%;box-sizing: border-box">
      <button style="background: #6cb5e5;margin-right: 10px" onclick="filterResults('all')">Show All</button>
      <button style="background: #5fdd5b;margin-right: 10px;" onclick="filterResults('passed')">Show Passed</button>
      <button style="background: #c56960;margin-right: 10px;" onclick="filterResults('failed')">Show Failed</button>
      <button style="background: #dfd94e;margin-right: 10px;" onclick="filterResults('smoking')">Show Smoking Tests</button>
  </div>

  <input type="text" id="searchBox" placeholder="Custom Search..." oninput="filterResults('custom', this.value)">
  <ul id="testResults">
    ${infos.map((info: any) => `<li class="${info.ok ? 'passed' : 'failed'}" style="padding-left: 30px">${info.title}</li>`).join('')}
  </ul>
  <script>
    function filterResults(filter, value) {
      const results = document.querySelectorAll('#testResults li');
      results.forEach(result => {
        let isVisible = true;
        switch(filter) {
          case 'passed':
            isVisible = result.classList.contains('passed');
            break;
          case 'failed':
            isVisible = result.classList.contains('failed');
            break;
          case 'smoking':
            isVisible = result.textContent.startsWith('Smokingtest');
            break;
          case 'custom':
            isVisible = result.textContent.toLowerCase().includes(value.toLowerCase());
            break;
          default:
            isVisible = true;
            break;
        }
        result.style.display = isVisible ? '' : 'none';
      });
    }
    filterResults('smoking')
  </script>
</body>
</html>`;
    const infos2 = infos.map((info: any) => {
        const status = info.ok ? "通过" : "失败"
        return {
            "标题": info.title,
            "状态": status
        }
    })
    const csv = Papa.unparse(infos2);
    return {
        emails,
        html,
        remote_url,
        passed,
        failed,
        passRate,
        csv
    }
}

const getIntegrationEmail = async (test_id: string): Promise<{
    reportMessage: string,
    emails: string[],
    htmlAttachment: string
}> => {
    const users = await User.find({email: {$ne: null}, roles: "tester"})
    let emails = users.map(user => user.email) as string[]
    if (emails === null) {
        emails = []
    }
    const IntegrationDoc = await Integration.findOne({
        testid: test_id
    }).lean()
    if (!IntegrationDoc) {
        throw new Error("test_id不存在")
    }
    const TOTAL_TEST = IntegrationDoc.integrationResult.length
    let success = 0;
    let failed = 0;
    let failedSummary: any[] = [];
    IntegrationDoc.integrationResult.forEach(item => {
        if (item.status === '成功') {
            success++;
        } else if (item.status === '失败') {
            failed++;
            const obj = {
                name: item.method,
                errorMessage: item.errormessage
            }
            failedSummary.push(obj);
        }
    });
    const successRate = 100 * success / TOTAL_TEST;
    let reportMessage = `总案例数：${TOTAL_TEST}, \t 成功：${success}条, \t 失败：${failed}条, \t 成功率：${successRate.toFixed(2)}% \n\n 失败案例及其原因如下:\n`;
    failedSummary.forEach(item => {
        reportMessage += `${item.name}: ${item.errorMessage} \n`
    })

    const htmlAttachment = `
<!DOCTYPE html>
<html>

<head>
    <title>动态错误信息表格</title>
    <style>
        table,
        th,
        td {
            border: 1px solid black;
            border-collapse: collapse;
            padding: 10px;
        }

        th,
        td {
            text-align: left;
        }

        .name {
            max-width: 800px;
        }
    </style>
</head>

<body>

    <h2>错误信息统计</h2>

    <table id="errorTable">
        <tr>
            <th class="name">错误脚本</th>
            <th class="message">错误信息</th>
        </tr>
        <!-- 错误信息行将在这里动态添加 -->
    </table>

    <script>
        // 假设这是从某处获取的错误信息列表  
        var errorMessages = ${JSON.stringify(IntegrationDoc.integrationResult)}
        
        // 创建一个函数来动态添加行到表格  
        function addErrorRowsToTable(tableId, errors) {
            var table = document.getElementById(tableId);

            errors.forEach(function (error) {
                var row = table.insertRow(-1); // 在表格的末尾插入新行  
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);

                cell1.innerHTML = error.method; // 假设这一列总是这个值  
                cell2.innerHTML = error.errorMessage;
            });
        }

        // 调用函数，将错误信息添加到表格中  
        addErrorRowsToTable('errorTable', errorMessages);  
    </script>

</body>

</html>
    `
    return {reportMessage, emails, htmlAttachment}
}
export {
    getEmail,
    getIntegrationEmail
}