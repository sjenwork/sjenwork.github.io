/**
 * 化學雲帳號統計儀表板
 * 圖表相關JavaScript - 處理各種統計圖表的繪製和更新
 */

// 圖表顏色配置
const CHART_COLORS = {
  fire: '#e74a3b',
  economic: '#4e73df',
  labor: '#1cc88a',
  health: '#36b9cc',
  environment: '#f6c23e',
  active: '#1cc88a',
  inactive: '#e74a3b'
};

// 儲存所有圖表實例
window.dashboardCharts = {};

/**
 * 設置圖表全局配置，適應深色模式
 */
function setupGlobalChartConfig() {
    if (!window.Chart) return;
    
    const isDarkMode = document.body.classList.contains('dark-mode');
    const fontColor = isDarkMode ? '#e2e8f0' : '#666';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    Chart.defaults.color = fontColor;
    Chart.defaults.borderColor = gridColor;
    
    // 為不同圖表類型設置默認值
    const chartTypes = ['line', 'bar', 'pie', 'doughnut', 'scatter', 'radar', 'polarArea'];
    chartTypes.forEach(type => {
        if (Chart.defaults[type]) {
            Chart.defaults[type].datasets = Chart.defaults[type].datasets || {};
            
            // 設置默認背景色和邊框色
            if (['pie', 'doughnut', 'polarArea'].includes(type)) {
                Chart.defaults[type].datasets.backgroundColor = [
                    '#4299e1', '#48bb78', '#ed8936', '#a0aec0', '#667eea', '#f56565', 
                    '#d53f8c', '#38b2ac', '#9f7aea', '#ecc94b'
                ];
                Chart.defaults[type].datasets.borderColor = isDarkMode ? '#2d3748' : '#ffffff';
            }
        }
    });
    
    // 設置提示框樣式
    Chart.defaults.plugins.tooltip = Chart.defaults.plugins.tooltip || {};
    Chart.defaults.plugins.tooltip.backgroundColor = isDarkMode ? '#1a202c' : 'rgba(0, 0, 0, 0.7)';
    Chart.defaults.plugins.tooltip.titleColor = isDarkMode ? '#e2e8f0' : '#fff';
    Chart.defaults.plugins.tooltip.bodyColor = isDarkMode ? '#e2e8f0' : '#fff';
    Chart.defaults.plugins.tooltip.borderColor = isDarkMode ? '#4a5568' : 'rgba(0, 0, 0, 0.1)';
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    
    // 設置圖例樣式
    Chart.defaults.plugins.legend = Chart.defaults.plugins.legend || {};
    Chart.defaults.plugins.legend.labels = Chart.defaults.plugins.legend.labels || {};
    Chart.defaults.plugins.legend.labels.color = fontColor;
}

// 在DOM加載完成後設置全局配置
document.addEventListener('DOMContentLoaded', function() {
    setupGlobalChartConfig();
    
    // 監聽深色模式切換
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            // 延遲執行以確保深色模式已切換
            setTimeout(function() {
                setupGlobalChartConfig();
            }, 50);
        });
    }
});

/**
 * 獲取適合當前模式的圖表顏色
 */
function getChartColors(isDark) {
    if (isDark === undefined) {
        isDark = document.body.classList.contains('dark-mode');
    }
    
    return {
        primary: isDark ? '#3182ce' : '#4299e1',     // 藍色
        success: isDark ? '#2f855a' : '#48bb78',     // 綠色
        warning: isDark ? '#c05621' : '#ed8936',     // 橙色
        danger: isDark ? '#c53030' : '#f56565',      // 紅色
        info: isDark ? '#2c5282' : '#4a9cf5',        // 淺藍色
        secondary: isDark ? '#718096' : '#a0aec0',   // 灰色
        purple: isDark ? '#6b46c1' : '#9f7aea',      // 紫色
        pink: isDark ? '#b83280' : '#d53f8c',        // 粉色
        teal: isDark ? '#2c7a7b' : '#38b2ac',        // 蒂爾色
        gray: isDark ? '#4a5568' : '#a0aec0',        // 灰色
        
        // 圖表背景透明度
        backgroundOpacity: isDark ? 0.2 : 0.1,
        
        // 圖表邊框寬度
        borderWidth: isDark ? 2 : 1,
        
        // 網格線顏色
        gridColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        
        // 文字顏色
        textColor: isDark ? '#e2e8f0' : '#666'
    };
}

/**
 * 初始化所有圖表
 */
function initCharts(data) {
  // 初始化時間序列圖
  initTimeSeriesChart(data);
  
  // 初始化角色分布餅圖
  initRolePieChart(data);
  
  // 初始化狀態柱狀圖
  initStatusBarChart(data);
  
  // 註冊圖表響應式調整
  handleChartResize();
}

/**
 * 更新所有圖表
 */
function updateCharts(data) {
  // 更新時間序列圖
  updateTimeSeriesChart(data);
  
  // 更新角色分布餅圖
  updateRolePieChart(data);
  
  // 更新狀態柱狀圖
  updateStatusBarChart(data);
}

/**
 * 初始化時間序列圖
 */
function initTimeSeriesChart(data) {
  const ctx = document.getElementById('timeSeriesChart').getContext('2d');
  
  // 獲取當前的時間粒度
  const timeGranularity = document.getElementById('timeGranularity').value;
  
  // 根據時間粒度處理數據
  const timeSeriesData = processTimeSeriesData(data, timeGranularity);
  
  // 創建時間序列圖
  window.dashboardCharts.timeSeriesChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: timeSeriesData.labels,
      datasets: timeSeriesData.datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 500, // 減少動畫時間
      },
      resizeDelay: 200, // 添加調整大小延遲
      devicePixelRatio: 2, // 提高渲染質量但限制分辨率
      plugins: {
        legend: {
          position: 'top',
          labels: {
            padding: 20,
            usePointStyle: true,
            color: getComputedStyle(document.body).getPropertyValue('--text-primary')
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: getComputedStyle(document.body).getPropertyValue('--bg-secondary'),
          titleColor: getComputedStyle(document.body).getPropertyValue('--text-primary'),
          bodyColor: getComputedStyle(document.body).getPropertyValue('--text-primary'),
          borderColor: getComputedStyle(document.body).getPropertyValue('--border-color'),
          borderWidth: 1,
          padding: 12,
          cornerRadius: 6,
          titleFont: {
            size: 14,
            weight: 'bold'
          },
          callbacks: {
            label: function(context) {
              return context.dataset.label + ': ' + context.parsed.y + ' 帳號';
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: getComputedStyle(document.body).getPropertyValue('--chart-grid')
          },
          ticks: {
            color: getComputedStyle(document.body).getPropertyValue('--text-secondary')
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: getComputedStyle(document.body).getPropertyValue('--chart-grid')
          },
          ticks: {
            precision: 0,
            color: getComputedStyle(document.body).getPropertyValue('--text-secondary')
          }
        }
      },
      elements: {
        line: {
          tension: 0.3
        },
        point: {
          radius: 3,
          hoverRadius: 5
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    }
  });
}

/**
 * 更新時間序列圖
 */
function updateTimeSeriesChart(data) {
  // 獲取當前的時間粒度
  const timeGranularity = document.getElementById('timeGranularity').value;
  
  // 根據時間粒度處理數據
  const timeSeriesData = processTimeSeriesData(data, timeGranularity);
  
  // 更新圖表數據
  const chart = window.dashboardCharts.timeSeriesChart;
  chart.data.labels = timeSeriesData.labels;
  chart.data.datasets = timeSeriesData.datasets;
  chart.update();
}

/**
 * 處理時間序列數據
 */
function processTimeSeriesData(data, timeGranularity) {
  // 按角色分組的數據
  const roleGroups = {};
  const timeLabels = new Set();
  
  // 獲取角色的中文名稱
  const roleNames = {
    fire: '消防單位',
    economic: '經濟部',
    labor: '勞動部',
    health: '衛福部',
    environment: '環境部'
  };
  
  // 格式化日期函數
  function formatDate(dateStr, granularity) {
    const date = new Date(dateStr);
    
    switch (granularity) {
      case 'day':
        return date.toISOString().split('T')[0];
      case 'month':
        return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      case 'quarter':
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `${date.getFullYear()} Q${quarter}`;
      case 'year':
        return date.getFullYear().toString();
      default:
        return date.toISOString().split('T')[0];
    }
  }
  
  // 遍歷數據並按時間粒度和角色進行分組
  data.forEach(item => {
    const timeLabel = formatDate(item.date, timeGranularity);
    timeLabels.add(timeLabel);
    
    if (!roleGroups[item.role]) {
      roleGroups[item.role] = {};
    }
    
    if (!roleGroups[item.role][timeLabel]) {
      roleGroups[item.role][timeLabel] = 0;
    }
    
    roleGroups[item.role][timeLabel]++;
  });
  
  // 將時間標籤轉換為數組並排序
  const sortedLabels = [...timeLabels].sort((a, b) => {
    // 根據時間粒度處理排序
    if (timeGranularity === 'quarter') {
      const [yearA, quarterA] = a.split(' ');
      const [yearB, quarterB] = b.split(' ');
      
      if (yearA !== yearB) {
        return yearA.localeCompare(yearB);
      }
      
      return quarterA.localeCompare(quarterB);
    }
    
    return a.localeCompare(b);
  });
  
  // 創建數據集
  const datasets = [];
  
  // 添加所有角色的數據
  Object.keys(roleGroups).forEach((role, index) => {
    const dataset = {
      label: roleNames[role] || role,
      data: sortedLabels.map(label => roleGroups[role][label] || 0),
      borderColor: CHART_COLORS[role],
      backgroundColor: `${CHART_COLORS[role]}4D`, // 添加30%透明度
      borderWidth: 2,
      fill: false,
      cubicInterpolationMode: 'monotone'
    };
    
    datasets.push(dataset);
  });
  
  // 添加總數據線
  const totalDataset = {
    label: '總計',
    data: sortedLabels.map(label => {
      let total = 0;
      Object.keys(roleGroups).forEach(role => {
        total += roleGroups[role][label] || 0;
      });
      return total;
    }),
    borderColor: '#858796',
    backgroundColor: '#8587964D',
    borderWidth: 3,
    borderDash: [5, 5],
    fill: false,
    pointStyle: 'rectRot',
    pointRadius: 4,
    cubicInterpolationMode: 'monotone'
  };
  
  datasets.push(totalDataset);
  
  return {
    labels: sortedLabels,
    datasets: datasets
  };
}

/**
 * 初始化角色分布餅圖
 */
function initRolePieChart(data) {
  const ctx = document.getElementById('rolePieChart').getContext('2d');
  
  // 處理餅圖數據
  const pieData = processRolePieData(data);
  
  // 創建角色分布餅圖
  window.dashboardCharts.rolePieChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: pieData.labels,
      datasets: [{
        data: pieData.data,
        backgroundColor: pieData.colors,
        borderColor: getComputedStyle(document.body).getPropertyValue('--bg-secondary'),
        borderWidth: 2,
        hoverOffset: 10
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
            usePointStyle: true,
            color: getComputedStyle(document.body).getPropertyValue('--text-primary')
          }
        },
        tooltip: {
          backgroundColor: getComputedStyle(document.body).getPropertyValue('--bg-secondary'),
          titleColor: getComputedStyle(document.body).getPropertyValue('--text-primary'),
          bodyColor: getComputedStyle(document.body).getPropertyValue('--text-primary'),
          borderColor: getComputedStyle(document.body).getPropertyValue('--border-color'),
          borderWidth: 1,
          padding: 12,
          cornerRadius: 6,
          titleFont: {
            size: 14,
            weight: 'bold'
          },
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((acc, current) => acc + current, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value} 帳號 (${percentage}%)`;
            }
          }
        }
      },
      cutout: '65%',
      animation: {
        animateScale: true,
        animateRotate: true
      }
    }
  });
}

/**
 * 更新角色分布餅圖
 */
function updateRolePieChart(data) {
  // 處理餅圖數據
  const pieData = processRolePieData(data);
  
  // 更新圖表數據
  const chart = window.dashboardCharts.rolePieChart;
  chart.data.labels = pieData.labels;
  chart.data.datasets[0].data = pieData.data;
  chart.data.datasets[0].backgroundColor = pieData.colors;
  chart.update();
}

/**
 * 處理角色分布餅圖數據
 */
function processRolePieData(data) {
  // 按角色統計帳號數量
  const roleCounts = {};
  
  data.forEach(item => {
    if (!roleCounts[item.role]) {
      roleCounts[item.role] = 0;
    }
    roleCounts[item.role]++;
  });
  
  // 獲取角色的中文名稱
  const roleNames = {
    fire: '消防單位',
    economic: '經濟部',
    labor: '勞動部',
    health: '衛福部',
    environment: '環境部'
  };
  
  // 創建餅圖數據
  const labels = [];
  const pieData = [];
  const colors = [];
  
  Object.keys(roleCounts).forEach(role => {
    labels.push(roleNames[role] || role);
    pieData.push(roleCounts[role]);
    colors.push(CHART_COLORS[role]);
  });
  
  return {
    labels: labels,
    data: pieData,
    colors: colors
  };
}

/**
 * 初始化狀態柱狀圖
 */
function initStatusBarChart(data) {
  const ctx = document.getElementById('statusBarChart').getContext('2d');
  
  // 處理柱狀圖數據
  const barData = processStatusBarData(data);
  
  // 創建狀態柱狀圖
  window.dashboardCharts.statusBarChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: barData.labels,
      datasets: [
        {
          label: '活躍帳號',
          data: barData.active,
          backgroundColor: CHART_COLORS.active,
          borderColor: CHART_COLORS.active,
          borderWidth: 1
        },
        {
          label: '非活躍帳號',
          data: barData.inactive,
          backgroundColor: CHART_COLORS.inactive,
          borderColor: CHART_COLORS.inactive,
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            padding: 20,
            usePointStyle: true,
            color: getComputedStyle(document.body).getPropertyValue('--text-primary')
          }
        },
        tooltip: {
          backgroundColor: getComputedStyle(document.body).getPropertyValue('--bg-secondary'),
          titleColor: getComputedStyle(document.body).getPropertyValue('--text-primary'),
          bodyColor: getComputedStyle(document.body).getPropertyValue('--text-primary'),
          borderColor: getComputedStyle(document.body).getPropertyValue('--border-color'),
          borderWidth: 1,
          padding: 12,
          cornerRadius: 6,
          titleFont: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false,
            color: getComputedStyle(document.body).getPropertyValue('--chart-grid')
          },
          ticks: {
            color: getComputedStyle(document.body).getPropertyValue('--text-secondary')
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: getComputedStyle(document.body).getPropertyValue('--chart-grid')
          },
          ticks: {
            precision: 0,
            color: getComputedStyle(document.body).getPropertyValue('--text-secondary')
          }
        }
      },
      barPercentage: 0.7,
      categoryPercentage: 0.7
    }
  });
}

/**
 * 更新狀態柱狀圖
 */
function updateStatusBarChart(data) {
  // 處理柱狀圖數據
  const barData = processStatusBarData(data);
  
  // 更新圖表數據
  const chart = window.dashboardCharts.statusBarChart;
  chart.data.labels = barData.labels;
  chart.data.datasets[0].data = barData.active;
  chart.data.datasets[1].data = barData.inactive;
  chart.update();
}

/**
 * 處理狀態柱狀圖數據
 */
function processStatusBarData(data) {
  // 獲取角色的中文名稱
  const roleNames = {
    fire: '消防單位',
    economic: '經濟部',
    labor: '勞動部',
    health: '衛福部',
    environment: '環境部'
  };
  
  // 按角色和狀態統計帳號數量
  const statusByRole = {};
  
  data.forEach(item => {
    if (!statusByRole[item.role]) {
      statusByRole[item.role] = {
        active: 0,
        inactive: 0
      };
    }
    
    statusByRole[item.role][item.status]++;
  });
  
  // 創建柱狀圖數據
  const labels = [];
  const activeData = [];
  const inactiveData = [];
  
  Object.keys(statusByRole).forEach(role => {
    labels.push(roleNames[role] || role);
    activeData.push(statusByRole[role].active);
    inactiveData.push(statusByRole[role].inactive);
  });
  
  return {
    labels: labels,
    active: activeData,
    inactive: inactiveData
  };
}

/**
 * 處理圖表響應式調整
 */
function handleChartResize() {
  // 監聽窗口調整事件
  let resizeTimer;
  window.addEventListener('resize', function() {
    // 清除之前的定時器
    clearTimeout(resizeTimer);
    
    // 設置新的定時器，並且只調用一次更新
    resizeTimer = setTimeout(function() {
      if (window.dashboardCharts) {
        Object.values(window.dashboardCharts).forEach(chart => {
          if (chart && typeof chart.update === 'function') {
            chart.update('none'); // 使用 'none' 禁用動畫，提高性能
          }
        });
      }
    }, 300); // 增加延遲以減少頻繁更新
  });
} 