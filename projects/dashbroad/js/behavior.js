/**
 * 化學雲分析儀表板 - 使用者行為分析模組
 */

// 使用者行為分析篩選器
let behaviorFilters = {
    dateRange: {
        startDate: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000), // 預設30天前
        endDate: new Date() // 現在
    },
    timeGranularity: 'day',
    userType: 'all',
    actionType: 'all'
};

// 圖表實例
let userActivityRankingChart = null;
let behaviorTimeDistributionChart = null;
let behaviorFlowChart = null;
let featureUsageChart = null;

// 模擬數據
let userBehaviorData = [];
let userHabitsData = [];

/**
 * 初始化使用者行為分析頁籤
 */
document.addEventListener('DOMContentLoaded', function() {
    // 為使用者行為分析頁籤添加事件監聽器
    const behaviorTab = document.getElementById('behavior-tab');
    if (behaviorTab) {
        behaviorTab.addEventListener('shown.bs.tab', function() {
            initBehaviorDashboard();
        });
    }
});

/**
 * 初始化使用者行為分析儀表板
 */
function initBehaviorDashboard() {
    // 生成模擬數據
    generateBehaviorMockData();
    
    // 設置日期選擇器
    initBehaviorDateRangePicker();
    
    // 綁定過濾器事件
    bindBehaviorFilterEvents();
    
    // 初始化深色模式支持
    setupBehaviorDarkModeSupport();
    
    // 更新儀表板
    updateBehaviorDashboard();
}

/**
 * 設置使用者行為儀表板的深色模式支持
 */
function setupBehaviorDarkModeSupport() {
    // 監聽深色模式切換
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            // 延遲執行以確保深色模式已切換
            setTimeout(function() {
                if (document.getElementById('behavior-dashboard').classList.contains('active')) {
                    updateBehaviorStatsCards();
                    updateUserActivityRankingChart();
                    updateBehaviorTimeDistributionChart();
                    updateBehaviorFlowChart();
                    updateFeatureUsageChart();
                    updateUserHabitsTable();
                }
            }, 50);
        });
    }
}

/**
 * 初始化日期範圍選擇器
 */
function initBehaviorDateRangePicker() {
    const dateRangePicker = document.getElementById('behaviorDateRange');
    if (dateRangePicker) {
        flatpickr(dateRangePicker, {
            mode: 'range',
            dateFormat: 'Y-m-d',
            defaultDate: [behaviorFilters.dateRange.startDate, behaviorFilters.dateRange.endDate],
            maxDate: 'today',
            locale: 'zh_tw',
            onChange: function(selectedDates) {
                if (selectedDates.length === 2) {
                    behaviorFilters.dateRange.startDate = selectedDates[0];
                    behaviorFilters.dateRange.endDate = selectedDates[1];
                }
            }
        });
    }
}

/**
 * 綁定使用者行為分析篩選器事件
 */
function bindBehaviorFilterEvents() {
    // 時間粒度選擇
    const timeGranularity = document.getElementById('behaviorTimeGranularity');
    if (timeGranularity) {
        timeGranularity.addEventListener('change', function() {
            behaviorFilters.timeGranularity = this.value;
        });
    }
    
    // 使用者類型選擇
    const userType = document.getElementById('behaviorUserType');
    if (userType) {
        userType.addEventListener('change', function() {
            behaviorFilters.userType = this.value;
        });
    }
    
    // 事件類型選擇
    const actionType = document.getElementById('behaviorActionType');
    if (actionType) {
        actionType.addEventListener('change', function() {
            behaviorFilters.actionType = this.value;
        });
    }
    
    // 套用篩選按鈕
    const applyButton = document.getElementById('applyBehaviorFilters');
    if (applyButton) {
        applyButton.addEventListener('click', function() {
            updateBehaviorDashboard();
        });
    }
    
    // 重置篩選按鈕
    const resetButton = document.getElementById('resetBehaviorFilters');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            resetBehaviorFilters();
        });
    }
    
    // 用戶活躍度排行顯示選項
    const rankingItems = document.querySelectorAll('.dropdown-item[data-value]');
    rankingItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const value = this.getAttribute('data-value');
            const dropdownButton = this.closest('.btn-group').querySelector('.dropdown-toggle');
            dropdownButton.textContent = `顯示: 前${value === 'all' ? '全部' : value + '名'}`;
            
            // 更新活躍度排行圖表
            updateUserActivityRankingChart(value);
            
            // 更新下拉菜單中的激活狀態
            rankingItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // 行為時間分布視圖切換按鈕
    const timeDistButtons = document.querySelectorAll('.chart-controls .btn-group .btn');
    timeDistButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            
            // 更新按鈕激活狀態
            timeDistButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // 更新時間分布圖表
            updateBehaviorTimeDistributionChart(action);
        });
    });
    
    // 行為流程分析視圖切換按鈕
    const flowViewButtons = document.querySelectorAll('.card-header .btn-group [data-view]');
    flowViewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const view = this.getAttribute('data-view');
            
            // 更新按鈕激活狀態
            flowViewButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // 更新流程圖表
            updateBehaviorFlowChart(view);
        });
    });
    
    // 功能使用頻率分組選項
    const featureGroupItems = document.querySelectorAll('.dropdown-item[data-value]');
    featureGroupItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const value = this.getAttribute('data-value');
            const dropdownButton = this.closest('.btn-group').querySelector('.dropdown-toggle');
            
            // 設置按鈕文本
            let groupText = '功能類型';
            if (value === 'userType') groupText = '使用者類型';
            else if (value === 'timeframe') groupText = '時間段';
            
            dropdownButton.textContent = `分組: ${groupText}`;
            
            // 更新功能使用頻率圖表
            updateFeatureUsageChart(value);
            
            // 更新下拉菜單中的激活狀態
            featureGroupItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // 匯出使用者習慣按鈕事件
    const exportHabitsButton = document.getElementById('exportUserHabits');
    if (exportHabitsButton) {
        exportHabitsButton.addEventListener('click', function() {
            exportUserHabitsData();
        });
    }
}

/**
 * 重置行為分析篩選器
 */
function resetBehaviorFilters() {
    // 重置時間範圍
    behaviorFilters.dateRange.startDate = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
    behaviorFilters.dateRange.endDate = new Date();
    
    // 重置時間粒度
    behaviorFilters.timeGranularity = 'day';
    document.getElementById('behaviorTimeGranularity').value = 'day';
    
    // 重置使用者類型
    behaviorFilters.userType = 'all';
    document.getElementById('behaviorUserType').value = 'all';
    
    // 重置事件類型
    behaviorFilters.actionType = 'all';
    document.getElementById('behaviorActionType').value = 'all';
    
    // 重置日期選擇器
    const dateRangePicker = document.getElementById('behaviorDateRange');
    if (dateRangePicker && dateRangePicker._flatpickr) {
        dateRangePicker._flatpickr.setDate([behaviorFilters.dateRange.startDate, behaviorFilters.dateRange.endDate]);
    }
    
    // 更新儀表板
    updateBehaviorDashboard();
}

/**
 * 更新使用者行為分析儀表板
 */
function updateBehaviorDashboard() {
    console.log('更新使用者行為分析儀表板', behaviorFilters);
    
    // 獲取篩選後的數據
    const filteredData = getFilteredBehaviorData();
    
    // 更新概述卡片
    updateBehaviorStatsCards(filteredData);
    
    // 更新使用者活躍度排行圖表
    updateUserActivityRankingChart('10');  // 預設顯示前10名
    
    // 更新使用者行為時間分布圖表
    updateBehaviorTimeDistributionChart('daily');  // 預設顯示每日分布
    
    // 更新使用者行為流程分析圖表
    updateBehaviorFlowChart('common');  // 預設顯示常見流程
    
    // 更新功能使用頻率圖表
    updateFeatureUsageChart('feature');  // 預設按功能類型分組
    
    // 更新使用者習慣表格
    updateUserHabitsTable();
}

/**
 * 更新概述卡片
 */
function updateBehaviorStatsCards() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    const textColor = isDarkMode ? '#e2e8f0' : '#333';
    const labelColor = isDarkMode ? '#a0aec0' : '#718096';
    const trendUpColor = isDarkMode ? '#48bb78' : '#38a169';
    const trendDownColor = isDarkMode ? '#f56565' : '#e53e3e';
    
    // 獲取數據
    const filteredData = getFilteredBehaviorData();
    const activeUsers = getActiveUsersCount(filteredData);
    const previousPeriodUsers = getPreviousPeriodActiveUsers();
    const userChange = activeUsers - previousPeriodUsers;
    const changePercent = previousPeriodUsers ? Math.round((userChange / previousPeriodUsers) * 100) : 100;
    
    // 更新活躍用戶卡片
    const activeUsersCard = document.getElementById('activeUsersCard');
    if (activeUsersCard) {
        const valueElement = activeUsersCard.querySelector('.stat-value');
        if (valueElement) {
            valueElement.textContent = activeUsers;
            valueElement.style.color = textColor;
        }
        
        const changeElement = activeUsersCard.querySelector('.stat-change');
        if (changeElement) {
            const isIncrease = userChange >= 0;
            changeElement.innerHTML = `
                <i class="bi ${isIncrease ? 'bi-arrow-up' : 'bi-arrow-down'}"></i>
                ${Math.abs(changePercent)}%
            `;
            changeElement.style.color = isIncrease ? trendUpColor : trendDownColor;
        }
        
        const labelElements = activeUsersCard.querySelectorAll('.stat-label');
        labelElements.forEach(label => {
            label.style.color = labelColor;
        });
    }
    
    // 同樣的方式更新其他統計卡片
    // 平均會話時間卡片
    const avgSessionTime = getAverageSessionTime(filteredData);
    const prevSessionTime = getPreviousPeriodSessionTime();
    const sessionChange = avgSessionTime - prevSessionTime;
    const sessionChangePercent = prevSessionTime ? Math.round((sessionChange / prevSessionTime) * 100) : 100;
    
    const sessionTimeCard = document.getElementById('sessionTimeCard');
    if (sessionTimeCard) {
        const valueElement = sessionTimeCard.querySelector('.stat-value');
        if (valueElement) {
            valueElement.textContent = `${avgSessionTime} 分鐘`;
            valueElement.style.color = textColor;
        }
        
        const changeElement = sessionTimeCard.querySelector('.stat-change');
        if (changeElement) {
            const isIncrease = sessionChange >= 0;
            changeElement.innerHTML = `
                <i class="bi ${isIncrease ? 'bi-arrow-up' : 'bi-arrow-down'}"></i>
                ${Math.abs(sessionChangePercent)}%
            `;
            changeElement.style.color = isIncrease ? trendUpColor : trendDownColor;
        }
        
        const labelElements = sessionTimeCard.querySelectorAll('.stat-label');
        labelElements.forEach(label => {
            label.style.color = labelColor;
        });
    }
    
    // 熱門功能卡片
    const topFeature = getTopFeature(filteredData);
    
    const topFeatureCard = document.getElementById('topFeatureCard');
    if (topFeatureCard) {
        const valueElement = topFeatureCard.querySelector('.stat-value');
        if (valueElement) {
            valueElement.textContent = topFeature;
            valueElement.style.color = textColor;
        }
        
        const labelElements = topFeatureCard.querySelectorAll('.stat-label');
        labelElements.forEach(label => {
            label.style.color = labelColor;
        });
    }
    
    // 尖峰時段卡片
    const peakHour = getPeakHour(filteredData);
    
    const peakHourCard = document.getElementById('peakHourCard');
    if (peakHourCard) {
        const valueElement = peakHourCard.querySelector('.stat-value');
        if (valueElement) {
            valueElement.textContent = peakHour;
            valueElement.style.color = textColor;
        }
        
        const labelElements = peakHourCard.querySelectorAll('.stat-label');
        labelElements.forEach(label => {
            label.style.color = labelColor;
        });
    }
}

/**
 * 更新使用者活躍度排行圖表
 */
function updateUserActivityRankingChart(limit) {
    // 獲取畫布
    const ctx = document.getElementById('userActivityRankingChart');
    if (!ctx) return;
    
    // 如果圖表已存在則銷毀
    if (userActivityRankingChart) {
        userActivityRankingChart.destroy();
    }
    
    // 獲取使用者活躍度排行數據
    const rankingData = getUserActivityRanking(limit);
    
    // 創建新圖表
    userActivityRankingChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: rankingData.labels,
            datasets: [{
                label: '活躍度分數',
                data: rankingData.data,
                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                borderRadius: 5
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `活躍度分數: ${context.raw}`;
                        },
                        afterLabel: function(context) {
                            const userData = rankingData.userData[context.dataIndex];
                            let tooltipLines = [
                                `登入次數: ${userData.loginCount}`,
                                `平均使用時間: ${userData.avgSessionTime}分鐘`,
                                `主要使用功能: ${userData.topFeature}`
                            ];
                            return tooltipLines;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '活躍度分數'
                    },
                    beginAtZero: true
                },
                y: {
                    title: {
                        display: true,
                        text: '使用者'
                    }
                }
            }
        }
    });
}

/**
 * 更新使用者行為時間分布圖表
 */
function updateBehaviorTimeDistributionChart(viewType) {
    // 獲取畫布
    const ctx = document.getElementById('behaviorTimeDistributionChart');
    if (!ctx) return;
    
    // 如果圖表已存在則銷毀
    if (behaviorTimeDistributionChart) {
        behaviorTimeDistributionChart.destroy();
    }
    
    // 獲取使用者行為時間分布數據
    const distributionData = getBehaviorTimeDistribution(viewType);
    
    // 創建新圖表
    behaviorTimeDistributionChart = new Chart(ctx, {
        type: viewType === 'hourly' ? 'bar' : 'line',
        data: {
            labels: distributionData.labels,
            datasets: distributionData.datasets
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
                        text: viewType === 'hourly' ? '小時' : (viewType === 'weekly' ? '週一至週日' : '日期')
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '活動次數'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

/**
 * 更新使用者行為流程分析圖表
 */
function updateBehaviorFlowChart(viewType) {
    // 由於流程圖較複雜，這裡使用不同的實現方式
    const container = document.getElementById('behaviorFlowChart');
    if (!container) return;
    
    // 清空容器
    container.innerHTML = '';
    
    if (viewType === 'common') {
        // 繪製常見行為流程圖
        renderCommonBehaviorFlowChart(container);
    } else {
        // 繪製用戶分群流程圖
        renderUserSegmentFlowChart(container);
    }
}

/**
 * 繪製常見行為流程圖
 */
function renderCommonBehaviorFlowChart(container) {
    // 獲取常見行為流程數據
    const flowData = getCommonBehaviorFlow();
    
    // 創建流程圖 DOM 結構
    const flowContainer = document.createElement('div');
    flowContainer.className = 'behavior-flow-container';
    flowContainer.style.width = '100%';
    flowContainer.style.height = '100%';
    flowContainer.style.display = 'flex';
    flowContainer.style.justifyContent = 'space-between';
    flowContainer.style.alignItems = 'center';
    flowContainer.style.position = 'relative';
    flowContainer.style.overflow = 'auto';
    
    // 創建流程節點
    const steps = flowData.steps;
    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        
        // 創建步驟容器
        const stepContainer = document.createElement('div');
        stepContainer.className = 'flow-step-column';
        stepContainer.style.display = 'flex';
        stepContainer.style.flexDirection = 'column';
        stepContainer.style.alignItems = 'center';
        stepContainer.style.minWidth = '150px';
        
        // 添加步驟標題
        const stepTitle = document.createElement('div');
        stepTitle.className = 'flow-step-title';
        stepTitle.textContent = `步驟 ${i + 1}`;
        stepTitle.style.fontWeight = 'bold';
        stepTitle.style.marginBottom = '10px';
        stepContainer.appendChild(stepTitle);
        
        // 添加步驟節點
        step.nodes.forEach(node => {
            const nodeElement = document.createElement('div');
            nodeElement.className = 'flow-node';
            nodeElement.style.margin = '5px';
            nodeElement.style.padding = '10px 15px';
            nodeElement.style.borderRadius = '5px';
            nodeElement.style.backgroundColor = 'rgba(54, 162, 235, 0.2)';
            nodeElement.style.border = '1px solid rgba(54, 162, 235, 0.5)';
            nodeElement.style.width = '100%';
            nodeElement.style.textAlign = 'center';
            nodeElement.style.position = 'relative';
            
            // 節點百分比標籤
            nodeElement.innerHTML = `
                <div style="font-weight: bold;">${node.action}</div>
                <div>${node.percentage}%</div>
            `;
            
            stepContainer.appendChild(nodeElement);
        });
        
        flowContainer.appendChild(stepContainer);
        
        // 如果不是最後一個步驟，添加連接箭頭
        if (i < steps.length - 1) {
            const arrowContainer = document.createElement('div');
            arrowContainer.className = 'flow-arrow';
            arrowContainer.style.display = 'flex';
            arrowContainer.style.alignItems = 'center';
            arrowContainer.style.justifyContent = 'center';
            arrowContainer.style.padding = '0 10px';
            
            const arrow = document.createElement('i');
            arrow.className = 'bi bi-arrow-right';
            arrow.style.fontSize = '1.5rem';
            arrow.style.color = 'rgba(54, 162, 235, 0.7)';
            
            arrowContainer.appendChild(arrow);
            flowContainer.appendChild(arrowContainer);
        }
    }
    
    container.appendChild(flowContainer);
    
    // 添加流失率標籤
    const dropoffContainer = document.createElement('div');
    dropoffContainer.className = 'dropoff-info';
    dropoffContainer.style.textAlign = 'center';
    dropoffContainer.style.marginTop = '20px';
    dropoffContainer.innerHTML = `
        <div>一般流程流失率：${flowData.dropoffRate}%</div>
        <div class="text-muted mt-2">大多數用戶在第${flowData.dropoffStep}步後離開</div>
    `;
    
    container.appendChild(dropoffContainer);
}

/**
 * 繪製用戶分群流程圖
 */
function renderUserSegmentFlowChart(container) {
    // 獲取用戶分群數據
    const segmentData = getUserSegmentFlow();
    
    // 創建分群流程圖 DOM 結構
    const segmentContainer = document.createElement('div');
    segmentContainer.className = 'user-segment-container';
    segmentContainer.style.width = '100%';
    segmentContainer.style.height = '100%';
    segmentContainer.style.display = 'flex';
    segmentContainer.style.flexDirection = 'column';
    
    // 添加分群標題
    const segmentTitle = document.createElement('div');
    segmentTitle.className = 'segment-title';
    segmentTitle.textContent = '使用者行為分群';
    segmentTitle.style.fontWeight = 'bold';
    segmentTitle.style.marginBottom = '20px';
    segmentTitle.style.textAlign = 'center';
    segmentContainer.appendChild(segmentTitle);
    
    // 創建分群列表
    const segmentList = document.createElement('div');
    segmentList.className = 'segment-list';
    segmentList.style.display = 'flex';
    segmentList.style.flexDirection = 'column';
    segmentList.style.gap = '15px';
    
    // 添加分群卡片
    segmentData.segments.forEach(segment => {
        const segmentCard = document.createElement('div');
        segmentCard.className = 'segment-card';
        segmentCard.style.padding = '15px';
        segmentCard.style.borderRadius = '8px';
        segmentCard.style.backgroundColor = 'rgba(54, 162, 235, 0.1)';
        segmentCard.style.border = '1px solid rgba(54, 162, 235, 0.3)';
        
        // 分群標題
        const cardHeader = document.createElement('div');
        cardHeader.className = 'd-flex justify-content-between align-items-center mb-3';
        cardHeader.innerHTML = `
            <h6 class="mb-0">${segment.name}</h6>
            <span class="badge bg-primary">${segment.percentage}%</span>
        `;
        segmentCard.appendChild(cardHeader);
        
        // 分群特徵
        const featuresList = document.createElement('ul');
        featuresList.className = 'list-unstyled mb-0';
        segment.features.forEach(feature => {
            const featureItem = document.createElement('li');
            featureItem.className = 'd-flex align-items-center mb-2';
            featureItem.innerHTML = `
                <i class="bi bi-check-circle-fill text-success me-2"></i>
                <span>${feature}</span>
            `;
            featuresList.appendChild(featureItem);
        });
        segmentCard.appendChild(featuresList);
        
        // 常見行為流程
        const flowSequence = document.createElement('div');
        flowSequence.className = 'mt-3';
        flowSequence.innerHTML = `
            <div class="text-muted mb-2">常見行為流程:</div>
            <div class="flow-sequence d-flex align-items-center">
                ${segment.flow.map(step => `<span class="step">${step}</span><i class="bi bi-chevron-right mx-1"></i>`).join('').slice(0, -28)}
            </div>
        `;
        flowSequence.querySelector('.flow-sequence').style.fontSize = '0.85rem';
        flowSequence.querySelector('.flow-sequence').style.overflowX = 'auto';
        
        // 樣式化步驟
        flowSequence.querySelectorAll('.step').forEach(step => {
            step.style.padding = '5px 10px';
            step.style.backgroundColor = 'rgba(54, 162, 235, 0.2)';
            step.style.borderRadius = '4px';
            step.style.whiteSpace = 'nowrap';
        });
        
        segmentCard.appendChild(flowSequence);
        
        segmentList.appendChild(segmentCard);
    });
    
    segmentContainer.appendChild(segmentList);
    container.appendChild(segmentContainer);
}

/**
 * 更新功能使用頻率圖表
 */
function updateFeatureUsageChart(groupBy) {
    // 獲取畫布
    const ctx = document.getElementById('featureUsageChart');
    if (!ctx) return;
    
    // 如果圖表已存在則銷毀
    if (featureUsageChart) {
        featureUsageChart.destroy();
    }
    
    // 獲取功能使用頻率數據
    const usageData = getFeatureUsageData(groupBy);
    
    // 創建新圖表
    featureUsageChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: usageData.labels,
            datasets: usageData.datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw}次`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: groupBy === 'feature' ? '功能' : (groupBy === 'userType' ? '使用者類型' : '時間段')
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '使用次數'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

/**
 * 更新使用者習慣表格
 */
function updateUserHabitsTable() {
    const userHabitsTable = document.getElementById('userHabitsTable');
    if (!userHabitsTable) return;
    
    const tableBody = userHabitsTable.querySelector('tbody');
    if (!tableBody) return;
    
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    // 清空現有內容
    tableBody.innerHTML = '';
    
    // 獲取數據
    const filteredData = getFilteredUserHabitsData();
    
    if (filteredData.length === 0) {
        // 無數據時顯示提示
        const noDataRow = document.createElement('tr');
        noDataRow.innerHTML = `<td colspan="6" class="text-center py-3">沒有符合條件的數據</td>`;
        tableBody.appendChild(noDataRow);
        return;
    }
    
    // 添加使用者習慣數據到表格
    filteredData.forEach(habit => {
        const row = document.createElement('tr');
        
        // 設置行背景色 (深色模式下)
        if (isDarkMode) {
            row.style.backgroundColor = '#2d3748';
            row.style.color = '#e2e8f0';
        }
        
        row.innerHTML = `
            <td>${habit.username}</td>
            <td>${habit.role}</td>
            <td>${habit.preferredTime}</td>
            <td>${habit.topFeature}</td>
            <td>${habit.frequency}</td>
            <td>${habit.behaviorPattern}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

/**
 * 获取过滤后的行为数据
 */
function getFilteredBehaviorData() {
    return userBehaviorData.filter(data => {
        // 时间范围过滤
        const actionTime = new Date(data.timestamp);
        const startTime = new Date(behaviorFilters.dateRange.startDate);
        const endTime = new Date(behaviorFilters.dateRange.endDate);
        endTime.setHours(23, 59, 59, 999); // 设置为当天结束
        
        if (actionTime < startTime || actionTime > endTime) {
            return false;
        }
        
        // 用户类型过滤
        if (behaviorFilters.userType !== 'all' && data.userType !== behaviorFilters.userType) {
            return false;
        }
        
        // 行为类型过滤
        if (behaviorFilters.actionType !== 'all' && data.actionType !== behaviorFilters.actionType) {
            return false;
        }
        
        return true;
    });
}

/**
 * 获取过滤后的用户习惯数据
 */
function getFilteredUserHabitsData() {
    return userHabitsData.filter(user => {
        // 用户类型过滤
        if (behaviorFilters.userType !== 'all' && user.userType !== behaviorFilters.userType) {
            return false;
        }
        
        return true;
    });
}

/**
 * 获取活跃用户数量
 */
function getActiveUsersCount(filteredData) {
    const uniqueUsers = new Set();
    
    filteredData.forEach(data => {
        uniqueUsers.add(data.userId);
    });
    
    return uniqueUsers.size;
}

/**
 * 获取上一时间段的活跃用户数量
 */
function getPreviousPeriodActiveUsers() {
    // 计算上一个时间段的日期范围
    const currentStartDate = new Date(behaviorFilters.dateRange.startDate);
    const currentEndDate = new Date(behaviorFilters.dateRange.endDate);
    const daysDiff = Math.ceil((currentEndDate - currentStartDate) / (1000 * 60 * 60 * 24));
    
    const previousStartDate = new Date(currentStartDate);
    previousStartDate.setDate(previousStartDate.getDate() - daysDiff);
    
    const previousEndDate = new Date(currentStartDate);
    previousEndDate.setDate(previousEndDate.getDate() - 1);
    
    // 过滤上一时间段的数据
    const previousPeriodData = userBehaviorData.filter(data => {
        const actionTime = new Date(data.timestamp);
        return actionTime >= previousStartDate && actionTime <= previousEndDate;
    });
    
    // 计算唯一用户数
    const uniqueUsers = new Set();
    previousPeriodData.forEach(data => {
        uniqueUsers.add(data.userId);
    });
    
    return uniqueUsers.size;
}

/**
 * 获取平均会话时长（分钟）
 */
function getAverageSessionTime(filteredData) {
    // 按用户和会话分组
    const sessions = {};
    
    filteredData.forEach(data => {
        if (!sessions[data.userId]) {
            sessions[data.userId] = {};
        }
        
        if (!sessions[data.userId][data.sessionId]) {
            sessions[data.userId][data.sessionId] = {
                start: new Date(data.timestamp),
                end: new Date(data.timestamp),
                duration: 0
            };
        } else {
            const session = sessions[data.userId][data.sessionId];
            const actionTime = new Date(data.timestamp);
            
            if (actionTime < session.start) {
                session.start = actionTime;
            }
            
            if (actionTime > session.end) {
                session.end = actionTime;
            }
        }
    });
    
    // 计算每个会话的持续时间
    let totalDuration = 0;
    let sessionCount = 0;
    
    for (const userId in sessions) {
        for (const sessionId in sessions[userId]) {
            const session = sessions[userId][sessionId];
            session.duration = (session.end - session.start) / (1000 * 60); // 转换为分钟
            
            // 过滤掉异常短的会话（可能是刷新页面）
            if (session.duration >= 1) {
                totalDuration += session.duration;
                sessionCount++;
            }
        }
    }
    
    return sessionCount > 0 ? Math.round(totalDuration / sessionCount) : 0;
}

/**
 * 获取上一时间段的平均会话时长
 */
function getPreviousPeriodSessionTime() {
    // 计算上一个时间段的日期范围
    const currentStartDate = new Date(behaviorFilters.dateRange.startDate);
    const currentEndDate = new Date(behaviorFilters.dateRange.endDate);
    const daysDiff = Math.ceil((currentEndDate - currentStartDate) / (1000 * 60 * 60 * 24));
    
    const previousStartDate = new Date(currentStartDate);
    previousStartDate.setDate(previousStartDate.getDate() - daysDiff);
    
    const previousEndDate = new Date(currentStartDate);
    previousEndDate.setDate(previousEndDate.getDate() - 1);
    
    // 过滤上一时间段的数据
    const previousPeriodData = userBehaviorData.filter(data => {
        const actionTime = new Date(data.timestamp);
        return actionTime >= previousStartDate && actionTime <= previousEndDate;
    });
    
    // 使用相同的平均会话时长计算方法
    return getAverageSessionTime(previousPeriodData);
}

/**
 * 获取最常用功能
 */
function getTopFeature(filteredData) {
    // 统计每个功能的使用次数
    const featureCounts = {};
    
    filteredData.forEach(data => {
        if (!featureCounts[data.actionType]) {
            featureCounts[data.actionType] = 0;
        }
        
        featureCounts[data.actionType]++;
    });
    
    // 找出使用次数最多的功能
    let topFeature = { name: '无数据', count: 0 };
    
    for (const feature in featureCounts) {
        if (featureCounts[feature] > topFeature.count) {
            // 转换功能代码为可读文本
            let featureName = feature;
            switch (feature) {
                case 'login':
                    featureName = '登入';
                    break;
                case 'search':
                    featureName = '搜尋';
                    break;
                case 'query':
                    featureName = '查詢';
                    break;
                case 'report':
                    featureName = '報表';
                    break;
                case 'upload':
                    featureName = '上傳';
                    break;
                case 'download':
                    featureName = '下載';
                    break;
                case 'edit':
                    featureName = '編輯';
                    break;
            }
            
            topFeature = {
                name: featureName,
                count: featureCounts[feature]
            };
        }
    }
    
    return topFeature;
}

/**
 * 获取使用高峰时段
 */
function getPeakHour(filteredData) {
    // 按小时统计用户数
    const hourlyUsers = {};
    
    // 初始化每小时的计数器
    for (let i = 0; i < 24; i++) {
        const hour = i < 10 ? `0${i}` : `${i}`;
        hourlyUsers[`${hour}:00`] = { count: 0, uniqueUsers: new Set() };
    }
    
    // 统计每小时的唯一用户数
    filteredData.forEach(data => {
        const date = new Date(data.timestamp);
        const hour = date.getHours();
        const hourKey = hour < 10 ? `0${hour}:00` : `${hour}:00`;
        
        hourlyUsers[hourKey].uniqueUsers.add(data.userId);
    });
    
    // 计算每小时的用户数
    for (const hour in hourlyUsers) {
        hourlyUsers[hour].count = hourlyUsers[hour].uniqueUsers.size;
    }
    
    // 找出用户数最多的时段
    let peakHour = { hour: '无数据', users: 0 };
    
    for (const hour in hourlyUsers) {
        if (hourlyUsers[hour].count > peakHour.users) {
            const hourNum = parseInt(hour.split(':')[0]);
            const nextHour = (hourNum + 1) % 24;
            const nextHourStr = nextHour < 10 ? `0${nextHour}:00` : `${nextHour}:00`;
            
            peakHour = {
                hour: `${hour}-${nextHourStr}`,
                users: hourlyUsers[hour].count
            };
        }
    }
    
    return peakHour;
}

/**
 * 获取用户活跃度排行数据
 */
function getUserActivityRanking(limit) {
    // 获取过滤后的数据
    const filteredData = getFilteredBehaviorData();
    
    // 按用户分组并计算活跃度
    const userActivity = {};
    
    filteredData.forEach(data => {
        if (!userActivity[data.userId]) {
            userActivity[data.userId] = {
                userId: data.userId,
                username: data.username,
                userType: data.userType,
                loginCount: 0,
                actionCount: 0,
                uniqueDays: new Set(),
                sessionTime: 0,
                sessionCount: 0,
                featureCounts: {},
                activityScore: 0
            };
        }
        
        const user = userActivity[data.userId];
        
        // 统计登录次数
        if (data.actionType === 'login') {
            user.loginCount++;
        }
        
        // 统计活动次数
        user.actionCount++;
        
        // 统计活跃天数
        const dateStr = new Date(data.timestamp).toDateString();
        user.uniqueDays.add(dateStr);
        
        // 统计功能使用
        if (!user.featureCounts[data.actionType]) {
            user.featureCounts[data.actionType] = 0;
        }
        user.featureCounts[data.actionType]++;
    });
    
    // 计算活跃度分数（基于登录次数、活动次数和活跃天数）
    for (const userId in userActivity) {
        const user = userActivity[userId];
        
        // 加权计算活跃度分数
        const loginWeight = 5;
        const actionWeight = 1;
        const daysWeight = 10;
        
        user.activityScore = Math.round(
            (user.loginCount * loginWeight) +
            (user.actionCount * actionWeight) +
            (user.uniqueDays.size * daysWeight)
        );
        
        // 计算平均会话时间（通过 userHabitsData 获取）
        const habitData = userHabitsData.find(habit => habit.userId === userId);
        if (habitData) {
            user.avgSessionTime = habitData.avgSessionTime;
        } else {
            user.avgSessionTime = 0;
        }
        
        // 获取最常用功能
        let topFeatureCount = 0;
        let topFeature = '';
        
        for (const feature in user.featureCounts) {
            if (user.featureCounts[feature] > topFeatureCount) {
                topFeatureCount = user.featureCounts[feature];
                topFeature = feature;
            }
        }
        
        // 转换功能代码为可读文本
        switch (topFeature) {
            case 'login':
                user.topFeature = '登入';
                break;
            case 'search':
                user.topFeature = '搜尋';
                break;
            case 'query':
                user.topFeature = '查詢';
                break;
            case 'report':
                user.topFeature = '報表';
                break;
            case 'upload':
                user.topFeature = '上傳';
                break;
            case 'download':
                user.topFeature = '下載';
                break;
            case 'edit':
                user.topFeature = '編輯';
                break;
            default:
                user.topFeature = topFeature;
        }
    }
    
    // 转换为数组并按活跃度排序
    const sortedUsers = Object.values(userActivity).sort((a, b) => b.activityScore - a.activityScore);
    
    // 限制显示数量
    const limitNum = limit === 'all' ? sortedUsers.length : parseInt(limit);
    const topUsers = sortedUsers.slice(0, limitNum);
    
    // 准备图表数据
    const labels = topUsers.map(user => user.username);
    const data = topUsers.map(user => user.activityScore);
    const userData = topUsers.map(user => ({
        loginCount: user.loginCount,
        avgSessionTime: user.avgSessionTime,
        topFeature: user.topFeature
    }));
    
    return {
        labels,
        data,
        userData
    };
}

/**
 * 获取行为时间分布数据
 */
function getBehaviorTimeDistribution(viewType) {
    // 获取过滤后的数据
    const filteredData = getFilteredBehaviorData();
    
    if (viewType === 'hourly') {
        // 按小时分组
        const hourlyData = {};
        const actionTypes = new Set();
        
        // 初始化每小时的数据
        for (let i = 0; i < 24; i++) {
            const hour = i < 10 ? `0${i}` : `${i}`;
            hourlyData[hour] = {};
        }
        
        // 统计每种行为类型在每小时的次数
        filteredData.forEach(data => {
            const hour = new Date(data.timestamp).getHours();
            const hourStr = hour < 10 ? `0${hour}` : `${hour}`;
            const actionType = data.actionType;
            
            actionTypes.add(actionType);
            
            if (!hourlyData[hourStr][actionType]) {
                hourlyData[hourStr][actionType] = 0;
            }
            
            hourlyData[hourStr][actionType]++;
        });
        
        // 转换为图表数据集
        const datasets = [];
        const actionTypeArray = Array.from(actionTypes);
        
        actionTypeArray.forEach(actionType => {
            // 转换行为类型代码为可读文本
            let actionLabel = actionType;
            switch (actionType) {
                case 'login':
                    actionLabel = '登入';
                    break;
                case 'search':
                    actionLabel = '搜尋';
                    break;
                case 'query':
                    actionLabel = '查詢';
                    break;
                case 'report':
                    actionLabel = '報表';
                    break;
                case 'upload':
                    actionLabel = '上傳';
                    break;
                case 'download':
                    actionLabel = '下載';
                    break;
                case 'edit':
                    actionLabel = '編輯';
                    break;
            }
            
            const dataset = {
                label: actionLabel,
                data: [],
                backgroundColor: getRandomColor(0.7)
            };
            
            for (let i = 0; i < 24; i++) {
                const hour = i < 10 ? `0${i}` : `${i}`;
                dataset.data.push(hourlyData[hour][actionType] || 0);
            }
            
            datasets.push(dataset);
        });
        
        // 准备标签（小时）
        const labels = Array.from({ length: 24 }, (_, i) => {
            const hour = i < 10 ? `0${i}` : `${i}`;
            return `${hour}:00`;
        });
        
        return { labels, datasets };
        
    } else if (viewType === 'weekly') {
        // 按星期分组
        const weekdayData = {};
        const actionTypes = new Set();
        
        // 初始化每个星期的数据
        const weekdays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
        weekdays.forEach(day => {
            weekdayData[day] = {};
        });
        
        // 统计每种行为类型在每个星期的次数
        filteredData.forEach(data => {
            const weekday = weekdays[new Date(data.timestamp).getDay()];
            const actionType = data.actionType;
            
            actionTypes.add(actionType);
            
            if (!weekdayData[weekday][actionType]) {
                weekdayData[weekday][actionType] = 0;
            }
            
            weekdayData[weekday][actionType]++;
        });
        
        // 转换为图表数据集
        const datasets = [];
        const actionTypeArray = Array.from(actionTypes);
        
        actionTypeArray.forEach(actionType => {
            // 转换行为类型代码为可读文本
            let actionLabel = actionType;
            switch (actionType) {
                case 'login':
                    actionLabel = '登入';
                    break;
                case 'search':
                    actionLabel = '搜尋';
                    break;
                case 'query':
                    actionLabel = '查詢';
                    break;
                case 'report':
                    actionLabel = '報表';
                    break;
                case 'upload':
                    actionLabel = '上傳';
                    break;
                case 'download':
                    actionLabel = '下載';
                    break;
                case 'edit':
                    actionLabel = '編輯';
                    break;
            }
            
            const dataset = {
                label: actionLabel,
                data: weekdays.map(day => weekdayData[day][actionType] || 0),
                borderColor: getRandomColor(1),
                backgroundColor: getRandomColor(0.2),
                tension: 0.3,
                fill: false
            };
            
            datasets.push(dataset);
        });
        
        return { labels: weekdays, datasets };
        
    } else {
        // 按日期分组（默认）
        const dailyData = {};
        const actionTypes = new Set();
        
        // 计算日期范围
        const startDate = new Date(behaviorFilters.dateRange.startDate);
        const endDate = new Date(behaviorFilters.dateRange.endDate);
        const dateRange = [];
        
        // 生成日期范围数组
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = formatDate(d);
            dateRange.push(dateStr);
            dailyData[dateStr] = {};
        }
        
        // 统计每种行为类型在每天的次数
        filteredData.forEach(data => {
            const dateStr = formatDate(new Date(data.timestamp));
            const actionType = data.actionType;
            
            actionTypes.add(actionType);
            
            if (dailyData[dateStr]) {
                if (!dailyData[dateStr][actionType]) {
                    dailyData[dateStr][actionType] = 0;
                }
                
                dailyData[dateStr][actionType]++;
            }
        });
        
        // 转换为图表数据集
        const datasets = [];
        const actionTypeArray = Array.from(actionTypes);
        
        actionTypeArray.forEach(actionType => {
            // 转换行为类型代码为可读文本
            let actionLabel = actionType;
            switch (actionType) {
                case 'login':
                    actionLabel = '登入';
                    break;
                case 'search':
                    actionLabel = '搜尋';
                    break;
                case 'query':
                    actionLabel = '查詢';
                    break;
                case 'report':
                    actionLabel = '報表';
                    break;
                case 'upload':
                    actionLabel = '上傳';
                    break;
                case 'download':
                    actionLabel = '下載';
                    break;
                case 'edit':
                    actionLabel = '編輯';
                    break;
            }
            
            const dataset = {
                label: actionLabel,
                data: dateRange.map(date => dailyData[date][actionType] || 0),
                borderColor: getRandomColor(1),
                backgroundColor: getRandomColor(0.2),
                tension: 0.3,
                fill: false
            };
            
            datasets.push(dataset);
        });
        
        return { labels: dateRange, datasets };
    }
}

/**
 * 获取常见行为流程数据
 */
function getCommonBehaviorFlow() {
    // 模拟常见行为流程数据
    // 实际应用中应基于会话分析计算
    return {
        steps: [
            {
                nodes: [
                    { action: '登入', percentage: 100 }
                ]
            },
            {
                nodes: [
                    { action: '查詢', percentage: 65 },
                    { action: '搜尋', percentage: 25 },
                    { action: '報表', percentage: 10 }
                ]
            },
            {
                nodes: [
                    { action: '查看詳情', percentage: 55 },
                    { action: '下載', percentage: 30 },
                    { action: '編輯', percentage: 15 }
                ]
            },
            {
                nodes: [
                    { action: '上傳', percentage: 40 },
                    { action: '匯出', percentage: 35 },
                    { action: '返回', percentage: 25 }
                ]
            }
        ],
        dropoffRate: 35,
        dropoffStep: 3
    };
}

/**
 * 获取用户分群流程数据
 */
function getUserSegmentFlow() {
    // 模拟用户分群数据
    return {
        segments: [
            {
                name: '重度查詢使用者',
                percentage: 35,
                features: [
                    '平均每日登入次數：3-5次',
                    '平均會話時長：45分鐘',
                    '頻繁使用查詢和搜尋功能',
                    '工作日上午10-11點是最活躍時段'
                ],
                flow: ['登入', '查詢', '查看詳情', '下載', '查詢', '登出']
            },
            {
                name: '報表分析型使用者',
                percentage: 25,
                features: [
                    '平均每週登入次數：8-10次',
                    '平均會話時長：30分鐘',
                    '主要使用報表和匯出功能',
                    '周末和工作日都有使用記錄'
                ],
                flow: ['登入', '報表', '設定篩選條件', '匯出', '登出']
            },
            {
                name: '資料維護型使用者',
                percentage: 20,
                features: [
                    '定期登入系統，平均每2天一次',
                    '平均會話時長：60分鐘以上',
                    '大量使用編輯和上傳功能',
                    '工作日下午是最活躍時段'
                ],
                flow: ['登入', '搜尋', '編輯', '上傳', '編輯', '登出']
            },
            {
                name: '臨時查閱型使用者',
                percentage: 20,
                features: [
                    '不規律登入，平均每週1-2次',
                    '平均會話時長：15分鐘',
                    '主要使用查詢和查看詳情功能',
                    '各時段分布較均勻'
                ],
                flow: ['登入', '查詢', '查看詳情', '返回', '登出']
            }
        ]
    };
}

/**
 * 获取功能使用频率数据
 */
function getFeatureUsageData(groupBy) {
    // 获取过滤后的数据
    const filteredData = getFilteredBehaviorData();
    
    if (groupBy === 'feature') {
        // 按功能类型分组
        const featureCounts = {};
        
        // 统计每种功能的使用次数
        filteredData.forEach(data => {
            if (!featureCounts[data.actionType]) {
                featureCounts[data.actionType] = 0;
            }
            
            featureCounts[data.actionType]++;
        });
        
        // 转换为图表数据
        const labels = [];
        const data = [];
        
        for (const feature in featureCounts) {
            // 转换功能代码为可读文本
            let featureLabel = feature;
            switch (feature) {
                case 'login':
                    featureLabel = '登入';
                    break;
                case 'search':
                    featureLabel = '搜尋';
                    break;
                case 'query':
                    featureLabel = '查詢';
                    break;
                case 'report':
                    featureLabel = '報表';
                    break;
                case 'upload':
                    featureLabel = '上傳';
                    break;
                case 'download':
                    featureLabel = '下載';
                    break;
                case 'edit':
                    featureLabel = '編輯';
                    break;
            }
            
            labels.push(featureLabel);
            data.push(featureCounts[feature]);
        }
        
        return {
            labels,
            datasets: [{
                label: '使用次數',
                data,
                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                borderRadius: 5
            }]
        };
        
    } else if (groupBy === 'userType') {
        // 按用户类型分组
        const userTypeData = {};
        const actionTypes = new Set();
        
        // 初始化用户类型数据
        const userTypes = ['管理員', '一般用戶', '消防單位', '經濟部', '勞動部', '環境部'];
        userTypes.forEach(type => {
            userTypeData[type] = {};
        });
        
        // 用户类型映射
        const userTypeMap = {
            'admin': '管理員',
            'normal': '一般用戶',
            'fire': '消防單位',
            'economic': '經濟部',
            'labor': '勞動部',
            'environment': '環境部'
        };
        
        // 统计每种用户类型的功能使用次数
        filteredData.forEach(data => {
            const userType = userTypeMap[data.userType] || data.userType;
            const actionType = data.actionType;
            
            actionTypes.add(actionType);
            
            if (userTypeData[userType]) {
                if (!userTypeData[userType][actionType]) {
                    userTypeData[userType][actionType] = 0;
                }
                
                userTypeData[userType][actionType]++;
            }
        });
        
        // 转换为图表数据集
        const datasets = [];
        const actionTypeArray = Array.from(actionTypes);
        
        actionTypeArray.forEach(actionType => {
            // 转换行为类型代码为可读文本
            let actionLabel = actionType;
            switch (actionType) {
                case 'login':
                    actionLabel = '登入';
                    break;
                case 'search':
                    actionLabel = '搜尋';
                    break;
                case 'query':
                    actionLabel = '查詢';
                    break;
                case 'report':
                    actionLabel = '報表';
                    break;
                case 'upload':
                    actionLabel = '上傳';
                    break;
                case 'download':
                    actionLabel = '下載';
                    break;
                case 'edit':
                    actionLabel = '編輯';
                    break;
            }
            
            const dataset = {
                label: actionLabel,
                data: userTypes.map(type => userTypeData[type][actionType] || 0),
                backgroundColor: getRandomColor(0.7),
                borderColor: getRandomColor(1),
                borderWidth: 1
            };
            
            datasets.push(dataset);
        });
        
        return { labels: userTypes, datasets };
        
    } else {
        // 按时间段分组
        const timeFrames = ['早上 (6-10點)', '上午 (10-12點)', '下午 (12-18點)', '晚上 (18-22點)', '深夜 (22-6點)'];
        const timeFrameData = {};
        const actionTypes = new Set();
        
        // 初始化时间段数据
        timeFrames.forEach(frame => {
            timeFrameData[frame] = {};
        });
        
        // 时间段判断函数
        function getTimeFrame(hour) {
            if (hour >= 6 && hour < 10) return '早上 (6-10點)';
            if (hour >= 10 && hour < 12) return '上午 (10-12點)';
            if (hour >= 12 && hour < 18) return '下午 (12-18點)';
            if (hour >= 18 && hour < 22) return '晚上 (18-22點)';
            return '深夜 (22-6點)';
        }
        
        // 统计每个时间段的功能使用次数
        filteredData.forEach(data => {
            const hour = new Date(data.timestamp).getHours();
            const timeFrame = getTimeFrame(hour);
            const actionType = data.actionType;
            
            actionTypes.add(actionType);
            
            if (!timeFrameData[timeFrame][actionType]) {
                timeFrameData[timeFrame][actionType] = 0;
            }
            
            timeFrameData[timeFrame][actionType]++;
        });
        
        // 转换为图表数据集
        const datasets = [];
        const actionTypeArray = Array.from(actionTypes);
        
        actionTypeArray.forEach(actionType => {
            // 转换行为类型代码为可读文本
            let actionLabel = actionType;
            switch (actionType) {
                case 'login':
                    actionLabel = '登入';
                    break;
                case 'search':
                    actionLabel = '搜尋';
                    break;
                case 'query':
                    actionLabel = '查詢';
                    break;
                case 'report':
                    actionLabel = '報表';
                    break;
                case 'upload':
                    actionLabel = '上傳';
                    break;
                case 'download':
                    actionLabel = '下載';
                    break;
                case 'edit':
                    actionLabel = '編輯';
                    break;
            }
            
            const dataset = {
                label: actionLabel,
                data: timeFrames.map(frame => timeFrameData[frame][actionType] || 0),
                backgroundColor: getRandomColor(0.7),
                borderColor: getRandomColor(1),
                borderWidth: 1
            };
            
            datasets.push(dataset);
        });
        
        return { labels: timeFrames, datasets };
    }
}

/**
 * 导出用户习惯数据
 */
function exportUserHabitsData() {
    // 获取过滤后的用户习惯数据
    const habitsData = getFilteredUserHabitsData();
    
    // 在实际应用中，这里应该处理数据导出逻辑
    // 例如转换为CSV文件并触发下载
    console.log('导出用户习惯数据', habitsData);
    
    // 显示成功消息
    alert('用戶習慣數據已成功匯出');
}

/**
 * 格式化日期为 YYYY-MM-DD 格式
 */
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

/**
 * 生成随机颜色
 */
function getRandomColor(alpha) {
    const colors = [
        `rgba(54, 162, 235, ${alpha})`,
        `rgba(255, 99, 132, ${alpha})`,
        `rgba(75, 192, 192, ${alpha})`,
        `rgba(255, 206, 86, ${alpha})`,
        `rgba(153, 102, 255, ${alpha})`,
        `rgba(255, 159, 64, ${alpha})`,
        `rgba(199, 199, 199, ${alpha})`,
        `rgba(83, 102, 255, ${alpha})`,
        `rgba(40, 167, 69, ${alpha})`,
        `rgba(220, 53, 69, ${alpha})`
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * 生成使用者行為模擬數據
 */
function generateBehaviorMockData() {
    userBehaviorData = [];
    userHabitsData = [];
    
    // 設置時間範圍（過去90天）
    const now = new Date();
    const startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    
    // 模擬使用者列表
    const users = [
        { userId: 'user1', username: '陳管理員', userType: 'admin' },
        { userId: 'user2', username: '張分析師', userType: 'normal' },
        { userId: 'user3', username: '王操作員', userType: 'normal' },
        { userId: 'user4', username: '林工程師', userType: 'normal' },
        { userId: 'user5', username: '消防科長', userType: 'fire' },
        { userId: 'user6', username: '消防隊員A', userType: 'fire' },
        { userId: 'user7', username: '消防隊員B', userType: 'fire' },
        { userId: 'user8', username: '經濟部專員', userType: 'economic' },
        { userId: 'user9', username: '勞動部專員', userType: 'labor' },
        { userId: 'user10', username: '環保署專員', userType: 'environment' },
        { userId: 'user11', username: '研究員A', userType: 'normal' },
        { userId: 'user12', username: '研究員B', userType: 'normal' },
        { userId: 'user13', username: '系統管理員', userType: 'admin' },
        { userId: 'user14', username: '資料分析師', userType: 'normal' },
        { userId: 'user15', username: '衛福部專員', userType: 'normal' }
    ];
    
    // 模擬行爲類型
    const actionTypes = ['login', 'search', 'query', 'report', 'upload', 'download', 'edit'];
    
    // 為每個使用者生成行為數據
    users.forEach(user => {
        // 設置使用者活躍程度（1-5，5為最活躍）
        const activityLevel = Math.floor(Math.random() * 5) + 1;
        
        // 設置使用者的行為模式偏好
        const behaviorPreferences = generateBehaviorPreferences(actionTypes);
        
        // 決定使用者活躍的日期
        const activeDays = generateActiveDays(startDate, now, activityLevel);
        
        // 為每個活躍日期生成行為
        activeDays.forEach(day => {
            // 決定當天的會話數量（1-3）
            const sessionsCount = Math.min(Math.floor(Math.random() * activityLevel) + 1, 3);
            
            for (let i = 0; i < sessionsCount; i++) {
                // 生成會話ID
                const sessionId = `session_${user.userId}_${day.getTime()}_${i}`;
                
                // 決定會話開始時間（考慮使用者的偏好時段）
                const sessionStartHour = getPreferredHour(user.userId);
                const sessionStart = new Date(day);
                sessionStart.setHours(sessionStartHour, Math.floor(Math.random() * 60), 0, 0);
                
                // 決定會話持續時間（10-60分鐘，根據活躍程度調整）
                const sessionDuration = Math.floor(Math.random() * 50 * (activityLevel / 3)) + 10;
                
                // 決定會話中的行為數量（3-15，根據會話時長和活躍程度調整）
                const actionsCount = Math.floor(sessionDuration / 5) + Math.floor(Math.random() * activityLevel);
                
                // 生成會話中的行為序列
                let prevActionTime = new Date(sessionStart);
                
                // 第一個行為始終是登入
                userBehaviorData.push({
                    userId: user.userId,
                    username: user.username,
                    userType: user.userType,
                    sessionId: sessionId,
                    actionType: 'login',
                    timestamp: new Date(prevActionTime),
                    details: '使用者登入系統'
                });
                
                // 更新時間（登入後1-3分鐘內下一個操作）
                prevActionTime = new Date(prevActionTime.getTime() + (Math.floor(Math.random() * 2) + 1) * 60 * 1000);
                
                // 生成其餘行為
                for (let j = 0; j < actionsCount; j++) {
                    // 根據使用者偏好選擇行為類型（排除登入）
                    const actionType = selectActionBasedOnPreferences(behaviorPreferences);
                    
                    // 更新時間（上一個操作後1-5分鐘）
                    prevActionTime = new Date(prevActionTime.getTime() + (Math.floor(Math.random() * 4) + 1) * 60 * 1000);
                    
                    // 確保不超過會話結束時間
                    const sessionEndTime = new Date(sessionStart.getTime() + sessionDuration * 60 * 1000);
                    if (prevActionTime > sessionEndTime) {
                        break;
                    }
                    
                    // 生成行為詳情
                    let details = '';
                    switch (actionType) {
                        case 'search':
                            details = '搜尋資料';
                            break;
                        case 'query':
                            details = '查詢化學物質資訊';
                            break;
                        case 'report':
                            details = '生成報表';
                            break;
                        case 'upload':
                            details = '上傳數據';
                            break;
                        case 'download':
                            details = '下載檔案';
                            break;
                        case 'edit':
                            details = '編輯記錄';
                            break;
                    }
                    
                    // 添加行為記錄
                    userBehaviorData.push({
                        userId: user.userId,
                        username: user.username,
                        userType: user.userType,
                        sessionId: sessionId,
                        actionType: actionType,
                        timestamp: new Date(prevActionTime),
                        details: details
                    });
                }
            }
        });
        
        // 生成使用者習慣數據
        generateUserHabitData(user);
    });
    
    // 按時間排序
    userBehaviorData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

/**
 * 生成使用者行為偏好
 */
function generateBehaviorPreferences(actionTypes) {
    const preferences = {};
    
    // 為每種行為類型分配權重
    actionTypes.forEach(type => {
        if (type !== 'login') { // 登入不作為偏好，因為每個會話都需要
            preferences[type] = Math.floor(Math.random() * 10) + 1; // 1-10的權重
        }
    });
    
    // 隨機選一種行為作為主要偏好（權重加倍）
    const mainPreference = actionTypes[Math.floor(Math.random() * (actionTypes.length - 1)) + 1]; // 排除登入
    preferences[mainPreference] = preferences[mainPreference] * 2;
    
    return preferences;
}

/**
 * 基於權重選擇行為類型
 */
function selectActionBasedOnPreferences(preferences) {
    // 計算權重總和
    let totalWeight = 0;
    for (const type in preferences) {
        totalWeight += preferences[type];
    }
    
    // 隨機選擇基於權重
    let random = Math.random() * totalWeight;
    let cumulativeWeight = 0;
    
    for (const type in preferences) {
        cumulativeWeight += preferences[type];
        if (random < cumulativeWeight) {
            return type;
        }
    }
    
    // 預設返回查詢（不應該到達這裡）
    return 'query';
}

/**
 * 生成活躍日期
 */
function generateActiveDays(startDate, endDate, activityLevel) {
    const activeDays = [];
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    // 根據活躍程度決定活躍天數比例
    const activeRatio = activityLevel * 0.15; // 活躍程度為5的使用者約75%的天數有活動
    const expectedActiveDays = Math.floor(totalDays * activeRatio);
    
    // 隨機選擇活躍天數
    const selectedDays = new Set();
    while (selectedDays.size < expectedActiveDays) {
        const randomDay = Math.floor(Math.random() * totalDays);
        selectedDays.add(randomDay);
    }
    
    // 轉換為日期
    selectedDays.forEach(day => {
        const date = new Date(startDate);
        date.setDate(date.getDate() + day);
        activeDays.push(new Date(date));
    });
    
    return activeDays;
}

/**
 * 獲取使用者偏好時段
 */
function getPreferredHour(userId) {
    // 針對不同使用者類型設置不同的偏好時段
    const userIdNum = parseInt(userId.replace('user', ''));
    
    if (userIdNum % 3 === 0) {
        // 偏好早上
        return 8 + Math.floor(Math.random() * 3);
    } else if (userIdNum % 3 === 1) {
        // 偏好下午
        return 13 + Math.floor(Math.random() * 4);
    } else {
        // 偏好晚上
        return 18 + Math.floor(Math.random() * 3);
    }
}

/**
 * 生成使用者習慣數據
 */
function generateUserHabitData(user) {
    // 過濾該使用者的所有行為
    const userActions = userBehaviorData.filter(data => data.userId === user.userId);
    
    // 計算平均會話時長
    const sessions = {};
    
    userActions.forEach(action => {
        if (!sessions[action.sessionId]) {
            sessions[action.sessionId] = {
                start: new Date(action.timestamp),
                end: new Date(action.timestamp)
            };
        } else {
            const session = sessions[action.sessionId];
            const actionTime = new Date(action.timestamp);
            
            if (actionTime < session.start) {
                session.start = actionTime;
            }
            
            if (actionTime > session.end) {
                session.end = actionTime;
            }
        }
    });
    
    let totalDuration = 0;
    let sessionCount = 0;
    
    for (const sessionId in sessions) {
        const session = sessions[sessionId];
        const duration = (session.end - session.start) / (1000 * 60); // 轉換為分鐘
        
        if (duration >= 1) { // 忽略太短的會話
            totalDuration += duration;
            sessionCount++;
        }
    }
    
    const avgSessionTime = sessionCount > 0 ? Math.round(totalDuration / sessionCount) : 0;
    
    // 計算偏好使用時段
    const hourCounts = Array(24).fill(0);
    
    userActions.forEach(action => {
        const hour = new Date(action.timestamp).getHours();
        hourCounts[hour]++;
    });
    
    let maxCount = 0;
    let preferredHour = 0;
    
    for (let i = 0; i < 24; i++) {
        if (hourCounts[i] > maxCount) {
            maxCount = hourCounts[i];
            preferredHour = i;
        }
    }
    
    // 格式化偏好時段
    const nextHour = (preferredHour + 1) % 24;
    const preferredTime = `${preferredHour < 10 ? '0' + preferredHour : preferredHour}:00-${nextHour < 10 ? '0' + nextHour : nextHour}:00`;
    
    // 計算最常用功能
    const actionCounts = {};
    
    userActions.forEach(action => {
        if (action.actionType !== 'login') { // 排除登入
            if (!actionCounts[action.actionType]) {
                actionCounts[action.actionType] = 0;
            }
            
            actionCounts[action.actionType]++;
        }
    });
    
    let maxActionCount = 0;
    let topFeature = '';
    
    for (const actionType in actionCounts) {
        if (actionCounts[actionType] > maxActionCount) {
            maxActionCount = actionCounts[actionType];
            topFeature = actionType;
        }
    }
    
    // 轉換功能代碼為可讀文本
    let topFeatureText = '';
    switch (topFeature) {
        case 'search':
            topFeatureText = '搜尋';
            break;
        case 'query':
            topFeatureText = '查詢';
            break;
        case 'report':
            topFeatureText = '報表';
            break;
        case 'upload':
            topFeatureText = '上傳';
            break;
        case 'download':
            topFeatureText = '下載';
            break;
        case 'edit':
            topFeatureText = '編輯';
            break;
        default:
            topFeatureText = '查詢';
    }
    
    // 計算使用頻率
    const uniqueDays = new Set();
    
    userActions.forEach(action => {
        const dateStr = new Date(action.timestamp).toDateString();
        uniqueDays.add(dateStr);
    });
    
    let frequency = '';
    const daysCount = uniqueDays.size;
    
    if (daysCount >= 20) {
        frequency = '頻繁 (幾乎每天)';
    } else if (daysCount >= 10) {
        frequency = '定期 (每週多次)';
    } else if (daysCount >= 4) {
        frequency = '適中 (每週一次)';
    } else {
        frequency = '偶爾 (每月數次)';
    }
    
    // 生成行為特徵
    const behaviorPatterns = [
        '短時間快速查詢',
        '長時間深入分析',
        '定期數據維護',
        '系統管理操作',
        '報表查詢為主',
        '數據上傳下載',
        '綜合使用多功能'
    ];
    
    // 根據使用者行為選擇合適的特徵
    let behaviorPattern = behaviorPatterns[Math.floor(Math.random() * behaviorPatterns.length)];
    
    if (avgSessionTime > 30 && topFeature === 'query') {
        behaviorPattern = '長時間深入分析';
    } else if (avgSessionTime < 15 && topFeature === 'query') {
        behaviorPattern = '短時間快速查詢';
    } else if (topFeature === 'upload' || topFeature === 'edit') {
        behaviorPattern = '定期數據維護';
    } else if (topFeature === 'report') {
        behaviorPattern = '報表查詢為主';
    } else if (topFeature === 'download') {
        behaviorPattern = '數據上傳下載';
    } else if (user.userType === 'admin') {
        behaviorPattern = '系統管理操作';
    }
    
    // 轉換角色代碼為可讀文本
    let roleText = '';
    switch (user.userType) {
        case 'admin':
            roleText = '管理員';
            break;
        case 'normal':
            roleText = '一般用戶';
            break;
        case 'fire':
            roleText = '消防單位';
            break;
        case 'economic':
            roleText = '經濟部';
            break;
        case 'labor':
            roleText = '勞動部';
            break;
        case 'environment':
            roleText = '環境部';
            break;
        default:
            roleText = '一般用戶';
    }
    
    // 添加使用者習慣數據
    userHabitsData.push({
        userId: user.userId,
        username: user.username,
        userType: user.userType,
        role: roleText,
        preferredTime: preferredTime,
        topFeature: topFeatureText,
        avgSessionTime: avgSessionTime,
        frequency: frequency,
        behaviorPattern: behaviorPattern,
        loginCount: userActions.filter(a => a.actionType === 'login').length,
        actionCount: userActions.length
    });
} 