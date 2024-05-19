function renderDeviceTable(devices) {
    const deviceTableBody = document.getElementById('device-table-body');
    deviceTableBody.innerHTML = '';

    let hasFreeDevices = false;

    devices.forEach(device => {
        let releaseButton = '';
        let lockButton = '';

        if (device.locked) {
            releaseButton = `<button class="blue-button" onclick="releaseDevice('${device.ip}')">释放</button>`;
        } else {
            lockButton = `<button class="green-button" onclick="lockSpecificDevice('${device.ip}')">锁定</button>`;
            hasFreeDevices = true; // Mark that at least one device is free
        }

        const removeButton = `<button class="delete-button" onclick="removeDevice('${device.ip}')">移除</button>`;

        // Determine the row style based on the locked status
        let rowStyle = device.locked ? 'background-color: #f8d7da;' : '';
        if (device.purpose?.includes("维护")) {
            rowStyle = "background-color: #fffa8e;"
        } else if (device.purpose?.includes("自动化测试")) {
            const color = "#e0e8f6"
            rowStyle = `background-color: ${color};`
        }
        // Create a table row with the appropriate style
        const row = document.createElement('tr');
        row.style = rowStyle;
        row.innerHTML = `
                <td>${device.name}</td>
                <td>${device.ip}</td>
                <td>${device.lockStartTime || ''}</td>
                <td>${device.lockedDuration || ''}</td>
                <td>${device.purpose || ''}</td>
                <td>${releaseButton} ${lockButton} ${removeButton}</td>
                `;
        deviceTableBody.appendChild(row);
    });

    updateGetFreeDeviceButton(hasFreeDevices);
}

function updateGetFreeDeviceButton(hasFreeDevices) {
    const getFreeDeviceButton = document.getElementById('get-free-device-btn');
    if (hasFreeDevices) {
        getFreeDeviceButton.classList.remove("gray-button");
        getFreeDeviceButton.classList.add("blue-button");
    } else {
        getFreeDeviceButton.classList.remove("blue-button");
        getFreeDeviceButton.classList.add("gray-button");
    }
    getFreeDeviceButton.disabled = !hasFreeDevices;
}

// 显示和隐藏加载蒙版
function showLoading() {
    document.getElementById('loading-overlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
}

// 自定义通知函数
function showNotification(message, isError = false) {
    const notificationContainer = document.getElementById('notification-container');
    const notification = document.createElement('div');

    notification.style.backgroundColor = isError ? '#f8d7da' : '#d4edda';
    notification.style.color = isError ? '#721c24' : '#155724';
    notification.style.border = isError ? '1px solid #f5c6cb' : '1px solid #c3e6cb';
    notification.style.borderRadius = '5px';
    notification.style.padding = '10px';
    notification.style.marginTop = '10px';
    notification.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    notification.style.position = 'relative';
    notification.style.paddingRight = "80px"
    notification.textContent = message;

    // 从消息中提取 IP 地址
    const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;
    const ipAddressMatch = message.match(ipRegex);
    const ipAddress = ipAddressMatch ? ipAddressMatch[0] : null;

    // 创建 "复制" 按钮
    const copyButton = document.createElement('button');
    copyButton.textContent = '复制 IP';
    copyButton.style.position = 'absolute';
    copyButton.style.top = '50%';
    copyButton.style.right = '5px';
    copyButton.style.transform = "translate(0, -50%)"
    copyButton.style.padding = '3px 6px';
    copyButton.style.border = 'none';
    copyButton.style.backgroundColor = 'rgba(0, 123, 255, 0.8)'; // 半透明蓝色背景
    copyButton.style.color = '#fff';
    copyButton.style.cursor = 'pointer';
    copyButton.style.borderRadius = '3px';
    copyButton.style.zIndex = '1000'; // 提高按钮的层级

    // 复制 IP 地址到剪切板的事件监听器
    copyButton.addEventListener('click', async () => {
        if (ipAddress) {
            try {
                await navigator.clipboard.writeText(ipAddress);
                showTemporaryNotification('IP 地址已成功复制到剪切板!', false);
            } catch (err) {
                showTemporaryNotification('复制到剪切板失败。', true);
            }
        } else {
            showTemporaryNotification('未检测到 IP 地址。', true);
        }
    });

    // 将复制按钮添加到通知
    notification.appendChild(copyButton);
    notificationContainer.appendChild(notification);

    // 3 秒后自动移除通知
    setTimeout(() => {
        notificationContainer.removeChild(notification);
    }, 8000);
}

// 临时通知函数
function showTemporaryNotification(message, isError) {
    const notificationContainer = document.getElementById('notification-container');
    const notification = document.createElement('div');

    notification.style.backgroundColor = isError ? '#f8d7da' : '#d4edda';
    notification.style.color = isError ? '#721c24' : '#155724';
    notification.style.border = isError ? '1px solid #f5c6cb' : '1px solid #c3e6cb';
    notification.style.borderRadius = '5px';
    notification.style.padding = '10px';
    notification.style.marginTop = '10px';
    notification.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    notification.textContent = message;

    notificationContainer.appendChild(notification);

    // 3 秒后自动移除通知
    setTimeout(() => {
        notificationContainer.removeChild(notification);
    }, 8000);
}

async function lockSpecificDevice(ip) {
    const purpose = prompt('请输入锁定设备的使用者:');

    if (!purpose) {
        return; // 如果用户取消或输入为空，直接返回
    }

    showLoading(); // 显示加载蒙版

    try {
        // 使用 fetch 提交锁定请求
        const response = await fetch(`/devices/lock/${ip}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({purpose})
        });
        const result = await response.json();
        showNotification(result.message || result.error, !!result.error);
    } finally {
        hideLoading(); // 隐藏加载蒙版
    }
}

async function addDevice(event) {
    event.preventDefault();
    showLoading(); // 显示加载蒙版

    const ip = document.getElementById('ip').value;
    const name = document.getElementById('name').value;

    try {
        const response = await fetch('/devices', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ip, name})
        });
        const result = await response.json();
        showNotification(result.message || result.error, !!result.error);
    } finally {
        hideLoading(); // 隐藏加载蒙版
    }
}

async function releaseDevice(ip) {
    const isConfirmed = confirm(`你确定要释放设备 ${ip} 吗？`);
    if (!isConfirmed) {
        return; // If the user cancels the action, exit the function
    }
    showLoading(); // 显示加载蒙版

    try {
        const response = await fetch(`/devices/release/${ip}`, {method: 'POST'});
        const result = await response.json();
        showNotification(result.message || result.error, !!result.error);
    } finally {
        hideLoading(); // 隐藏加载蒙版
    }
}

async function removeDevice(ip) {
    const isConfirmed = confirm(`你确定要移除设备 ${ip} 吗？`);
    if (!isConfirmed) {
        return; // If the user cancels the action, exit the function
    }
    showLoading(); // 显示加载蒙版

    try {
        const response = await fetch(`/devices/${ip}`, {method: 'DELETE'});
        const result = await response.json();
        showNotification(result.message || result.error, !!result.error);
    } finally {
        hideLoading(); // 隐藏加载蒙版
    }
}

async function lockDevice(event) {
    event.preventDefault();
    showLoading(); // 显示加载蒙版

    const purpose = document.getElementById('purpose').value;

    try {
        const response = await fetch('/devices/lock-free', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({purpose})
        });
        const result = await response.json();
        showNotification(result.message || result.error, !!result.error);
    } finally {
        hideLoading(); // 隐藏加载蒙版
    }
}