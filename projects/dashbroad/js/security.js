/**
 * 化學雲分析儀表板 - 安全分析模組
 */

// 安全分析篩選器
let securityFilters = {
    dateRange: {
        startDate: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), // 一週前
        endDate: new Date() // 現在
    },
    timeGranularity: 'day',
    userType: 'all',
    eventType: 'all'
};

// 圖表實例
let securityAccessChart = null;
let loginSuccessChart = null;
let accessHeatmapChart = null;

// 模擬數據
let securityEvents = [];
let abnormalIPs = [];

/**
 * 初始化安全分析頁籤
 */
document.addEventListener('DOMContentLoaded', function() {
    // 為安全分析頁籤添加事件監聽器
    const securityTab = document.getElementById('security-tab');
    if (securityTab) {
        securityTab.addEventListener('shown.bs.tab', function() {
            initSecurityDashboard();
        });
    }
});

/**
 * 初始化安全分析儀表板
 */
function initSecurityDashboard() {
    console.log('初始化安全分析儀表板');
    
    // 生成模擬數據
    generateSecurityMockData();
    
    // 初始化日期範圍選擇器
    initSecurityDateRangePicker();
    
    // 初始化篩選器事件
    bindSecurityFilterEvents();
    
    // 更新儀表板
    updateSecurityDashboard();
    
    // 初始化IP地圖
    initAbnormalIPMap();
}

/**
 * 初始化日期範圍選擇器
 */
function initSecurityDateRangePicker() {
    const dateRangePicker = document.getElementById('securityDateRange');
    if (dateRangePicker) {
        flatpickr(dateRangePicker, {
            mode: 'range',
            dateFormat: 'Y-m-d',
            defaultDate: [securityFilters.dateRange.startDate, securityFilters.dateRange.endDate],
            maxDate: 'today',
            locale: 'zh_tw',
            onChange: function(selectedDates) {
                if (selectedDates.length === 2) {
                    securityFilters.dateRange.startDate = selectedDates[0];
                    securityFilters.dateRange.endDate = selectedDates[1];
                }
            }
        });
    }
}

/**
 * 綁定安全分析篩選器事件
 */
function bindSecurityFilterEvents() {
    // 時間粒度選擇
    const timeGranularity = document.getElementById('securityTimeGranularity');
    if (timeGranularity) {
        timeGranularity.addEventListener('change', function() {
            securityFilters.timeGranularity = this.value;
        });
    }
    
    // 使用者類型選擇
    const userType = document.getElementById('securityUserType');
    if (userType) {
        userType.addEventListener('change', function() {
            securityFilters.userType = this.value;
        });
    }
    
    // 事件類型選擇
    const eventType = document.getElementById('securityEventType');
    if (eventType) {
        eventType.addEventListener('change', function() {
            securityFilters.eventType = this.value;
        });
    }
    
    // 套用篩選按鈕
    const applyButton = document.getElementById('applySecurityFilters');
    if (applyButton) {
        applyButton.addEventListener('click', function() {
            updateSecurityDashboard();
        });
    }
    
    // 重置篩選按鈕
    const resetButton = document.getElementById('securityResetFilters');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            resetSecurityFilters();
        });
    }
}

/**
 * 重置安全分析篩選器
 */
function resetSecurityFilters() {
    // 重置時間範圍
    securityFilters.dateRange.startDate = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
    securityFilters.dateRange.endDate = new Date();
    
    // 重置時間粒度
    securityFilters.timeGranularity = 'day';
    document.getElementById('securityTimeGranularity').value = 'day';
    
    // 重置使用者類型
    securityFilters.userType = 'all';
    document.getElementById('securityUserType').value = 'all';
    
    // 重置事件類型
    securityFilters.eventType = 'all';
    document.getElementById('securityEventType').value = 'all';
    
    // 重置日期選擇器
    const dateRangePicker = document.getElementById('securityDateRange');
    if (dateRangePicker && dateRangePicker._flatpickr) {
        dateRangePicker._flatpickr.setDate([securityFilters.dateRange.startDate, securityFilters.dateRange.endDate]);
    }
    
    // 更新儀表板
    updateSecurityDashboard();
}

/**
 * 更新安全分析儀表板
 */
function updateSecurityDashboard() {
    // 更新概述卡片
    updateSecurityStatsCards();
    
    // 更新訪問時間序列圖
    updateAccessTimeSeriesChart();
    
    // 更新登入成功率圖
    updateLoginSuccessChart();
    
    // 更新安全事件表格
    updateSecurityEventsTable();
    
    // 更新使用者訪問熱力圖
    updateAccessHeatmapChart();
}

/**
 * 更新概述卡片
 */
function updateSecurityStatsCards() {
    // 根據篩選條件獲取數據
    const filteredEvents = getFilteredSecurityEvents();
    
    // 計算訪問總次數
    const totalAccess = filteredEvents.filter(e => e.eventType === 'access' || e.eventType === 'login').length;
    document.getElementById('totalAccessCount').textContent = totalAccess.toLocaleString();
    
    // 計算異常訪問次數
    const abnormalAccess = filteredEvents.filter(e => e.status === 'warning' || e.status === 'danger').length;
    document.getElementById('abnormalAccessCount').textContent = abnormalAccess.toLocaleString();
    
    // 計算總流量
    const totalTraffic = filteredEvents.reduce((sum, event) => sum + (event.trafficSize || 0), 0);
    document.getElementById('totalTraffic').textContent = formatBytes(totalTraffic);
    
    // 獲取已阻擋IP數量
    const blockedIps = new Set(filteredEvents.filter(e => e.status === 'blocked').map(e => e.ipAddress));
    document.getElementById('blockedIpCount').textContent = blockedIps.size.toString();
}

/**
 * 更新訪問時間序列圖
 */
function updateAccessTimeSeriesChart() {
    // 獲取分組時間序列數據
    const timeSeriesData = getAccessTimeSeriesData();
    
    // 獲取畫布
    const ctx = document.getElementById('securityAccessChart');
    if (!ctx) return;
    
    // 如果圖表已存在則銷毀
    if (securityAccessChart) {
        securityAccessChart.destroy();
    }
    
    // 創建新圖表
    securityAccessChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeSeriesData.labels,
            datasets: [
                {
                    label: '正常訪問',
                    data: timeSeriesData.normalData,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    tension: 0.3
                },
                {
                    label: '異常訪問',
                    data: timeSeriesData.abnormalData,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '時間'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '訪問次數'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

/**
 * 更新登入成功率圖
 */
function updateLoginSuccessChart() {
    // 獲取篩選後的數據
    const filteredEvents = getFilteredSecurityEvents().filter(e => e.eventType === 'login');
    
    // 計算成功和失敗的數量
    const successCount = filteredEvents.filter(e => e.status === 'success').length;
    const failCount = filteredEvents.filter(e => e.status === 'failed').length;
    const totalCount = successCount + failCount;
    const successRate = totalCount > 0 ? (successCount / totalCount) * 100 : 0;
    
    // 獲取畫布
    const ctx = document.getElementById('loginSuccessChart');
    if (!ctx) return;
    
    // 如果圖表已存在則銷毀
    if (loginSuccessChart) {
        loginSuccessChart.destroy();
    }
    
    // 創建新圖表
    loginSuccessChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['成功', '失敗'],
            datasets: [{
                data: [successCount, failCount],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(255, 99, 132, 0.7)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: `成功率: ${successRate.toFixed(1)}%`
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const percentage = totalCount > 0 ? (value / totalCount * 100).toFixed(1) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            },
        }
    });
}

/**
 * 更新安全事件表格
 */
function updateSecurityEventsTable() {
    // 獲取篩選後的數據
    const filteredEvents = getFilteredSecurityEvents();
    
    // 獲取表格身體
    const tableBody = document.getElementById('securityEventsTable');
    if (!tableBody) return;
    
    // 清空表格
    tableBody.innerHTML = '';
    
    // 按時間排序，最新在前
    const sortedEvents = filteredEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // 只顯示最新的10條記錄
    const recentEvents = sortedEvents.slice(0, 10);
    
    // 添加記錄到表格
    recentEvents.forEach(event => {
        const row = document.createElement('tr');
        
        // 根據狀態設置行樣式
        if (event.status === 'warning') {
            row.className = 'table-warning';
        } else if (event.status === 'danger' || event.status === 'blocked') {
            row.className = 'table-danger';
        }
        
        // 格式化時間
        const time = new Date(event.timestamp);
        const formattedTime = `${time.getFullYear()}-${String(time.getMonth() + 1).padStart(2, '0')}-${String(time.getDate()).padStart(2, '0')} ${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}:${String(time.getSeconds()).padStart(2, '0')}`;
        
        // 格式化狀態
        let statusBadge = '';
        if (event.status === 'success') {
            statusBadge = '<span class="badge bg-success">成功</span>';
        } else if (event.status === 'warning') {
            statusBadge = '<span class="badge bg-warning">多次嘗試</span>';
        } else if (event.status === 'danger') {
            statusBadge = '<span class="badge bg-danger">未授權</span>';
        } else if (event.status === 'blocked') {
            statusBadge = '<span class="badge bg-danger">已阻擋</span>';
        } else if (event.status === 'failed') {
            statusBadge = '<span class="badge bg-danger">失敗</span>';
        }
        
        // 格式化事件類型
        let eventTypeText = '';
        if (event.eventType === 'login') {
            eventTypeText = '登入';
        } else if (event.eventType === 'access') {
            eventTypeText = '訪問資源';
        } else if (event.eventType === 'error') {
            eventTypeText = '錯誤事件';
        } else if (event.eventType === 'alert') {
            eventTypeText = '安全警告';
        } else {
            eventTypeText = event.eventType;
        }
        
        // 設置行內容
        row.innerHTML = `
            <td>${formattedTime}</td>
            <td>${event.username}</td>
            <td>${event.ipAddress}</td>
            <td>${eventTypeText}</td>
            <td>${statusBadge}</td>
            <td><button class="btn btn-sm btn-link">查看</button></td>
        `;
        
        tableBody.appendChild(row);
    });
}

/**
 * 更新使用者訪問熱力圖
 */
function updateAccessHeatmapChart() {
    // 獲取畫布
    const ctx = document.getElementById('accessHeatmapChart');
    if (!ctx) return;
    
    // 如果圖表已存在則銷毀
    if (accessHeatmapChart) {
        accessHeatmapChart.destroy();
    }
    
    // 獲取熱力圖數據
    const heatmapData = getAccessHeatmapData();
    
    // 創建新圖表
    accessHeatmapChart = new Chart(ctx, {
        type: 'heatmap',
        data: {
            labels: ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'],
            datasets: heatmapData.datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label} ${context.label}時: ${context.raw} 次訪問`;
                        }
                    }
                },
                datalabels: {
                    display: function(context) {
                        return context.raw > 5; // 只在數值大於5時顯示標籤
                    },
                    color: 'white',
                    font: {
                        weight: 'bold'
                    },
                    formatter: function(value) {
                        return value;
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '小時'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '星期'
                    }
                }
            }
        }
    });
}

/**
 * 初始化異常IP來源地圖
 */
function initAbnormalIPMap() {
    // 獲取地圖容器
    const mapContainer = document.getElementById('abnormalIPMap');
    if (!mapContainer) return;
    
    // 創建地圖
    const map = L.map(mapContainer).setView([23.5, 121], 3);
    
    // 添加底圖
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // 添加異常IP標記
    abnormalIPs.forEach(ip => {
        const marker = L.marker([ip.lat, ip.lng]).addTo(map);
        marker.bindPopup(`<b>IP: ${ip.ip}</b><br>位置: ${ip.location}<br>異常事件: ${ip.events}<br>最後嘗試: ${new Date(ip.lastAttempt).toLocaleString()}`);
    });
}

/**
 * 獲取篩選後的安全事件
 */
function getFilteredSecurityEvents() {
    return securityEvents.filter(event => {
        // 時間範圍篩選
        const eventTime = new Date(event.timestamp);
        const startTime = new Date(securityFilters.dateRange.startDate);
        const endTime = new Date(securityFilters.dateRange.endDate);
        endTime.setHours(23, 59, 59, 999); // 設置為當天結束
        
        if (eventTime < startTime || eventTime > endTime) {
            return false;
        }
        
        // 使用者類型篩選
        if (securityFilters.userType !== 'all' && event.userType !== securityFilters.userType) {
            return false;
        }
        
        // 事件類型篩選
        if (securityFilters.eventType !== 'all' && event.eventType !== securityFilters.eventType) {
            return false;
        }
        
        return true;
    });
}

/**
 * 獲取訪問時間序列數據
 */
function getAccessTimeSeriesData() {
    // 獲取篩選後的數據
    const filteredEvents = getFilteredSecurityEvents().filter(e => e.eventType === 'access' || e.eventType === 'login');
    
    // 獲取時間範圍
    const startDate = new Date(securityFilters.dateRange.startDate);
    const endDate = new Date(securityFilters.dateRange.endDate);
    
    // 根據時間粒度分組
    const groupedData = {};
    const labels = [];
    const normalData = [];
    const abnormalData = [];
    
    if (securityFilters.timeGranularity === 'hour') {
        // 按小時分組
        for (let d = new Date(startDate); d <= endDate; d.setHours(d.getHours() + 1)) {
            const timeKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:00`;
            labels.push(timeKey);
            groupedData[timeKey] = { normal: 0, abnormal: 0 };
        }
    } else if (securityFilters.timeGranularity === 'day') {
        // 按天分組
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const timeKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            labels.push(timeKey);
            groupedData[timeKey] = { normal: 0, abnormal: 0 };
        }
    } else if (securityFilters.timeGranularity === 'week') {
        // 按週分組
        const getWeekNumber = (d) => {
            const firstDay = new Date(d.getFullYear(), 0, 1);
            return Math.ceil((((d - firstDay) / 86400000) + firstDay.getDay() + 1) / 7);
        };
        
        let currentWeek = getWeekNumber(startDate);
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 7)) {
            const timeKey = `${d.getFullYear()} 第${getWeekNumber(d)}週`;
            if (!groupedData[timeKey]) {
                labels.push(timeKey);
                groupedData[timeKey] = { normal: 0, abnormal: 0 };
            }
        }
    } else if (securityFilters.timeGranularity === 'month') {
        // 按月分組
        for (let y = startDate.getFullYear(); y <= endDate.getFullYear(); y++) {
            const startMonth = y === startDate.getFullYear() ? startDate.getMonth() : 0;
            const endMonth = y === endDate.getFullYear() ? endDate.getMonth() : 11;
            
            for (let m = startMonth; m <= endMonth; m++) {
                const timeKey = `${y}-${String(m + 1).padStart(2, '0')}`;
                labels.push(timeKey);
                groupedData[timeKey] = { normal: 0, abnormal: 0 };
            }
        }
    }
    
    // 統計各時間段的訪問數量
    filteredEvents.forEach(event => {
        const eventTime = new Date(event.timestamp);
        let timeKey;
        
        if (securityFilters.timeGranularity === 'hour') {
            timeKey = `${eventTime.getFullYear()}-${String(eventTime.getMonth() + 1).padStart(2, '0')}-${String(eventTime.getDate()).padStart(2, '0')} ${String(eventTime.getHours()).padStart(2, '0')}:00`;
        } else if (securityFilters.timeGranularity === 'day') {
            timeKey = `${eventTime.getFullYear()}-${String(eventTime.getMonth() + 1).padStart(2, '0')}-${String(eventTime.getDate()).padStart(2, '0')}`;
        } else if (securityFilters.timeGranularity === 'week') {
            const weekNumber = Math.ceil((((eventTime - new Date(eventTime.getFullYear(), 0, 1)) / 86400000) + new Date(eventTime.getFullYear(), 0, 1).getDay() + 1) / 7);
            timeKey = `${eventTime.getFullYear()} 第${weekNumber}週`;
        } else if (securityFilters.timeGranularity === 'month') {
            timeKey = `${eventTime.getFullYear()}-${String(eventTime.getMonth() + 1).padStart(2, '0')}`;
        }
        
        if (groupedData[timeKey]) {
            if (event.status === 'warning' || event.status === 'danger' || event.status === 'blocked' || event.status === 'failed') {
                groupedData[timeKey].abnormal++;
            } else {
                groupedData[timeKey].normal++;
            }
        }
    });
    
    // 生成數據集
    for (const label of labels) {
        normalData.push(groupedData[label].normal);
        abnormalData.push(groupedData[label].abnormal);
    }
    
    return {
        labels,
        normalData,
        abnormalData
    };
}

/**
 * 獲取訪問熱力圖數據
 */
function getAccessHeatmapData() {
    // 獲取篩選後的數據
    const filteredEvents = getFilteredSecurityEvents().filter(e => e.eventType === 'access' || e.eventType === 'login');
    
    // 構建數據集
    const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const datasets = [];
    
    for (let i = 0; i < days.length; i++) {
        const dayData = new Array(24).fill(0);
        
        filteredEvents.forEach(event => {
            const eventTime = new Date(event.timestamp);
            if (eventTime.getDay() === i) {
                dayData[eventTime.getHours()]++;
            }
        });
        
        datasets.push({
            label: days[i],
            data: dayData,
            backgroundColor: function(context) {
                const value = context.dataset.data[context.dataIndex];
                const alpha = Math.min(0.8, Math.max(0.1, value / 50)); // 最大值假設是50
                return `rgba(75, 192, 192, ${alpha})`;
            }
        });
    }
    
    return {
        datasets: datasets.reverse() // 反轉使星期日在最下方
    };
}

/**
 * 生成模擬安全事件數據
 */
function generateSecurityMockData() {
    securityEvents = [];
    abnormalIPs = [];
    
    // 設置時間範圍（過去30天）
    const now = new Date();
    const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // 生成隨機用戶
    const users = [
        { username: 'admin', userType: 'admin' },
        { username: 'user1', userType: 'normal' },
        { username: 'user2', userType: 'normal' },
        { username: 'apiservice', userType: 'api' },
        { username: 'supervisor', userType: 'admin' }
    ];
    
    // 生成隨機IP地址
    const ipAddresses = [
        '192.168.1.100',
        '192.168.1.101',
        '192.168.1.102',
        '203.0.113.42',
        '45.33.21.18',
        '118.163.120.5',  // 台灣
        '203.145.151.80', // 台灣
        '14.63.198.30',   // 韓國
        '183.84.5.102',   // 中國
        '210.249.12.54'   // 日本
    ];
    
    // 生成隨機事件類型
    const eventTypes = ['login', 'access', 'error', 'alert'];
    
    // 生成隨機狀態
    const statuses = ['success', 'warning', 'danger', 'blocked', 'failed'];
    
    // 生成模擬異常IP
    abnormalIPs = [
        { ip: '14.63.198.30', lat: 37.5665, lng: 126.9780, location: '首爾, 韓國', events: 24, lastAttempt: now.getTime() - 2 * 60 * 60 * 1000 },
        { ip: '183.84.5.102', lat: 39.9042, lng: 116.4074, location: '北京, 中國', events: 65, lastAttempt: now.getTime() - 6 * 60 * 60 * 1000 },
        { ip: '210.249.12.54', lat: 35.6762, lng: 139.6503, location: '東京, 日本', events: 18, lastAttempt: now.getTime() - 12 * 60 * 60 * 1000 },
        { ip: '134.201.250.155', lat: 34.0522, lng: -118.2437, location: '洛杉磯, 美國', events: 42, lastAttempt: now.getTime() - 24 * 60 * 60 * 1000 },
        { ip: '89.160.20.112', lat: 59.3293, lng: 18.0686, location: '斯德哥爾摩, 瑞典', events: 31, lastAttempt: now.getTime() - 48 * 60 * 60 * 1000 }
    ];
    
    // 生成正常訪問事件
    for (let day = 0; day < 30; day++) {
        // 每天生成100-300個訪問事件
        const eventsCount = Math.floor(Math.random() * 200) + 100;
        
        for (let i = 0; i < eventsCount; i++) {
            // 生成隨機時間（當天內）
            const eventDate = new Date(startDate.getTime() + day * 24 * 60 * 60 * 1000);
            eventDate.setHours(Math.floor(Math.random() * 24));
            eventDate.setMinutes(Math.floor(Math.random() * 60));
            eventDate.setSeconds(Math.floor(Math.random() * 60));
            
            // 生成隨機用戶
            const user = users[Math.floor(Math.random() * users.length)];
            
            // 生成隨機IP地址
            const ipAddress = ipAddresses[Math.floor(Math.random() * (ipAddresses.length - 3))]; // 使用正常IP
            
            // 生成隨機事件類型
            const eventType = eventTypes[Math.floor(Math.random() * 2)]; // 只用login和access
            
            // 決定事件狀態（95%成功）
            const status = Math.random() < 0.95 ? 'success' : 'warning';
            
            // 生成隨機流量大小（1KB-1MB）
            const trafficSize = Math.floor(Math.random() * 1024 * 1024) + 1024;
            
            // 添加事件
            securityEvents.push({
                timestamp: eventDate,
                username: user.username,
                userType: user.userType,
                ipAddress: ipAddress,
                eventType: eventType,
                status: status,
                trafficSize: trafficSize,
                details: `${eventType === 'login' ? '登入系統' : '訪問資源'}`
            });
        }
    }
    
    // 生成異常事件
    for (let day = 0; day < 30; day++) {
        // 每天生成0-20個異常事件
        const eventsCount = Math.floor(Math.random() * 20);
        
        for (let i = 0; i < eventsCount; i++) {
            // 生成隨機時間（當天內）
            const eventDate = new Date(startDate.getTime() + day * 24 * 60 * 60 * 1000);
            eventDate.setHours(Math.floor(Math.random() * 24));
            eventDate.setMinutes(Math.floor(Math.random() * 60));
            eventDate.setSeconds(Math.floor(Math.random() * 60));
            
            // 生成隨機用戶（有時是未知用戶）
            const useUnknown = Math.random() < 0.3;
            const user = useUnknown ? { username: 'unknown', userType: 'unknown' } : users[Math.floor(Math.random() * users.length)];
            
            // 生成隨機IP地址（使用異常IP）
            const ipIndex = Math.floor(Math.random() * 3) + 7; // 使用後三個IP (異常IP)
            const ipAddress = ipAddresses[ipIndex];
            
            // 生成隨機事件類型
            const eventTypeIndex = Math.floor(Math.random() * eventTypes.length);
            const eventType = eventTypes[eventTypeIndex];
            
            // 決定事件狀態
            const statusIndex = Math.floor(Math.random() * 4) + 1; // 只使用warning, danger, blocked, failed
            const status = statuses[statusIndex];
            
            // 生成隨機流量大小（1KB-1MB）
            const trafficSize = Math.floor(Math.random() * 1024 * 1024) + 1024;
            
            // 添加事件
            securityEvents.push({
                timestamp: eventDate,
                username: user.username,
                userType: user.userType,
                ipAddress: ipAddress,
                eventType: eventType,
                status: status,
                trafficSize: trafficSize,
                details: `${status === 'warning' ? '多次嘗試' : status === 'danger' ? '未授權訪問' : status === 'blocked' ? '已阻擋IP' : '登入失敗'}`
            });
        }
    }
    
    // 按時間排序
    securityEvents.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

/**
 * 格式化位元組大小
 * @param {number} bytes - 位元組數量
 * @returns {string} - 格式化後的字串
 */
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * 更新安全事件列表的顯示
 */
function updateSecurityEvents() {
    const securityEventsList = document.getElementById('securityEventsList');
    if (!securityEventsList) return;
    
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    // 清空現有內容
    securityEventsList.innerHTML = '';
    
    // 生成模擬安全事件
    const events = generateMockSecurityEvents();
    
    // 將事件添加到列表
    events.forEach(event => {
        const severityClass = `${event.severity}-severity`;
        const itemClass = `security-event-item ${severityClass}`;
        
        // 根據深色模式選擇適當的背景和文字顏色
        let bgColor, borderColor, textColor;
        if (isDarkMode) {
            if (event.severity === 'high') {
                bgColor = '#742a2a';
                borderColor = '#9b2c2c';
                textColor = '#e2e8f0';
            } else if (event.severity === 'medium') {
                bgColor = '#744a2a';
                borderColor = '#9b5c2c';
                textColor = '#e2e8f0';
            } else {
                bgColor = '#2a4a74';
                borderColor = '#2c5282';
                textColor = '#e2e8f0';
            }
        } else {
            if (event.severity === 'high') {
                bgColor = '#fed7d7';
                borderColor = '#feb2b2';
                textColor = '#c53030';
            } else if (event.severity === 'medium') {
                bgColor = '#feebc8';
                borderColor = '#fbd38d';
                textColor = '#c05621';
            } else {
                bgColor = '#bee3f8';
                borderColor = '#90cdf4';
                textColor = '#2c5282';
            }
        }
        
        const eventHtml = `
            <div class="${itemClass}" style="background-color: ${bgColor}; border-color: ${borderColor}; color: ${textColor};">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h6 class="event-title" style="color: ${textColor};">${event.title}</h6>
                        <p class="event-description mb-1">${event.description}</p>
                    </div>
                    <span class="security-event-severity ${event.severity} badge">
                        ${getSeverityText(event.severity)}
                    </span>
                </div>
                <div class="event-meta d-flex justify-content-between mt-2">
                    <span class="event-source small">來源: ${event.source}</span>
                    <span class="event-time small" style="color: ${isDarkMode ? '#a0aec0' : '#718096'};">
                        ${formatTimeAgo(event.timestamp)}
                    </span>
                </div>
            </div>
        `;
        
        securityEventsList.innerHTML += eventHtml;
    });
}

/**
 * 初始化安全事件頁面
 */
function initSecurityEvents() {
    updateSecurityEvents();
    
    // 監聽深色模式切換，更新安全事件顯示
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            // 延遲執行以確保深色模式已切換
            setTimeout(function() {
                if (document.getElementById('security-dashboard').classList.contains('active')) {
                    updateSecurityEvents();
                }
            }, 50);
        });
    }
    
    // 每隔一段時間自動刷新安全事件
    setInterval(updateSecurityEvents, 300000); // 5分鐘刷新一次
} 