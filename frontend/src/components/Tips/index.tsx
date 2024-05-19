import React from 'react';

function Tips() {
    return (
        <>
            <h3>
                <b>注</b>：1. 若发现节点<span style={{color: '#fb0013'}}>不可用</span>，“<span
                style={{color: '#fb0013'}}>使用者</span>”请标记为“<span
                style={{color: '#fb0013'}}>维护</span>(原因)”,以便颜色标记为<span style={{color: '#f6ef5c'}}>黄色</span>。2.
                若“<span
                style={{color: '#fb0013'}}>使用者</span>”为“<span
                style={{color: '#3498db'}}>自动化测试</span>”请标记为<span
                style={{color: '#3498db'}}>蓝色</span>，<span style={{color: '#fb0013'}}>手工测试</span>可以在<span
                style={{color: '#fb0013'}}>自动化测试间隙</span>锁定该设备。
                3.“使用者”字段可以加括号，备注用途，例如：使用者姓名(功能测试xxx)
            </h3>
        </>
    );
}

export default Tips;