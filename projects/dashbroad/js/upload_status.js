/**
 * 化學雲儀表板 - 資料上傳狀態模組
 * 提供系統資料上傳狀態追蹤和時間軸視覺化功能
 */

// 初始化數據和設置
let uploadStatusData = [];
let systemsConfig = [];
let currentFilters = {
    year: new Date().getFullYear(),
    system: "all",
    status: "all"
};

// DOM 載入完成後初始化
document.addEventListener("DOMContentLoaded", function() {
    // 監聽資料上傳狀態標籤頁顯示事件
    document.getElementById('upload-status-tab').addEventListener('shown.bs.tab', function (e) {
        initUploadStatusDashboard();
    });

    // 綁定過濾器和按鈕事件
    bindUploadStatusEvents();
    
    // 監聽深色模式切換
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            // 延遲更新，等待DOM樣式更新完成
            setTimeout(() => {
                if (document.getElementById('upload-status-dashboard').classList.contains('active')) {
                    updateUploadStatusDashboard();
                }
            }, 100);
        });
    }
});

/**
 * 初始化資料上傳狀態儀表板
 */
function initUploadStatusDashboard() {
    // 預設選擇當前年度
    document.getElementById('yearSelection').value = currentFilters.year;
    
    // 生成系統配置和模擬數據
    generateSystemsConfig();
    generateUploadStatusData();
    
    // 更新儀表板顯示
    updateUploadStatusDashboard();
}

/**
 * 綁定資料上傳狀態相關事件
 */
function bindUploadStatusEvents() {
    // 綁定過濾選項應用按鈕
    document.getElementById('applyFilters').addEventListener('click', function() {
        // 獲取過濾選項值
        currentFilters.year = document.getElementById('yearSelection').value;
        currentFilters.system = document.getElementById('systemSelection').value;
        currentFilters.status = document.getElementById('statusSelection').value;
        
        // 更新儀表板
        updateUploadStatusDashboard();
    });
    
    // 綁定重置過濾按鈕
    document.getElementById('resetFilters').addEventListener('click', function() {
        // 重置過濾選項
        document.getElementById('yearSelection').value = new Date().getFullYear();
        document.getElementById('systemSelection').value = "all";
        document.getElementById('statusSelection').value = "all";
        
        // 更新當前過濾器
        currentFilters.year = new Date().getFullYear();
        currentFilters.system = "all";
        currentFilters.status = "all";
        
        // 更新儀表板
        updateUploadStatusDashboard();
    });
    
    // 綁定匯出報表按鈕
    document.getElementById('exportUploadStatus').addEventListener('click', function() {
        exportUploadStatusReport();
    });
    
    // 綁定重整數據按鈕
    document.getElementById('refreshUploadStatus').addEventListener('click', function() {
        // 重新生成數據並更新儀表板
        generateUploadStatusData();
        updateUploadStatusDashboard();
        
        // 顯示通知
        showNotification('資料已重新載入', 'success');
    });
}

/**
 * 生成系統配置數據
 */
function generateSystemsConfig() {
    systemsConfig = [
        {
            id: 'system_a',
            name: '系統 A',
            description: '化學物質追蹤系統',
            uploadMonths: [1, 4, 7, 10], // 每季度上傳
            uploadDay: 1 // 每月1日
        },
        {
            id: 'system_b',
            name: '系統 B',
            description: '儲存記錄系統',
            uploadMonths: [1, 7], // 每半年上傳
            uploadDay: 15 // 每月15日
        },
        {
            id: 'system_c',
            name: '系統 C',
            description: '勞安監控系統',
            uploadMonths: [3, 6, 9, 12], // 每季度上傳 (不同月份)
            uploadDay: 10 // 每月10日
        },
        {
            id: 'system_d',
            name: '系統 D',
            description: '環境監測系統',
            uploadMonths: [1, 3, 5, 7, 9, 11], // 每兩個月上傳
            uploadDay: 5 // 每月5日
        },
        {
            id: 'system_e',
            name: '系統 E',
            description: '運輸追蹤系統',
            uploadMonths: [12], // 每年上傳
            uploadDay: 31 // 每月31日
        }
    ];
}

/**
 * 生成模擬資料上傳狀態數據
 */
function generateUploadStatusData() {
    uploadStatusData = [];
    
    // 獲取當前年份
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // 0-11 轉 1-12
    const currentDate = new Date();
    
    // 為每個系統生成資料
    systemsConfig.forEach(system => {
        // 為過去3年和當前年份生成數據
        for (let year = currentYear - 3; year <= currentYear + 1; year++) {
            system.uploadMonths.forEach(month => {
                // 創建上傳日期
                const uploadDate = new Date(year, month - 1, system.uploadDay);
                
                // 檢查該日期是否已過
                const isPastDate = uploadDate < currentDate;
                
                // 計算狀態
                let status = 'scheduled'; // 預設為待上傳
                let errorDescription = '';
                let actualUploadDate = null;
                
                if (isPastDate) {
                    // 模擬過去數據的不同狀態
                    const rand = Math.random();
                    
                    if (rand < 0.6) {
                        // 60% 機率正常上傳
                        status = 'uploaded';
                        // 實際上傳日期在計劃日期前後3天內
                        const daysOffset = Math.floor(Math.random() * 7) - 3;
                        actualUploadDate = new Date(uploadDate);
                        actualUploadDate.setDate(actualUploadDate.getDate() + daysOffset);
                    } else if (rand < 0.8) {
                        // 20% 機率上傳有誤但已修正
                        status = 'corrected';
                        errorDescription = getRandomErrorDescription();
                        // 實際上傳日期在計劃日期後5-10天
                        const daysOffset = 5 + Math.floor(Math.random() * 6);
                        actualUploadDate = new Date(uploadDate);
                        actualUploadDate.setDate(actualUploadDate.getDate() + daysOffset);
                    } else if (rand < 0.9) {
                        // 10% 機率上傳有誤待修正
                        status = 'error';
                        errorDescription = getRandomErrorDescription();
                        // 實際上傳日期在計劃日期後1-5天
                        const daysOffset = 1 + Math.floor(Math.random() * 5);
                        actualUploadDate = new Date(uploadDate);
                        actualUploadDate.setDate(actualUploadDate.getDate() + daysOffset);
                    } else {
                        // 10% 機率未上傳
                        status = 'missing';
                    }
                } else {
                    // 未來日期
                    // 如果是即將到來的上傳（30天內）但不是當前月份，標記為等待上傳
                    const daysUntilUpload = Math.floor((uploadDate - currentDate) / (1000 * 60 * 60 * 24));
                    if (daysUntilUpload <= 30) {
                        status = 'scheduled';
                    } else {
                        // 超過30天的未來日期，不標記為需要上傳
                        status = 'normal';
                    }
                }
                
                // 添加到數據數組
                uploadStatusData.push({
                    systemId: system.id,
                    systemName: system.name,
                    systemDescription: system.description,
                    year: year,
                    month: month,
                    scheduledDate: uploadDate,
                    actualUploadDate: actualUploadDate,
                    status: status,
                    errorDescription: errorDescription
                });
            });
        }
    });
    
    // 按日期排序
    uploadStatusData.sort((a, b) => a.scheduledDate - b.scheduledDate);
}

/**
 * 根據過濾器獲取過濾後的數據
 */
function getFilteredUploadData() {
    return uploadStatusData.filter(item => {
        // 檢查年份
        if (item.year != currentFilters.year) {
            return false;
        }
        
        // 檢查系統
        if (currentFilters.system !== 'all' && item.systemId !== currentFilters.system) {
            return false;
        }
        
        // 檢查狀態
        if (currentFilters.status !== 'all' && item.status !== currentFilters.status) {
            return false;
        }
        
        return true;
    });
}

/**
 * 更新資料上傳狀態儀表板
 */
function updateUploadStatusDashboard() {
    // 更新時間軸
    updateUploadTimeline();
    
    // 更新待上傳系統列表
    updateUpcomingUploadsList();
    
    // 更新異常追蹤列表
    updateErrorTrackingList();
}

/**
 * 更新上傳時間軸
 */
function updateUploadTimeline() {
    const timelineContainer = document.getElementById('uploadStatusTimeline');
    const filteredData = getFilteredUploadData();
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    // 按系統分組
    const systemGroups = {};
    filteredData.forEach(item => {
        if (!systemGroups[item.systemId]) {
            systemGroups[item.systemId] = {
                systemId: item.systemId,
                systemName: item.systemName,
                systemDescription: item.systemDescription,
                months: {}
            };
        }
        
        systemGroups[item.systemId].months[item.month] = item;
    });
    
    // 構建時間軸 HTML
    let timelineHTML = '<div class="timeline-header"><div class="timeline-system"></div><div class="timeline-status">';
    
    // 添加月份標頭
    for (let month = 1; month <= 12; month++) {
        const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
        timelineHTML += `<div class="timeline-month">${monthNames[month-1]}</div>`;
    }
    
    timelineHTML += '</div></div>';
    
    // 如果過濾後沒有數據，顯示提示信息
    if (Object.keys(systemGroups).length === 0) {
        timelineHTML = '<div class="text-center py-5"><p class="text-muted">沒有符合過濾條件的資料</p></div>';
    } else {
        // 添加每個系統的時間軸行
        Object.values(systemGroups).forEach(system => {
            timelineHTML += `
                <div class="timeline-row">
                    <div class="timeline-system" title="${system.systemDescription}">${system.systemName}</div>
                    <div class="timeline-status">
            `;
            
            // 添加每個月的狀態
            for (let month = 1; month <= 12; month++) {
                const monthData = system.months[month];
                let statusClass = 'normal';
                let tooltipText = `${currentFilters.year}年${month}月: 非上傳月份`;
                let progressBar = '';
                
                if (monthData) {
                    statusClass = monthData.status;
                    
                    if (monthData.status === 'uploaded') {
                        tooltipText = `${currentFilters.year}年${month}月: 已正確上傳`;
                        if (monthData.actualUploadDate) {
                            tooltipText += `<br>實際上傳: ${formatDate(monthData.actualUploadDate)}`;
                        }
                    } else if (monthData.status === 'scheduled') {
                        tooltipText = `${currentFilters.year}年${month}月: 需要上傳`;
                        tooltipText += `<br>預定上傳: ${formatDate(monthData.scheduledDate)}`;
                        
                        // 添加轉置進度顯示 (對於即將上傳的項目)
                        const now = new Date();
                        const uploadDate = monthData.scheduledDate;
                        // 計算距離上傳日期的進度百分比 (基於當前月份的天數)
                        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                        const monthTotalDays = monthEnd.getDate();
                        const daysPassed = Math.floor((now - monthStart) / (1000 * 60 * 60 * 24));
                        const progressPercent = Math.min(100, Math.max(0, Math.round((daysPassed / monthTotalDays) * 100)));
                        
                        // 如果是當前月份的預定上傳，顯示進度條
                        if (now.getMonth() + 1 === month && now.getFullYear() === currentFilters.year) {
                            const bgClass = isDarkMode ? 'bg-dark' : 'bg-light';
                            progressBar = `
                                <div class="upload-progress-wrapper mt-1" style="height: 4px; width: 100%; background-color: ${isDarkMode ? '#495057' : '#e9ecef'};">
                                    <div class="upload-progress" style="height: 100%; width: ${progressPercent}%; background-color: #ffc107;"></div>
                                </div>
                            `;
                            tooltipText += `<br>月度進度: ${progressPercent}%`;
                        }
                    } else if (monthData.status === 'error') {
                        tooltipText = `${currentFilters.year}年${month}月: 有誤待修正`;
                        if (monthData.errorDescription) {
                            tooltipText += `<br>錯誤: ${monthData.errorDescription}`;
                        }
                        if (monthData.actualUploadDate) {
                            tooltipText += `<br>上傳日期: ${formatDate(monthData.actualUploadDate)}`;
                        }
                    } else if (monthData.status === 'corrected') {
                        tooltipText = `${currentFilters.year}年${month}月: 已修正回覆`;
                        if (monthData.actualUploadDate) {
                            tooltipText += `<br>修正日期: ${formatDate(monthData.actualUploadDate)}`;
                        }
                        if (monthData.errorDescription) {
                            tooltipText += `<br>原始錯誤: ${monthData.errorDescription}`;
                        }
                    } else if (monthData.status === 'missing') {
                        tooltipText = `${currentFilters.year}年${month}月: 已超過未上傳`;
                        tooltipText += `<br>預定上傳: ${formatDate(monthData.scheduledDate)}`;
                        tooltipText += `<br>已逾期: ${getDaysOverdue(monthData.scheduledDate)}天`;
                    }
                }
                
                // 為深色模式調整樣式
                const dotStyle = statusClass === 'normal' && isDarkMode ? 
                    'style="border-color: #495057;"' : '';
                
                timelineHTML += `
                    <div class="timeline-month-status">
                        <div class="status-dot ${statusClass}" ${dotStyle}></div>
                        <div class="status-tooltip">${tooltipText}</div>
                        ${progressBar}
                    </div>
                `;
            }
            
            timelineHTML += '</div></div>';
        });
    }
    
    // 更新 DOM
    timelineContainer.innerHTML = timelineHTML;
}

/**
 * 計算已逾期天數
 */
function getDaysOverdue(dueDate) {
    const now = new Date();
    const due = new Date(dueDate);
    return Math.floor((now - due) / (1000 * 60 * 60 * 24));
}

/**
 * 更新待上傳系統列表
 */
function updateUpcomingUploadsList() {
    const upcomingList = document.getElementById('upcomingUploadsList');
    const currentDate = new Date();
    const thirtyDaysLater = new Date(currentDate);
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    // 篩選未來30天內需要上傳的資料
    const upcomingUploads = uploadStatusData.filter(item => {
        return item.scheduledDate >= currentDate && 
               item.scheduledDate <= thirtyDaysLater && 
               item.status === 'scheduled';
    });
    
    // 按上傳日期排序
    upcomingUploads.sort((a, b) => a.scheduledDate - b.scheduledDate);
    
    // 構建 HTML
    let listHTML = '';
    
    if (upcomingUploads.length === 0) {
        listHTML = '<tr><td colspan="4" class="text-center py-3">未來30天內沒有待上傳項目</td></tr>';
    } else {
        upcomingUploads.forEach(item => {
            const daysLeft = Math.ceil((item.scheduledDate - currentDate) / (1000 * 60 * 60 * 24));
            const daysLeftClass = daysLeft <= 3 ? 'text-danger' : (daysLeft <= 7 ? 'text-warning' : '');
            
            // 添加進度條，顯示距離截止日的進度
            const progressBgColor = isDarkMode ? '#343a40' : '#e9ecef';
            const progressBarColor = daysLeft <= 3 ? '#dc3545' : (daysLeft <= 7 ? '#ffc107' : '#28a745');
            const progressPercent = Math.min(100, Math.max(0, Math.round((30 - daysLeft) / 30 * 100)));
            const progressBar = `
                <div style="height: 4px; background-color: ${progressBgColor}; width: 100%; margin-top: 5px;">
                    <div style="height: 100%; width: ${progressPercent}%; background-color: ${progressBarColor};"></div>
                </div>
            `;
            
            listHTML += `
                <tr>
                    <td>${item.systemName}</td>
                    <td>${formatDateWithWeekday(item.scheduledDate)}</td>
                    <td class="${daysLeftClass} fw-bold">${daysLeft}天</td>
                    <td>
                        <span class="badge bg-warning">待上傳</span>
                        ${progressBar}
                    </td>
                </tr>
            `;
        });
    }
    
    // 更新 DOM
    upcomingList.innerHTML = listHTML;
}

/**
 * 更新異常追蹤列表
 */
function updateErrorTrackingList() {
    const errorList = document.getElementById('errorTrackingList');
    const currentDate = new Date();
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    // 篩選有錯誤的資料
    const errorItems = uploadStatusData.filter(item => {
        return item.status === 'error';
    });
    
    // 按上傳日期排序
    errorItems.sort((a, b) => b.scheduledDate - a.scheduledDate);
    
    // 構建 HTML
    let listHTML = '';
    
    if (errorItems.length === 0) {
        listHTML = '<tr><td colspan="4" class="text-center py-3">目前沒有待修正的上傳錯誤</td></tr>';
    } else {
        errorItems.forEach(item => {
            const uploadDateStr = item.actualUploadDate ? formatDateWithWeekday(item.actualUploadDate) : formatDateWithWeekday(item.scheduledDate);
            const daysOverdue = getDaysOverdue(item.actualUploadDate || item.scheduledDate);
            const overdueClass = daysOverdue >= 7 ? 'text-danger' : (daysOverdue >= 3 ? 'text-warning' : '');
            
            // 添加修正時間進度條
            const progressBgColor = isDarkMode ? '#343a40' : '#e9ecef';
            const progressBarColor = daysOverdue >= 7 ? '#dc3545' : (daysOverdue >= 3 ? '#ffc107' : '#28a745');
            const progressPercent = Math.min(100, Math.max(0, Math.round(daysOverdue / 14 * 100))); // 14天為基準
            const progressBar = `
                <div style="height: 4px; background-color: ${progressBgColor}; width: 100%; margin-top: 5px;">
                    <div style="height: 100%; width: ${progressPercent}%; background-color: ${progressBarColor};"></div>
                </div>
            `;
            
            listHTML += `
                <tr>
                    <td>${item.systemName}</td>
                    <td>${uploadDateStr}</td>
                    <td>${item.errorDescription || '未指定'}</td>
                    <td>
                        <span class="badge bg-danger">待修正</span>
                        <div class="${overdueClass} small mt-1">已逾期: ${daysOverdue}天</div>
                        ${progressBar}
                    </td>
                </tr>
            `;
        });
    }
    
    // 更新 DOM
    errorList.innerHTML = listHTML;
}

/**
 * 匯出資料上傳狀態報表
 */
function exportUploadStatusReport() {
    const filteredData = getFilteredUploadData();
    
    // 實際匯出邏輯（示例）
    alert('報表匯出功能尚未實現。實際應用中，這裡應該生成CSV或PDF並下載。');
    
    // 顯示通知
    showNotification('報表匯出功能尚未實現', 'info');
}

/**
 * 獲取隨機錯誤描述（模擬用）
 */
function getRandomErrorDescription() {
    const errors = [
        '資料格式不符合規範',
        '資料內容不完整',
        '資料包含無效值',
        '檔案結構有誤',
        '缺少必要欄位',
        '數據超出預期範圍',
        '編碼格式錯誤',
        '重複記錄',
        '資料與前期不一致',
        '文件損壞'
    ];
    
    return errors[Math.floor(Math.random() * errors.length)];
}

/**
 * 格式化日期為易讀字串
 */
function formatDate(date) {
    if (!date) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}/${month}/${day}`;
}

/**
 * 格式化日期並添加星期幾
 */
function formatDateWithWeekday(date) {
    if (!date) return '';
    
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekday = weekdays[date.getDay()];
    
    return `${formatDate(date)} (${weekday})`;
}

/**
 * 顯示通知消息
 */
function showNotification(message, type = 'info') {
    // 檢查是否深色模式
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    // 創建通知元素
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    
    // 深色模式下調整樣式
    if (isDarkMode) {
        notification.style.backgroundColor = '#343a40';
        notification.style.color = '#f8f9fa';
        notification.style.borderColor = '#495057';
    }
    
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // 添加到頁面
    document.body.appendChild(notification);
    
    // 設置自動關閉
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
} 