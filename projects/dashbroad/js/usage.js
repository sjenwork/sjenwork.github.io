/**
 * 化學雲分析儀表板
 * 功能使用統計分析相關JavaScript - 處理化學物質查詢功能的使用統計和分析
 */

// 存儲當前篩選條件
const usageFilters = {
  dateRange: {
    startDate: new Date(new Date().getTime() - 12 * 60 * 60 * 1000), // 預設12小時前
    endDate: new Date()
  },
  timeGranularity: 10, // 預設10分鐘
  roleFilter: 'all',
  heatRankLimit: 10,
  queryTypes: ['all'], // 默認顯示所有查詢類型
  stackedView: true // 默認使用堆疊視圖
};

// 存儲模擬數據
let usageMockData = [];

// 圖表實例
let queryTimeSeriesChart = null;
let roleQueryPieChart = null;
let queryHeatmapChart = null;
let queryResponseTimeChart = null;

// 檢測當前是否為深色模式
function isDarkMode() {
  return document.body.classList.contains('dark-mode') || 
         document.documentElement.classList.contains('dark-mode') ||
         window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// 獲取圖表文字顏色
function getChartTextColor() {
  return isDarkMode() ? '#e0e0e0' : '#666666';
}

// 獲取圖表網格線顏色
function getChartGridColor() {
  return isDarkMode() ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
}

// 獲取圖表背景顏色
function getChartBackgroundColor() {
  return isDarkMode() ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)';
}

// 查詢功能類型定義
const queryTypes = {
  vendor: { 
    name: '廠商查詢', 
    color: '#4e73df',
    icon: '<i class="bi bi-building"></i>'
  },
  chemical: { 
    name: '化學物質查詢', 
    color: '#e74a3b',
    icon: '<i class="bi bi-flask"></i>'
  },
  fire: { 
    name: '消防署客製化查詢', 
    color: '#f6c23e',
    icon: '<i class="bi bi-fire"></i>'
  },
  vendorReport: { 
    name: '廠商快報查詢', 
    color: '#1cc88a',
    icon: '<i class="bi bi-newspaper"></i>'
  },
  map: { 
    name: '圖資查詢', 
    color: '#36b9cc',
    icon: '<i class="bi bi-map"></i>'
  },
  industryQuery: { 
    name: '產發署客製化鉤稽查詢', 
    color: '#6f42c1',
    icon: '<i class="bi bi-link-45deg"></i>'
  }
};

// 存儲當前選擇的查詢類型
let selectedQueryTypes = ['all'];

// 存儲時間序列圖表實例
let individualCharts = {};

/**
 * 初始化功能使用統計儀表板
 */
function initUsageDashboard() {
  console.log('初始化功能使用統計儀表板');
  
  // 生成模擬數據
  generateUsageMockData();
  
  // 初始化日期範圍選擇器
  initUsageDateRangePicker();
  
  // 初始化篩選器事件
  bindUsageFilterEvents();
  
  // 初始化圖表
  initUsageCharts();
  
  // 初始化查詢類型選擇器
  initQueryTypeSelector();
  
  // 更新儀表板
  updateUsageDashboard();
}

/**
 * 初始化日期範圍選擇器
 */
function initUsageDateRangePicker() {
  const now = new Date();
  const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
  
  // 格式化日期
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };
  
  // 設置日期範圍選擇器
  flatpickr('#usageDateRange', {
    mode: 'range',
    enableTime: true,
    dateFormat: 'Y-m-d H:i',
    defaultDate: [formatDate(twelveHoursAgo), formatDate(now)],
    locale: 'zh_tw',
    onChange: function(selectedDates) {
      if (selectedDates.length === 2) {
        usageFilters.dateRange.startDate = selectedDates[0];
        usageFilters.dateRange.endDate = selectedDates[1];
      }
    }
  });
}

/**
 * 初始化查詢類型選擇器
 */
function initQueryTypeSelector() {
  // 獲取篩選面板，在時間粒度選擇後添加查詢類型選擇
  const filterContainer = document.getElementById('heatRankLimit').closest('.col-md-3').parentNode;
  
  // 創建查詢類型選擇區域
  const queryTypeSelector = document.createElement('div');
  queryTypeSelector.className = 'row mt-3';
  queryTypeSelector.innerHTML = `
    <div class="col-12">
      <label class="form-label">查詢類型</label>
      <div class="query-type-selector d-flex flex-wrap">
        <div class="form-check me-3 mb-2">
          <input class="form-check-input query-type-checkbox" type="checkbox" value="all" id="queryTypeAll" checked>
          <label class="form-check-label" for="queryTypeAll">全部</label>
        </div>
        ${Object.entries(queryTypes).map(([type, info]) => `
          <div class="form-check me-3 mb-2">
            <input class="form-check-input query-type-checkbox" type="checkbox" value="${type}" id="queryType${type}">
            <label class="form-check-label" for="queryType${type}">
              ${info.icon} ${info.name}
            </label>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="col-12 mt-2">
      <div class="form-check form-switch">
        <input class="form-check-input" type="checkbox" id="stackedViewToggle" checked>
        <label class="form-check-label" for="stackedViewToggle">顯示堆疊視圖</label>
      </div>
    </div>
  `;
  
  // 添加到篩選區域
  filterContainer.appendChild(queryTypeSelector);
  
  // 綁定查詢類型選擇事件
  document.querySelectorAll('.query-type-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      if (this.value === 'all') {
        // 如果選擇了"全部"，取消其他選擇
        if (this.checked) {
          document.querySelectorAll('.query-type-checkbox:not([value="all"])').forEach(cb => {
            cb.checked = false;
          });
          selectedQueryTypes = ['all'];
        } else {
          // 如果取消了"全部"，且沒有其他選擇，則重新選中"全部"
          const anyChecked = document.querySelector('.query-type-checkbox:checked');
          if (!anyChecked) {
            document.getElementById('queryTypeAll').checked = true;
            selectedQueryTypes = ['all'];
          }
        }
      } else {
        // 如果選擇了特定類型，取消"全部"選擇
        if (this.checked) {
          document.getElementById('queryTypeAll').checked = false;
          if (!selectedQueryTypes.includes(this.value) && selectedQueryTypes.includes('all')) {
            selectedQueryTypes = []; // 清除"全部"
          }
          if (!selectedQueryTypes.includes(this.value)) {
            selectedQueryTypes.push(this.value);
          }
        } else {
          // 如果取消了特定類型，從選擇中移除
          selectedQueryTypes = selectedQueryTypes.filter(type => type !== this.value);
          // 如果沒有選擇，則選中"全部"
          if (selectedQueryTypes.length === 0) {
            document.getElementById('queryTypeAll').checked = true;
            selectedQueryTypes = ['all'];
          }
        }
      }
      
      // 更新過濾條件
      usageFilters.queryTypes = selectedQueryTypes;
    });
  });
  
  // 綁定堆疊視圖切換事件
  document.getElementById('stackedViewToggle').addEventListener('change', function() {
    usageFilters.stackedView = this.checked;
  });
}

/**
 * 綁定篩選器事件
 */
function bindUsageFilterEvents() {
  // 時間粒度選擇事件
  document.getElementById('timeGranularity').addEventListener('change', function() {
    usageFilters.timeGranularity = parseInt(this.value);
  });
  
  // 熱度排名顯示數量選擇事件
  document.getElementById('heatRankLimit').addEventListener('change', function() {
    usageFilters.heatRankLimit = parseInt(this.value);
  });
  
  // 角色選擇事件
  document.getElementById('usageRoleFilter').addEventListener('change', function() {
    usageFilters.roleFilter = this.value;
  });
  
  // 套用篩選按鈕事件
  document.getElementById('applyUsageFilters').addEventListener('click', function() {
    updateUsageDashboard();
  });
  
  // 重置篩選按鈕事件
  document.getElementById('usageResetFilters').addEventListener('click', function() {
    resetUsageFilters();
  });
}

/**
 * 重置篩選條件
 */
function resetUsageFilters() {
  // 重置時間範圍
  const now = new Date();
  const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
  
  usageFilters.dateRange.startDate = twelveHoursAgo;
  usageFilters.dateRange.endDate = now;
  
  // 重置其他篩選條件
  usageFilters.timeGranularity = 10;
  usageFilters.roleFilter = 'all';
  usageFilters.heatRankLimit = 10;
  usageFilters.queryTypes = ['all'];
  usageFilters.stackedView = true;
  
  // 重置UI
  document.getElementById('timeGranularity').value = '10';
  document.getElementById('heatRankLimit').value = '10';
  document.getElementById('usageRoleFilter').value = 'all';
  document.getElementById('stackedViewToggle').checked = true;
  
  // 重置查詢類型選擇
  document.querySelectorAll('.query-type-checkbox').forEach(checkbox => {
    checkbox.checked = checkbox.value === 'all';
  });
  selectedQueryTypes = ['all'];
  
  // 重置日期範圍選擇器
  const fp = document.getElementById('usageDateRange')._flatpickr;
  fp.setDate([twelveHoursAgo, now]);
  
  // 更新儀表板
  updateUsageDashboard();
}

/**
 * 初始化功能使用統計圖表
 */
function initUsageCharts() {
  // 註冊Chart.js插件
  Chart.register(ChartDataLabels);
  
  // 設置全局Chart.js默認值以支持深色模式
  Chart.defaults.color = getChartTextColor();
  Chart.defaults.borderColor = getChartGridColor();
  
  // 查詢時間序列圖
  const timeSeriesCtx = document.getElementById('queryTimeSeriesChart').getContext('2d');
  
  // 準備所有查詢類型的數據集
  const datasets = [];
  
  // 如果使用堆疊視圖，創建一個數據集
  if (usageFilters.stackedView) {
    // 為每種查詢類型創建數據集
    Object.entries(queryTypes).forEach(([type, info]) => {
      datasets.push({
        label: info.name,
        data: [],
        borderColor: info.color,
        backgroundColor: `${info.color}80`, // 添加透明度
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
        tension: 0.4
      });
    });
    
    // 添加總查詢量數據集
    datasets.push({
      label: '總查詢量',
      data: [],
      borderColor: isDarkMode() ? '#ffffff' : '#000000',
      backgroundColor: 'rgba(0, 0, 0, 0)',
      borderWidth: 3,
      pointRadius: 2,
      pointBackgroundColor: isDarkMode() ? '#ffffff' : '#000000',
      borderDash: [5, 5],
      fill: false,
      tension: 0.4
    });
  } else {
    // 只創建一個總查詢量數據集
    datasets.push({
      label: '總查詢量',
      data: [],
      borderColor: '#4e73df',
      backgroundColor: 'rgba(78, 115, 223, 0.1)',
      borderWidth: 2,
      pointBackgroundColor: '#4e73df',
      pointBorderColor: isDarkMode() ? '#1a1a1a' : '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
      fill: true,
      tension: 0.4
    });
  }
  
  queryTimeSeriesChart = new Chart(timeSeriesCtx, {
    type: 'line',
    data: {
      labels: [],
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: getChartTextColor(),
            padding: 15,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: isDarkMode() ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          titleColor: isDarkMode() ? '#ffffff' : '#000000',
          bodyColor: isDarkMode() ? '#e0e0e0' : '#666666',
          borderColor: isDarkMode() ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
          borderWidth: 1
        },
        datalabels: {
          display: false
        }
      },
      scales: {
        x: {
          grid: {
            drawOnChartArea: false,
            color: getChartGridColor()
          },
          ticks: {
            autoSkip: true,
            maxRotation: 0,
            color: getChartTextColor(),
            callback: function(value, index, values) {
              const label = this.getLabelForValue(value);
              // 根據標籤數量決定是否顯示完整時間
              if (values.length > 12) {
                return label.split(' ')[1]; // 只顯示時間
              }
              return label;
            }
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: getChartGridColor()
          },
          ticks: {
            precision: 0,
            color: getChartTextColor()
          },
          stacked: usageFilters.stackedView // 根據視圖類型決定是否堆疊
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    }
  });
  
  // 角色查詢分布餅圖
  const rolePieCtx = document.getElementById('roleQueryPieChart').getContext('2d');
  roleQueryPieChart = new Chart(rolePieCtx, {
    type: 'doughnut',
    data: {
      labels: ['消防單位', '經濟部', '勞動部', '衛福部', '環境部'],
      datasets: [{
        data: [0, 0, 0, 0, 0],
        backgroundColor: [
          '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'
        ],
        borderWidth: 1,
        borderColor: isDarkMode() ? '#1a1a1a' : '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            boxWidth: 12,
            color: getChartTextColor()
          }
        },
        tooltip: {
          backgroundColor: isDarkMode() ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          titleColor: isDarkMode() ? '#ffffff' : '#000000',
          bodyColor: isDarkMode() ? '#e0e0e0' : '#666666',
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        },
        datalabels: {
          formatter: (value, ctx) => {
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            if (value < total * 0.05) return '';
            return Math.round((value / total) * 100) + '%';
          },
          color: '#fff',
          font: {
            weight: 'bold',
            size: 11
          },
          textStrokeColor: isDarkMode() ? '#000' : undefined,
          textStrokeWidth: isDarkMode() ? 3 : 0
        }
      },
      cutout: '65%'
    }
  });
  
  // 24小時查詢分布熱力圖
  const heatmapCtx = document.getElementById('queryHeatmapChart').getContext('2d');
  queryHeatmapChart = new Chart(heatmapCtx, {
    type: 'bar',
    data: {
      labels: Array.from({length: 24}, (_, i) => `${i}:00`),
      datasets: [{
        label: '查詢次數',
        data: Array(24).fill(0),
        backgroundColor: function(context) {
          const value = context.dataset.data[context.dataIndex];
          const max = Math.max(...context.dataset.data);
          const alpha = max > 0 ? (value / max) * 0.8 + 0.2 : 0.2;
          return `rgba(78, 115, 223, ${alpha})`;
        },
        borderColor: 'rgba(78, 115, 223, 0.8)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: isDarkMode() ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          titleColor: isDarkMode() ? '#ffffff' : '#000000',
          bodyColor: isDarkMode() ? '#e0e0e0' : '#666666',
          callbacks: {
            title: function(tooltipItems) {
              return `${tooltipItems[0].label} - ${parseInt(tooltipItems[0].label) + 1}:00`;
            }
          }
        },
        datalabels: {
          display: false
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: {
            display: false
          },
          ticks: {
            precision: 0,
            color: getChartTextColor()
          }
        },
        y: {
          grid: {
            display: false
          },
          ticks: {
            color: getChartTextColor()
          }
        }
      }
    }
  });
  
  // 查詢響應時間圖
  const responseTimeCtx = document.getElementById('queryResponseTimeChart').getContext('2d');
  queryResponseTimeChart = new Chart(responseTimeCtx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: '平均響應時間 (ms)',
        data: [],
        borderColor: '#1cc88a',
        backgroundColor: 'rgba(28, 200, 138, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: '#1cc88a',
        pointBorderColor: isDarkMode() ? '#1a1a1a' : '#ffffff',
        pointRadius: 2,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: getChartTextColor()
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: isDarkMode() ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          titleColor: isDarkMode() ? '#ffffff' : '#000000',
          bodyColor: isDarkMode() ? '#e0e0e0' : '#666666'
        },
        datalabels: {
          display: false
        }
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'hour',
            displayFormats: {
              hour: 'HH:mm'
            }
          },
          grid: {
            display: false
          },
          ticks: {
            color: getChartTextColor()
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: getChartGridColor()
          },
          ticks: {
            color: getChartTextColor()
          }
        }
      }
    }
  });
  
  // 監聽主題變更
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateChartsTheme);
  
  // 如果有主題切換按鈕，監聽其點擊事件
  const themeToggler = document.querySelector('.theme-toggler');
  if (themeToggler) {
    themeToggler.addEventListener('click', function() {
      // 延遲執行以確保DOM已更新
      setTimeout(updateChartsTheme, 100);
    });
  }
}

/**
 * 更新圖表主題顏色
 */
function updateChartsTheme() {
  // 更新全局Chart.js默認值
  Chart.defaults.color = getChartTextColor();
  Chart.defaults.borderColor = getChartGridColor();
  
  // 更新時間序列圖
  if (queryTimeSeriesChart) {
    // 更新總查詢量線條顏色（如果使用堆疊視圖）
    if (usageFilters.stackedView) {
      const totalIndex = Object.keys(queryTypes).length;
      queryTimeSeriesChart.data.datasets[totalIndex].borderColor = isDarkMode() ? '#ffffff' : '#000000';
      queryTimeSeriesChart.data.datasets[totalIndex].pointBackgroundColor = isDarkMode() ? '#ffffff' : '#000000';
    }
    
    // 更新點邊框顏色
    queryTimeSeriesChart.data.datasets.forEach(dataset => {
      if (dataset.pointBorderColor) {
        dataset.pointBorderColor = isDarkMode() ? '#1a1a1a' : '#ffffff';
      }
    });
    
    // 更新圖例和軸顏色
    queryTimeSeriesChart.options.plugins.legend.labels.color = getChartTextColor();
    queryTimeSeriesChart.options.plugins.tooltip.backgroundColor = isDarkMode() ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)';
    queryTimeSeriesChart.options.plugins.tooltip.titleColor = isDarkMode() ? '#ffffff' : '#000000';
    queryTimeSeriesChart.options.plugins.tooltip.bodyColor = isDarkMode() ? '#e0e0e0' : '#666666';
    queryTimeSeriesChart.options.scales.x.grid.color = getChartGridColor();
    queryTimeSeriesChart.options.scales.y.grid.color = getChartGridColor();
    queryTimeSeriesChart.options.scales.x.ticks.color = getChartTextColor();
    queryTimeSeriesChart.options.scales.y.ticks.color = getChartTextColor();
    
    queryTimeSeriesChart.update();
  }
  
  // 更新餅圖
  if (roleQueryPieChart) {
    roleQueryPieChart.data.datasets[0].borderColor = isDarkMode() ? '#1a1a1a' : '#ffffff';
    roleQueryPieChart.options.plugins.legend.labels.color = getChartTextColor();
    roleQueryPieChart.options.plugins.tooltip.backgroundColor = isDarkMode() ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)';
    roleQueryPieChart.options.plugins.tooltip.titleColor = isDarkMode() ? '#ffffff' : '#000000';
    roleQueryPieChart.options.plugins.tooltip.bodyColor = isDarkMode() ? '#e0e0e0' : '#666666';
    roleQueryPieChart.options.plugins.datalabels.textStrokeColor = isDarkMode() ? '#000' : undefined;
    roleQueryPieChart.options.plugins.datalabels.textStrokeWidth = isDarkMode() ? 3 : 0;
    
    roleQueryPieChart.update();
  }
  
  // 更新熱力圖
  if (queryHeatmapChart) {
    queryHeatmapChart.options.scales.x.ticks.color = getChartTextColor();
    queryHeatmapChart.options.scales.y.ticks.color = getChartTextColor();
    queryHeatmapChart.options.plugins.tooltip.backgroundColor = isDarkMode() ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)';
    queryHeatmapChart.options.plugins.tooltip.titleColor = isDarkMode() ? '#ffffff' : '#000000';
    queryHeatmapChart.options.plugins.tooltip.bodyColor = isDarkMode() ? '#e0e0e0' : '#666666';
    
    queryHeatmapChart.update();
  }
  
  // 更新響應時間圖
  if (queryResponseTimeChart) {
    queryResponseTimeChart.data.datasets[0].pointBorderColor = isDarkMode() ? '#1a1a1a' : '#ffffff';
    queryResponseTimeChart.options.plugins.legend.labels.color = getChartTextColor();
    queryResponseTimeChart.options.plugins.tooltip.backgroundColor = isDarkMode() ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)';
    queryResponseTimeChart.options.plugins.tooltip.titleColor = isDarkMode() ? '#ffffff' : '#000000';
    queryResponseTimeChart.options.plugins.tooltip.bodyColor = isDarkMode() ? '#e0e0e0' : '#666666';
    queryResponseTimeChart.options.scales.x.grid.color = getChartGridColor();
    queryResponseTimeChart.options.scales.y.grid.color = getChartGridColor();
    queryResponseTimeChart.options.scales.x.ticks.color = getChartTextColor();
    queryResponseTimeChart.options.scales.y.ticks.color = getChartTextColor();
    
    queryResponseTimeChart.update();
  }
  
  // 更新排行榜表格
  styleQueryHeatRankTable();
}

/**
 * 設置排行榜表格深色模式樣式
 */
function styleQueryHeatRankTable() {
  const isDark = isDarkMode();
  const table = document.getElementById('queryHeatRankTable');
  
  if (!table) return;
  
  // 獲取表格容器
  const tableContainer = table.closest('.card');
  
  if (tableContainer) {
    // 設置表格頭部
    const thead = tableContainer.querySelector('thead');
    if (thead) {
      if (isDark) {
        thead.style.color = '#e0e0e0';
        thead.style.backgroundColor = '#2c2c2c';
      } else {
        thead.style.color = '';
        thead.style.backgroundColor = '';
      }
    }
    
    // 設置所有表格行
    const rows = table.querySelectorAll('tr');
    rows.forEach(row => {
      if (isDark) {
        row.style.color = '#e0e0e0';
        row.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      } else {
        row.style.color = '';
        row.style.borderColor = '';
      }
    });
    
    // 設置所有表格單元格
    const cells = table.querySelectorAll('td, th');
    cells.forEach(cell => {
      if (isDark) {
        cell.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      } else {
        cell.style.borderColor = '';
      }
    });
  }
}

/**
 * 更新功能使用統計儀表板
 */
function updateUsageDashboard() {
  console.log('更新功能使用統計儀表板', usageFilters);
  
  // 獲取篩選後的數據
  const filteredData = getFilteredUsageData();
  
  // 更新統計卡片
  updateUsageStatCards(filteredData);
  
  // 更新查詢時間序列圖
  updateQueryTimeSeriesChart(filteredData);
  
  // 更新角色查詢分布圖
  updateRoleQueryPieChart(filteredData);
  
  // 更新查詢熱度排行榜
  updateQueryHeatRank(filteredData);
  
  // 更新24小時查詢分布熱力圖
  updateQueryHeatmap(filteredData);
  
  // 更新查詢響應時間圖
  updateQueryResponseTimeChart(filteredData);
}

/**
 * 根據篩選條件獲取數據
 */
function getFilteredUsageData() {
  // 時間範圍篩選
  let filtered = usageMockData.filter(item => {
    const timestamp = new Date(item.timestamp);
    return timestamp >= usageFilters.dateRange.startDate && timestamp <= usageFilters.dateRange.endDate;
  });
  
  // 角色篩選
  if (usageFilters.roleFilter !== 'all') {
    filtered = filtered.filter(item => item.role === usageFilters.roleFilter);
  }
  
  // 查詢類型篩選
  if (!usageFilters.queryTypes.includes('all')) {
    filtered = filtered.filter(item => usageFilters.queryTypes.includes(item.queryType));
  }
  
  return filtered;
}

/**
 * 更新統計卡片
 */
function updateUsageStatCards(data) {
  // 總查詢次數
  const totalQueries = data.length;
  document.getElementById('totalQueries').textContent = totalQueries.toLocaleString();
  
  // 計算平均查詢間隔
  let avgInterval = 0;
  if (totalQueries > 1) {
    // 按時間排序
    const sortedData = [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    let totalInterval = 0;
    
    for (let i = 1; i < sortedData.length; i++) {
      const current = new Date(sortedData[i].timestamp);
      const previous = new Date(sortedData[i-1].timestamp);
      totalInterval += (current - previous) / 1000; // 轉換為秒
    }
    
    avgInterval = totalInterval / (sortedData.length - 1);
  }
  
  // 格式化間隔顯示
  let intervalDisplay = '';
  if (avgInterval < 60) {
    intervalDisplay = `${Math.round(avgInterval)}秒`;
  } else if (avgInterval < 3600) {
    intervalDisplay = `${Math.round(avgInterval / 60)}分鐘`;
  } else {
    intervalDisplay = `${Math.round(avgInterval / 3600 * 10) / 10}小時`;
  }
  
  document.getElementById('avgQueryInterval').textContent = intervalDisplay;
  
  // 計算高峰時段
  const hourCounts = Array(24).fill(0);
  data.forEach(item => {
    const hour = new Date(item.timestamp).getHours();
    hourCounts[hour]++;
  });
  
  const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
  const peakQueries = hourCounts[peakHour];
  
  document.getElementById('peakQueries').textContent = peakQueries.toLocaleString();
  document.getElementById('peakTime').textContent = `${peakHour}:00-${peakHour+1}:00`;
  
  // 計算主要查詢角色
  const roleCounts = {
    fire: 0,
    economic: 0,
    labor: 0,
    health: 0,
    environment: 0
  };
  
  data.forEach(item => {
    if (roleCounts[item.role] !== undefined) {
      roleCounts[item.role]++;
    }
  });
  
  const roleNames = {
    fire: '消防單位',
    economic: '經濟部',
    labor: '勞動部',
    health: '衛福部',
    environment: '環境部'
  };
  
  let topRole = '';
  let topRoleCount = 0;
  
  Object.entries(roleCounts).forEach(([role, count]) => {
    if (count > topRoleCount) {
      topRole = role;
      topRoleCount = count;
    }
  });
  
  // 設置主要角色和百分比
  const topRolePercentage = totalQueries > 0 ? Math.round((topRoleCount / totalQueries) * 100) : 0;
  
  document.getElementById('topQueryRole').textContent = roleNames[topRole] || '-';
  document.getElementById('topRoleQueryPercentage').textContent = `${topRolePercentage}%`;
  
  // 設置增長數據（模擬）
  document.getElementById('queriesGrowth').textContent = `+${Math.round(Math.random() * 30)}%`;
  document.getElementById('intervalGrowth').textContent = Math.random() > 0.5 ? 
    `+${Math.round(Math.random() * 10)}%` : 
    `-${Math.round(Math.random() * 10)}%`;
}

/**
 * 更新查詢時間序列圖
 */
function updateQueryTimeSeriesChart(data) {
  // 按時間粒度分組數據
  const groupedData = groupDataByTimeGranularity(data, usageFilters.timeGranularity);
  const timeLabels = groupedData.map(item => item.timeLabel);
  
  // 清空現有數據
  queryTimeSeriesChart.data.labels = timeLabels;
  
  if (usageFilters.stackedView) {
    // 堆疊視圖 - 分別顯示各查詢類型
    const typeIndices = {};
    Object.keys(queryTypes).forEach((type, index) => {
      typeIndices[type] = index; // 記錄每種類型在數據集中的索引
      
      // 計算每個時間段各查詢類型的數量
      const typeCounts = groupedData.map(group => {
        // 該時間段的指定類型查詢
        const typeQueries = data.filter(item => {
          const timestamp = new Date(item.timestamp);
          return timestamp >= group.startTime && 
                 timestamp < group.endTime && 
                 item.queryType === type;
        });
        return typeQueries.length;
      });
      
      // 更新該類型的數據集
      queryTimeSeriesChart.data.datasets[index].data = typeCounts;
    });
    
    // 更新總查詢量數據集
    const totalIndex = Object.keys(queryTypes).length; // 總查詢量在最後一個位置
    queryTimeSeriesChart.data.datasets[totalIndex].data = groupedData.map(item => item.count);
  } else {
    // 非堆疊視圖 - 只顯示總量
    queryTimeSeriesChart.data.datasets[0].data = groupedData.map(item => item.count);
  }
  
  // 調整X軸時間單位
  const timeUnit = getTimeUnit(usageFilters.timeGranularity);
  if (queryTimeSeriesChart.options.scales.x.time) {
    queryTimeSeriesChart.options.scales.x.time.unit = timeUnit;
  } else {
    queryTimeSeriesChart.options.scales.x.time = {
      unit: timeUnit,
      displayFormats: {
        minute: 'HH:mm',
        hour: 'HH:mm',
        day: 'MM/DD'
      }
    };
  }
  
  // 更新堆疊設置
  queryTimeSeriesChart.options.scales.y.stacked = usageFilters.stackedView;
  
  // 更新圖表
  queryTimeSeriesChart.update();
}

/**
 * 更新角色查詢分布圖
 */
function updateRoleQueryPieChart(data) {
  // 計算各角色查詢次數
  const roleCounts = {
    fire: 0,
    economic: 0,
    labor: 0,
    health: 0,
    environment: 0
  };
  
  data.forEach(item => {
    if (roleCounts[item.role] !== undefined) {
      roleCounts[item.role]++;
    }
  });
  
  // 更新圖表數據
  roleQueryPieChart.data.datasets[0].data = [
    roleCounts.fire,
    roleCounts.economic,
    roleCounts.labor,
    roleCounts.health,
    roleCounts.environment
  ];
  
  // 更新圖表
  roleQueryPieChart.update();
}

/**
 * 更新查詢熱度排行榜
 */
function updateQueryHeatRank(data) {
  // 按查詢對象和類型統計查詢次數
  const queryCountMap = new Map();
  
  data.forEach(item => {
    const key = `${item.target}|${item.queryType}`;
    if (!queryCountMap.has(key)) {
      queryCountMap.set(key, {
        target: item.target,
        type: item.queryType,
        count: 0,
        roleDistribution: {
          fire: 0,
          economic: 0,
          labor: 0,
          health: 0,
          environment: 0
        },
        timestamps: []
      });
    }
    
    const entry = queryCountMap.get(key);
    entry.count++;
    
    if (entry.roleDistribution[item.role] !== undefined) {
      entry.roleDistribution[item.role]++;
    }
    
    entry.timestamps.push(new Date(item.timestamp));
  });
  
  // 轉換為數組並排序
  let queryRanking = Array.from(queryCountMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, usageFilters.heatRankLimit);
  
  // 獲取表格元素
  const tableBody = document.getElementById('queryHeatRankTable');
  tableBody.innerHTML = '';
  
  // 生成表格行
  queryRanking.forEach((item, index) => {
    // 計算趨勢（簡單實現：比較前一半和後一半時間段的查詢次數）
    let trend = 0;
    if (item.timestamps.length > 1) {
      item.timestamps.sort((a, b) => a - b);
      const midIndex = Math.floor(item.timestamps.length / 2);
      const firstHalfCount = midIndex;
      const secondHalfCount = item.timestamps.length - midIndex;
      
      if (firstHalfCount > 0 && secondHalfCount > 0) {
        const changeRate = (secondHalfCount - firstHalfCount) / firstHalfCount;
        if (changeRate > 0.1) trend = 1; // 上升
        else if (changeRate < -0.1) trend = -1; // 下降
      }
    }
    
    // 生成角色分布可視化
    const totalRoleCount = Object.values(item.roleDistribution).reduce((a, b) => a + b, 0);
    const roleVisual = `
      <div class="d-flex" style="height: 20px; width: 100%; border-radius: 3px; overflow: hidden;">
        ${totalRoleCount > 0 ? `
          <div style="width: ${(item.roleDistribution.fire / totalRoleCount) * 100}%; background-color: #4e73df;"></div>
          <div style="width: ${(item.roleDistribution.economic / totalRoleCount) * 100}%; background-color: #1cc88a;"></div>
          <div style="width: ${(item.roleDistribution.labor / totalRoleCount) * 100}%; background-color: #36b9cc;"></div>
          <div style="width: ${(item.roleDistribution.health / totalRoleCount) * 100}%; background-color: #f6c23e;"></div>
          <div style="width: ${(item.roleDistribution.environment / totalRoleCount) * 100}%; background-color: #e74a3b;"></div>
        ` : ''}
      </div>
    `;
    
    // 趨勢圖標
    let trendIcon = '';
    if (trend === 1) {
      trendIcon = '<i class="bi bi-arrow-up-circle-fill text-success"></i>';
    } else if (trend === -1) {
      trendIcon = '<i class="bi bi-arrow-down-circle-fill text-danger"></i>';
    } else {
      trendIcon = '<i class="bi bi-dash-circle-fill text-secondary"></i>';
    }
    
    // 查詢類型圖標和名稱
    let typeIcon = '';
    let typeText = '';
    
    // 使用新的查詢類型
    if (item.type in queryTypes || item.queryType in queryTypes) {
      const typeKey = item.queryType || item.type;
      if (queryTypes[typeKey]) {
        typeIcon = queryTypes[typeKey].icon;
        typeText = queryTypes[typeKey].name;
      }
    } else {
      // 舊的類型處理（兼容）
      switch (item.type) {
        case 'chemical':
          typeIcon = '<i class="bi bi-flask text-danger"></i>';
          typeText = '化學物質';
          break;
        case 'company':
          typeIcon = '<i class="bi bi-building text-primary"></i>';
          typeText = '廠商';
          break;
        default:
          typeIcon = '<i class="bi bi-question-circle text-secondary"></i>';
          typeText = '其他';
      }
    }
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.target}</td>
      <td>${typeIcon} ${typeText}</td>
      <td>${item.count.toLocaleString()}</td>
      <td>${roleVisual}</td>
      <td class="text-center">${trendIcon}</td>
    `;
    
    tableBody.appendChild(row);
  });
  
  // 設置表格樣式以支持深色模式
  styleQueryHeatRankTable();
}

/**
 * 更新24小時查詢分布熱力圖
 */
function updateQueryHeatmap(data) {
  // 計算每小時查詢次數
  const hourCounts = Array(24).fill(0);
  
  data.forEach(item => {
    const hour = new Date(item.timestamp).getHours();
    hourCounts[hour]++;
  });
  
  // 更新圖表數據
  queryHeatmapChart.data.datasets[0].data = hourCounts;
  
  // 更新圖表
  queryHeatmapChart.update();
}

/**
 * 更新查詢響應時間圖
 */
function updateQueryResponseTimeChart(data) {
  // 按時間粒度分組數據
  const groupedData = groupDataByTimeGranularity(data, usageFilters.timeGranularity);
  
  // 計算每個時間段的平均響應時間
  const responseTimeData = groupedData.map(group => {
    // 該時間段的所有查詢
    const queries = data.filter(item => {
      const timestamp = new Date(item.timestamp);
      return timestamp >= group.startTime && timestamp < group.endTime;
    });
    
    // 計算平均響應時間
    const avgResponseTime = queries.length > 0 ? 
      queries.reduce((sum, item) => sum + item.responseTime, 0) / queries.length : 
      0;
    
    return {
      t: group.startTime,
      y: Math.round(avgResponseTime)
    };
  });
  
  // 更新圖表數據
  queryResponseTimeChart.data.datasets[0].data = responseTimeData;
  
  // 調整X軸時間單位
  const timeUnit = getTimeUnit(usageFilters.timeGranularity);
  queryResponseTimeChart.options.scales.x.time.unit = timeUnit;
  
  // 更新圖表
  queryResponseTimeChart.update();
}

/**
 * 根據時間粒度分組數據
 */
function groupDataByTimeGranularity(data, granularity) {
  if (data.length === 0) return [];
  
  // 獲取時間範圍
  const startDate = usageFilters.dateRange.startDate;
  const endDate = usageFilters.dateRange.endDate;
  
  // 根據粒度計算時間間隔（分鐘）
  const intervalMinutes = granularity;
  
  // 計算總時間段數量
  const totalMinutes = Math.ceil((endDate - startDate) / (60 * 1000));
  const intervals = Math.ceil(totalMinutes / intervalMinutes);
  
  // 初始化分組數據
  const groupedData = [];
  
  for (let i = 0; i < intervals; i++) {
    const intervalStart = new Date(startDate.getTime() + i * intervalMinutes * 60 * 1000);
    const intervalEnd = new Date(startDate.getTime() + (i + 1) * intervalMinutes * 60 * 1000);
    
    // 限制在結束日期以內
    const adjustedIntervalEnd = intervalEnd > endDate ? endDate : intervalEnd;
    
    // 格式化顯示標籤
    const timeLabel = formatTimeLabel(intervalStart, granularity);
    
    groupedData.push({
      startTime: intervalStart,
      endTime: adjustedIntervalEnd,
      timeLabel: timeLabel,
      count: 0
    });
  }
  
  // 統計每個時間段的查詢次數
  data.forEach(item => {
    const timestamp = new Date(item.timestamp);
    
    for (let i = 0; i < groupedData.length; i++) {
      if (timestamp >= groupedData[i].startTime && timestamp < groupedData[i].endTime) {
        groupedData[i].count++;
        break;
      }
    }
  });
  
  return groupedData;
}

/**
 * 格式化時間標籤
 */
function formatTimeLabel(date, granularity) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  if (granularity < 60) {
    // 分鐘粒度
    return `${month}/${day} ${hours}:${minutes}`;
  } else if (granularity < 1440) {
    // 小時粒度
    return `${month}/${day} ${hours}:00`;
  } else {
    // 日粒度
    return `${month}/${day}`;
  }
}

/**
 * 根據時間粒度獲取適合的時間單位
 */
function getTimeUnit(granularity) {
  if (granularity <= 10) {
    return 'minute';
  } else if (granularity <= 120) {
    return 'hour';
  } else {
    return 'day';
  }
}

/**
 * 生成模擬數據
 */
function generateUsageMockData() {
  usageMockData = [];
  
  // 設置時間範圍（過去12小時）
  const now = new Date();
  const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
  
  // 角色列表
  const roles = ['fire', 'economic', 'labor', 'health', 'environment'];
  
  // 查詢類型列表
  const types = Object.keys(queryTypes);
  
  // 化學物質和廠商名稱列表
  const chemicals = [
    '甲苯', '二甲苯', '甲醛', '苯', '氯仿', '丙酮', '氨', '硫酸', '鹽酸', '硝酸',
    '氫氧化鈉', '過氧化氫', '甲醇', '乙醇', '異丙醇', '乙酸', '汽油', '柴油', '煤油', '天然氣'
  ];
  
  const companies = [
    '台灣化學工業', '台積電', '中油', '南亞塑膠', '長春石化', '台塑', '奇美實業', '中鋼', '華新麗華', '統一企業',
    '遠東新世紀', '光洋化學', '國泰化工', '東聯化學', '中國合成橡膠', '和桐化學', '台橡', '聯成化學', '信昌化學', '亞東石化'
  ];
  
  // 查詢對象映射
  const queryTargets = {
    vendor: companies,
    chemical: chemicals,
    fire: [...chemicals, ...companies],
    vendorReport: companies,
    map: ['台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市', '基隆市', '新竹市', '嘉義市'],
    industryQuery: [...companies, '石化產業', '半導體產業', '電子產業', '鋼鐵產業', '塑膠產業']
  };
  
  // 生成查詢記錄
  const totalEntries = 5000; // 生成足夠多的數據
  
  // 各查詢類型的使用比例
  const queryTypeDistribution = {
    vendor: 0.2,
    chemical: 0.35,
    fire: 0.15,
    vendorReport: 0.1,
    map: 0.1,
    industryQuery: 0.1
  };
  
  // 模擬事件：特定時間段內的查詢量驟增
  const eventTimeStart = new Date(now.getTime() - 5 * 60 * 60 * 1000); // 5小時前
  const eventTimeEnd = new Date(now.getTime() - 3 * 60 * 60 * 1000);   // 3小時前
  
  // 各角色查詢類型偏好
  const roleQueryPreferences = {
    fire: { fire: 0.5, chemical: 0.3, vendor: 0.1, vendorReport: 0.05, map: 0.03, industryQuery: 0.02 },
    economic: { vendor: 0.3, industryQuery: 0.3, chemical: 0.2, vendorReport: 0.1, map: 0.05, fire: 0.05 },
    labor: { chemical: 0.4, vendor: 0.2, fire: 0.1, vendorReport: 0.1, map: 0.1, industryQuery: 0.1 },
    health: { chemical: 0.5, vendor: 0.2, map: 0.1, fire: 0.1, vendorReport: 0.05, industryQuery: 0.05 },
    environment: { chemical: 0.4, map: 0.2, vendor: 0.15, fire: 0.1, industryQuery: 0.1, vendorReport: 0.05 }
  };
  
  for (let i = 0; i < totalEntries; i++) {
    // 隨機生成時間戳（12小時內）
    let timestamp = new Date(twelveHoursAgo.getTime() + Math.random() * (now - twelveHoursAgo));
    
    // 增加事件期間的查詢密度
    const isEventTime = timestamp >= eventTimeStart && timestamp <= eventTimeEnd;
    
    // 如果不在事件時間但隨機數小於0.7，則重新生成時間戳
    // 這會使得事件時間內的查詢密度約為其他時間的3倍
    if (!isEventTime && Math.random() < 0.7) {
      i--; // 重做此迭代
      continue;
    }
    
    // 隨機選擇角色
    const role = roles[Math.floor(Math.random() * roles.length)];
    
    // 根據角色偏好決定查詢類型
    let queryType;
    const preferences = roleQueryPreferences[role];
    const rand = Math.random();
    let cumulative = 0;
    
    for (const [type, prob] of Object.entries(preferences)) {
      cumulative += prob;
      if (rand < cumulative) {
        queryType = type;
        break;
      }
    }
    
    // 根據查詢類型選擇查詢對象
    const targets = queryTargets[queryType];
    let target = targets[Math.floor(Math.random() * targets.length)];
    
    // 如果是事件時間，則增加對特定化學物質的查詢
    if (isEventTime && Math.random() < 0.4) {
      queryType = 'chemical';
      target = '甲苯'; // 事件相關的特定化學物質
    }
    
    // 隨機生成響應時間（100ms到2000ms）
    const responseTime = Math.floor(100 + Math.random() * 1900);
    
    // 添加到數據集
    usageMockData.push({
      timestamp: timestamp,
      role: role,
      type: queryType === 'chemical' ? 'chemical' : 'other', // 兼容舊代碼
      queryType: queryType, // 新的查詢類型字段
      target: target,
      responseTime: responseTime
    });
  }
  
  // 按時間排序
  usageMockData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

// 在文檔加載完成後初始化功能使用統計儀表板
document.addEventListener('DOMContentLoaded', function() {
  // 為"功能使用統計"頁籤添加事件監聽器
  const usageTab = document.getElementById('usage-tab');
  if (usageTab) {
    usageTab.addEventListener('shown.bs.tab', function() {
      if (!usageMockData.length) {
        initUsageDashboard();
      }
    });
  }
  
  // 初始化功能使用統計儀表板（如果當前頁籤是功能使用統計）
  if (document.getElementById('usage-dashboard').classList.contains('active')) {
    initUsageDashboard();
  }
}); 