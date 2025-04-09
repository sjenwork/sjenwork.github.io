/**
 * 化學雲帳號統計儀表板
 * 主要JavaScript文件 - 處理用戶交互、主題切換和數據管理
 */

// 當DOM加載完成後執行
document.addEventListener('DOMContentLoaded', function() {
  // 初始化主題設置
  initTheme();
  
  // 初始化日期範圍選擇器
  initDateRangePicker();
  
  // 初始化角色篩選器
  initRoleFilter();
  
  // 初始化儲存儀表板功能
  initSaveDashboard();
  
  // 綁定篩選按鈕事件
  bindFilterEvents();
  
  // 生成模擬數據
  const mockData = generateMockData();
  
  // 初始化儀表板數據
  initDashboard(mockData);
  
  // 初始化全螢幕功能
  initFullscreenFeature();
  
  // 初始化頁籤功能
  initDashboardTabs();
});

/**
 * 初始化主題設置
 */
function initTheme() {
  const themeToggle = document.getElementById('themeToggle');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  
  // 檢查本地存儲中的主題設置或系統偏好
  const currentTheme = localStorage.getItem('theme') || (prefersDarkScheme.matches ? 'dark' : 'light');
  
  // 應用當前主題
  document.body.className = currentTheme + '-mode';
  
  if (currentTheme === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
    themeToggle.innerHTML = '<i class="bi bi-sun-fill"></i>';
  } else {
    document.body.removeAttribute('data-theme');
    themeToggle.innerHTML = '<i class="bi bi-moon-fill"></i>';
  }
  
  // 主題切換按鈕點擊事件
  themeToggle.addEventListener('click', function() {
    let theme;
    
    if (document.body.className === 'light-mode') {
      document.body.className = 'dark-mode';
      document.body.setAttribute('data-theme', 'dark');
      themeToggle.innerHTML = '<i class="bi bi-sun-fill"></i>';
      theme = 'dark';
    } else {
      document.body.className = 'light-mode';
      document.body.removeAttribute('data-theme');
      themeToggle.innerHTML = '<i class="bi bi-moon-fill"></i>';
      theme = 'light';
    }
    
    // 保存主題設置到本地存儲
    localStorage.setItem('theme', theme);
    
    // 重新渲染圖表以適應新主題
    updateChartsTheme();
  });
}

/**
 * 初始化日期範圍選擇器
 */
function initDateRangePicker() {
  // 獲取當前日期
  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);
  
  // 初始化日期選擇器
  flatpickr("#dateRange", {
    mode: "range",
    dateFormat: "Y-m-d",
    defaultDate: [oneMonthAgo, today],
    locale: "zh_tw",
    rangeSeparator: " 至 ",
    disableMobile: true,
    onChange: function(selectedDates, dateStr) {
      // 日期範圍變更時的處理邏輯
      console.log('日期範圍已變更:', dateStr);
    }
  });
}

/**
 * 初始化角色篩選器
 */
function initRoleFilter() {
  const roleAll = document.getElementById('roleAll');
  const roleCheckboxes = document.querySelectorAll('.role-checkbox:not(#roleAll)');
  
  // 全選按鈕邏輯
  roleAll.addEventListener('change', function() {
    roleCheckboxes.forEach(checkbox => {
      checkbox.checked = this.checked;
      checkbox.disabled = this.checked;
    });
  });
  
  // 個別角色選擇邏輯
  roleCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      // 檢查是否所有角色都被選中
      const allChecked = [...roleCheckboxes].every(cb => cb.checked);
      // 檢查是否有任何角色被選中
      const anyChecked = [...roleCheckboxes].some(cb => cb.checked);
      
      roleAll.checked = allChecked;
      
      // 如果沒有任何角色被選中，則自動選中"全部"
      if (!anyChecked) {
        roleAll.checked = true;
        roleCheckboxes.forEach(cb => {
          cb.disabled = true;
        });
      }
    });
  });
}

/**
 * 初始化儲存儀表板功能
 */
function initSaveDashboard() {
  const saveBtns = document.querySelectorAll('.save-dashboard-btn');
  const saveModal = new bootstrap.Modal(document.getElementById('saveDashboardModal'));
  const confirmSaveBtn = document.getElementById('confirmSaveDashboard');
  const savedDashboardsList = document.getElementById('savedDashboards');
  
  // 從本地存儲中加載已保存的儀表板
  loadSavedDashboards();
  
  // 儲存按鈕點擊事件
  saveBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      saveModal.show();
    });
  });
  
  // 確認儲存按鈕點擊事件
  confirmSaveBtn.addEventListener('click', function() {
    const dashboardName = document.getElementById('dashboardName').value.trim();
    const dashboardDesc = document.getElementById('dashboardDescription').value.trim();
    
    if (dashboardName) {
      // 獲取當前篩選設置
      const currentFilters = getCurrentFilters();
      
      // 創建儀表板配置對象
      const dashboardConfig = {
        id: 'dashboard_' + Date.now(),
        name: dashboardName,
        description: dashboardDesc,
        created: new Date().toISOString(),
        filters: currentFilters
      };
      
      // 保存儀表板配置
      saveDashboardConfig(dashboardConfig);
      
      // 更新儀表板列表
      addDashboardToList(dashboardConfig);
      
      // 關閉模態框並重置表單
      saveModal.hide();
      document.getElementById('dashboardName').value = '';
      document.getElementById('dashboardDescription').value = '';
    }
  });
  
  /**
   * 加載已保存的儀表板
   */
  function loadSavedDashboards() {
    const savedDashboards = JSON.parse(localStorage.getItem('savedDashboards') || '[]');
    
    // 清空現有列表
    savedDashboardsList.innerHTML = '';
    
    if (savedDashboards.length === 0) {
      const emptyItem = document.createElement('li');
      emptyItem.className = 'list-group-item text-center';
      emptyItem.textContent = '尚未儲存任何儀表板';
      savedDashboardsList.appendChild(emptyItem);
    } else {
      // 添加已保存的儀表板到列表
      savedDashboards.forEach(dashboard => {
        addDashboardToList(dashboard);
      });
    }
  }
  
  /**
   * 將儀表板添加到列表
   */
  function addDashboardToList(dashboard) {
    // 如果是第一個儀表板，清空"尚未儲存任何儀表板"的提示
    if (savedDashboardsList.querySelector('.text-center')) {
      savedDashboardsList.innerHTML = '';
    }
    
    const item = document.createElement('li');
    item.className = 'list-group-item d-flex justify-content-between align-items-center';
    item.dataset.id = dashboard.id;
    
    const content = document.createElement('div');
    content.innerHTML = `
      <h6 class="mb-0">${dashboard.name}</h6>
      ${dashboard.description ? `<small class="text-muted">${dashboard.description}</small>` : ''}
    `;
    
    const actions = document.createElement('div');
    actions.className = 'actions';
    
    const loadBtn = document.createElement('button');
    loadBtn.className = 'btn btn-sm btn-outline-primary me-1';
    loadBtn.innerHTML = '<i class="bi bi-box-arrow-in-down-left"></i>';
    loadBtn.title = '載入此儀表板';
    loadBtn.addEventListener('click', function() {
      loadDashboard(dashboard);
    });
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-sm btn-outline-danger';
    deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
    deleteBtn.title = '刪除此儀表板';
    deleteBtn.addEventListener('click', function() {
      deleteDashboard(dashboard.id);
    });
    
    actions.appendChild(loadBtn);
    actions.appendChild(deleteBtn);
    
    item.appendChild(content);
    item.appendChild(actions);
    
    savedDashboardsList.appendChild(item);
  }
  
  /**
   * 保存儀表板配置
   */
  function saveDashboardConfig(config) {
    const savedDashboards = JSON.parse(localStorage.getItem('savedDashboards') || '[]');
    savedDashboards.push(config);
    localStorage.setItem('savedDashboards', JSON.stringify(savedDashboards));
  }
  
  /**
   * 刪除儀表板
   */
  function deleteDashboard(id) {
    let savedDashboards = JSON.parse(localStorage.getItem('savedDashboards') || '[]');
    savedDashboards = savedDashboards.filter(dashboard => dashboard.id !== id);
    localStorage.setItem('savedDashboards', JSON.stringify(savedDashboards));
    
    // 從列表中移除
    const item = savedDashboardsList.querySelector(`[data-id="${id}"]`);
    if (item) {
      item.remove();
    }
    
    // 如果沒有儀表板了，顯示提示
    if (savedDashboards.length === 0) {
      const emptyItem = document.createElement('li');
      emptyItem.className = 'list-group-item text-center';
      emptyItem.textContent = '尚未儲存任何儀表板';
      savedDashboardsList.appendChild(emptyItem);
    }
  }
  
  /**
   * 載入儀表板
   */
  function loadDashboard(dashboard) {
    // 應用儀表板的篩選設置
    applyFilters(dashboard.filters);
    
    // 顯示提示消息
    showToast(`已載入儀表板: ${dashboard.name}`);
  }
}

/**
 * 獲取當前篩選設置
 */
function getCurrentFilters() {
  return {
    dateRange: document.getElementById('dateRange').value,
    timeGranularity: document.getElementById('timeGranularity').value,
    accountStatus: document.getElementById('accountStatus').value,
    roles: getSelectedRoles()
  };
}

/**
 * 獲取選中的角色
 */
function getSelectedRoles() {
  const roles = [];
  const roleAll = document.getElementById('roleAll');
  
  if (roleAll.checked) {
    return ['all'];
  }
  
  document.querySelectorAll('.role-checkbox:not(#roleAll):checked').forEach(checkbox => {
    roles.push(checkbox.value);
  });
  
  return roles;
}

/**
 * 應用篩選設置
 */
function applyFilters(filters) {
  // 設置日期範圍
  if (filters.dateRange) {
    const dateRangePicker = document.getElementById('dateRange')._flatpickr;
    const dates = filters.dateRange.split(' 至 ');
    if (dates.length === 2) {
      dateRangePicker.setDate([new Date(dates[0]), new Date(dates[1])]);
    }
  }
  
  // 設置時間粒度
  if (filters.timeGranularity) {
    document.getElementById('timeGranularity').value = filters.timeGranularity;
  }
  
  // 設置帳號狀態
  if (filters.accountStatus) {
    document.getElementById('accountStatus').value = filters.accountStatus;
  }
  
  // 設置角色
  const roleAll = document.getElementById('roleAll');
  const roleCheckboxes = document.querySelectorAll('.role-checkbox:not(#roleAll)');
  
  if (filters.roles.includes('all')) {
    roleAll.checked = true;
    roleCheckboxes.forEach(checkbox => {
      checkbox.checked = false;
      checkbox.disabled = true;
    });
  } else {
    roleAll.checked = false;
    roleCheckboxes.forEach(checkbox => {
      checkbox.disabled = false;
      checkbox.checked = filters.roles.includes(checkbox.value);
    });
  }
  
  // 更新儀表板數據
  updateDashboard();
}

/**
 * 綁定篩選按鈕事件
 */
function bindFilterEvents() {
  const applyFiltersBtn = document.getElementById('applyFilters');
  const resetFiltersBtn = document.getElementById('resetFilters');
  
  // 套用篩選按鈕點擊事件
  applyFiltersBtn.addEventListener('click', function() {
    updateDashboard();
  });
  
  // 重置篩選按鈕點擊事件
  resetFiltersBtn.addEventListener('click', function() {
    resetFilters();
  });
}

/**
 * 重置篩選設置
 */
function resetFilters() {
  // 重置日期範圍
  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);
  document.getElementById('dateRange')._flatpickr.setDate([oneMonthAgo, today]);
  
  // 重置時間粒度
  document.getElementById('timeGranularity').value = 'month';
  
  // 重置帳號狀態
  document.getElementById('accountStatus').value = 'all';
  
  // 重置角色
  const roleAll = document.getElementById('roleAll');
  const roleCheckboxes = document.querySelectorAll('.role-checkbox:not(#roleAll)');
  
  roleAll.checked = true;
  roleCheckboxes.forEach(checkbox => {
    checkbox.checked = false;
    checkbox.disabled = true;
  });
  
  // 更新儀表板數據
  updateDashboard();
}

/**
 * 初始化儀表板數據
 */
function initDashboard(data) {
  // 更新統計卡片
  updateStatCards(data);
  
  // 初始化並更新圖表
  initCharts(data);
  
  // 初始化並更新地圖
  initMap(data);
}

/**
 * 更新儀表板數據
 */
function updateDashboard() {
  // 獲取篩選後的數據
  const filteredData = getFilteredData();
  
  // 更新統計卡片
  updateStatCards(filteredData);
  
  // 更新圖表
  updateCharts(filteredData);
  
  // 更新地圖
  updateMap(filteredData);
}

/**
 * 根據篩選條件獲取數據
 */
function getFilteredData() {
  // 獲取原始數據 - 只生成一次數據，避免每次都產生新的隨機數據
  if (!window.cachedMockData) {
    window.cachedMockData = generateMockData();
  }
  const data = window.cachedMockData;
  
  // 獲取篩選條件
  const dateRange = document.getElementById('dateRange').value;
  const timeGranularity = document.getElementById('timeGranularity').value;
  const accountStatus = document.getElementById('accountStatus').value;
  const selectedRoles = getSelectedRoles();
  
  // 解析日期範圍
  const dates = dateRange.split(' 至 ');
  const startDate = dates.length === 2 ? new Date(dates[0]) : null;
  const endDate = dates.length === 2 ? new Date(dates[1]) : null;
  
  // 篩選數據
  return data.filter(item => {
    const itemDate = new Date(item.date);
    
    // 日期範圍篩選
    if (startDate && endDate) {
      if (itemDate < startDate || itemDate > endDate) {
        return false;
      }
    }
    
    // 帳號狀態篩選
    if (accountStatus !== 'all' && item.status !== accountStatus) {
      return false;
    }
    
    // 角色篩選
    if (!selectedRoles.includes('all') && !selectedRoles.includes(item.role)) {
      return false;
    }
    
    return true;
  });
}

/**
 * 更新統計卡片
 */
function updateStatCards(data) {
  // 計算總帳號數
  const totalAccounts = data.length;
  document.getElementById('totalAccounts').textContent = totalAccounts.toLocaleString();
  
  // 計算活躍帳號數
  const activeAccounts = data.filter(item => item.status === 'active').length;
  document.getElementById('activeAccounts').textContent = activeAccounts.toLocaleString();
  
  // 計算本期新增數
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newAccounts = data.filter(item => new Date(item.createdAt) > thirtyDaysAgo).length;
  document.getElementById('newAccounts').textContent = newAccounts.toLocaleString();
  
  // 計算角色分布
  const roleCounts = {};
  data.forEach(item => {
    roleCounts[item.role] = (roleCounts[item.role] || 0) + 1;
  });
  
  // 找出最多的角色
  let topRole = '';
  let topCount = 0;
  
  for (const role in roleCounts) {
    if (roleCounts[role] > topCount) {
      topCount = roleCounts[role];
      topRole = role;
    }
  }
  
  // 獲取角色的中文名稱
  const roleNames = {
    fire: '消防單位',
    economic: '經濟部',
    labor: '勞動部',
    health: '衛福部',
    environment: '環境部'
  };
  
  // 更新主要角色
  document.getElementById('topRole').textContent = roleNames[topRole] || topRole;
  
  // 計算百分比
  const percentage = totalAccounts > 0 ? Math.round((topCount / totalAccounts) * 100) : 0;
  document.getElementById('topRolePercentage').textContent = `${percentage}%`;
  
  // 計算各種增長率
  calculateGrowthRates(data);
}

/**
 * 計算增長率
 */
function calculateGrowthRates(data) {
  // 獲取當前日期範圍
  const dateRange = document.getElementById('dateRange').value;
  const dates = dateRange.split(' 至 ');
  
  if (dates.length === 2) {
    const startDate = new Date(dates[0]);
    const endDate = new Date(dates[1]);
    
    // 計算當前期間的天數
    const currentPeriodDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    // 計算上一個期間的日期範圍
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - currentPeriodDays);
    
    // 篩選當前期間和上一期間的數據
    const currentPeriodData = data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= endDate;
    });
    
    const previousPeriodData = data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= previousPeriodStart && itemDate < startDate;
    });
    
    // 計算總帳號增長率
    const currentTotal = currentPeriodData.length;
    const previousTotal = previousPeriodData.length;
    const totalGrowth = previousTotal > 0 ? Math.round(((currentTotal - previousTotal) / previousTotal) * 100) : 100;
    
    // 計算活躍帳號增長率
    const currentActive = currentPeriodData.filter(item => item.status === 'active').length;
    const previousActive = previousPeriodData.filter(item => item.status === 'active').length;
    const activeGrowth = previousActive > 0 ? Math.round(((currentActive - previousActive) / previousActive) * 100) : 100;
    
    // 計算新增帳號增長率
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const currentNew = currentPeriodData.filter(item => new Date(item.createdAt) > thirtyDaysAgo).length;
    const previousNew = previousPeriodData.filter(item => {
      const createdAt = new Date(item.createdAt);
      const periodEndDate = new Date(startDate);
      periodEndDate.setDate(periodEndDate.getDate() - 30);
      return createdAt > periodEndDate && createdAt <= startDate;
    }).length;
    
    const newGrowth = previousNew > 0 ? Math.round(((currentNew - previousNew) / previousNew) * 100) : 100;
    
    // 更新增長率顯示
    document.getElementById('accountGrowth').textContent = `${totalGrowth >= 0 ? '+' : ''}${totalGrowth}%`;
    document.getElementById('accountGrowth').className = totalGrowth >= 0 ? 'text-success' : 'text-danger';
    
    document.getElementById('activeGrowth').textContent = `${activeGrowth >= 0 ? '+' : ''}${activeGrowth}%`;
    document.getElementById('activeGrowth').className = activeGrowth >= 0 ? 'text-success' : 'text-danger';
    
    document.getElementById('newAccountsGrowth').textContent = `${newGrowth >= 0 ? '+' : ''}${newGrowth}%`;
    document.getElementById('newAccountsGrowth').className = newGrowth >= 0 ? 'text-success' : 'text-danger';
  }
}

/**
 * 更新圖表主題
 */
function updateChartsTheme() {
  // 獲取所有已初始化的圖表實例
  if (window.dashboardCharts) {
    // 更新每個圖表的主題
    for (const chartId in window.dashboardCharts) {
      const chart = window.dashboardCharts[chartId];
      
      // 更新網格線顏色
      if (chart.options.scales) {
        if (chart.options.scales.x) {
          chart.options.scales.x.grid.color = getComputedStyle(document.body).getPropertyValue('--chart-grid');
          chart.options.scales.x.ticks.color = getComputedStyle(document.body).getPropertyValue('--text-secondary');
        }
        
        if (chart.options.scales.y) {
          chart.options.scales.y.grid.color = getComputedStyle(document.body).getPropertyValue('--chart-grid');
          chart.options.scales.y.ticks.color = getComputedStyle(document.body).getPropertyValue('--text-secondary');
        }
      }
      
      // 更新標題顏色
      if (chart.options.plugins && chart.options.plugins.title) {
        chart.options.plugins.title.color = getComputedStyle(document.body).getPropertyValue('--text-primary');
      }
      
      // 更新圖例顏色
      if (chart.options.plugins && chart.options.plugins.legend) {
        chart.options.plugins.legend.labels.color = getComputedStyle(document.body).getPropertyValue('--text-primary');
      }
      
      // 更新刻度線顏色
      if (chart.options.scales) {
        for (const scaleId in chart.options.scales) {
          const scale = chart.options.scales[scaleId];
          scale.ticks.color = getComputedStyle(document.body).getPropertyValue('--text-secondary');
        }
      }
      
      chart.update();
    }
  }
  
  // 如果有地圖，也更新地圖樣式
  if (window.taiwanMap) {
    updateMapTheme();
  }
}

/**
 * 生成模擬數據
 */
function generateMockData() {
  const data = [];
  const roles = ['fire', 'economic', 'labor', 'health', 'environment'];
  const cities = [
    '臺北市', '新北市', '桃園市', '臺中市', '臺南市', 
    '高雄市', '基隆市', '新竹市', '嘉義市', '新竹縣', 
    '苗栗縣', '彰化縣', '南投縣', '雲林縣', '嘉義縣', 
    '屏東縣', '宜蘭縣', '花蓮縣', '臺東縣', '澎湖縣', 
    '金門縣', '連江縣'
  ];
  
  // 計算兩年前的日期
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 2);
  
  // 生成1000筆模擬數據
  for (let i = 0; i < 1000; i++) {
    // 隨機選擇角色
    const role = roles[Math.floor(Math.random() * roles.length)];
    
    // 隨機選擇位置
    const location = cities[Math.floor(Math.random() * cities.length)];
    
    // 隨機生成創建日期（過去兩年內）
    const createdAt = new Date(startDate.getTime() + Math.random() * (Date.now() - startDate.getTime()));
    
    // 隨機生成更新日期（介於創建日期和當前日期之間）
    const updatedAt = new Date(createdAt.getTime() + Math.random() * (Date.now() - createdAt.getTime()));
    
    // 75%的機率是活躍帳號
    const status = Math.random() < 0.75 ? 'active' : 'inactive';
    
    // 添加到數據集
    data.push({
      id: `account_${i + 1}`,
      role: role,
      location: location,
      status: status,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
      lastActive: status === 'active' ? new Date(updatedAt.getTime() + Math.random() * (Date.now() - updatedAt.getTime())).toISOString() : updatedAt.toISOString(),
      date: createdAt.toISOString().split('T')[0]
    });
  }
  
  return data;
}

/**
 * 顯示提示消息
 */
function showToast(message) {
  // 創建toast元素
  const toastContainer = document.createElement('div');
  toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
  toastContainer.style.zIndex = '1070';
  
  const toastEl = document.createElement('div');
  toastEl.className = 'toast';
  toastEl.innerHTML = `
    <div class="toast-header">
      <strong class="me-auto">系統提示</strong>
      <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">
      ${message}
    </div>
  `;
  
  toastContainer.appendChild(toastEl);
  document.body.appendChild(toastContainer);
  
  // 初始化toast
  const toast = new bootstrap.Toast(toastEl, {
    delay: 3000
  });
  
  // 顯示toast
  toast.show();
  
  // Toast消失後移除元素
  toastEl.addEventListener('hidden.bs.toast', function() {
    document.body.removeChild(toastContainer);
  });
}

/**
 * 全螢幕功能相關處理
 */

// 初始化全螢幕功能
function initFullscreenFeature() {
  // 獲取所有全螢幕按鈕
  const fullscreenBtns = document.querySelectorAll('.fullscreen-btn');
  const fullscreenModal = document.getElementById('fullscreenModal');
  const closeFullscreenBtn = document.querySelector('.close-fullscreen');
  const fullscreenTitle = document.getElementById('fullscreenTitle');
  const fullscreenContent = document.getElementById('fullscreenContent');
  
  // 為每個全螢幕按鈕添加點擊事件
  fullscreenBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // 判斷是否是統計卡片
      const isStatCard = this.closest('.stat-card') !== null;
      
      if (isStatCard) {
        // 處理統計卡片的全螢幕顯示
        const statCard = this.closest('.stat-card');
        const cardTitle = statCard.querySelector('.card-title').textContent;
        fullscreenTitle.textContent = cardTitle;
        
        // 清空之前的內容
        fullscreenContent.innerHTML = '';
        
        // 創建詳細資訊容器
        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'stat-details-container p-4';
        
        // 獲取統計資訊
        const statValue = statCard.querySelector('h3').textContent;
        const growthInfo = statCard.querySelector('.growth-info').textContent.trim();
        const iconClass = statCard.querySelector('.stat-icon i').className;
        
        // 創建詳細資訊內容
        detailsContainer.innerHTML = `
          <div class="stat-details text-center mb-5">
            <div class="stat-icon-large mb-4">
              <i class="${iconClass}" style="font-size: 5rem; opacity: 0.7;"></i>
            </div>
            <h1 class="display-1 mb-3">${statValue}</h1>
            <p class="fs-4">${growthInfo}</p>
          </div>
          
          <div class="row">
            <div class="col-md-8 mx-auto" style="height: 400px; position: relative;">
              <canvas id="fullscreenTrendChart" style="width: 100%; height: 100%;"></canvas>
            </div>
          </div>
        `;
        
        fullscreenContent.appendChild(detailsContainer);
        
        // 創建趨勢圖 - 使用模擬數據
        setTimeout(() => {
          try {
            // 確保canvas元素存在
            const trendChartEl = document.getElementById('fullscreenTrendChart');
            if (!trendChartEl) {
              console.error('無法找到趨勢圖canvas元素');
              return;
            }
            
            // 根據卡片類型獲取相關數據
            const cardType = cardTitle;
            let chartData = [];
            let chartLabels = [];
            let chartColor = '';
            
            // 生成過去12個月的標籤
            const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
            const currentMonth = new Date().getMonth();
            
            for (let i = 11; i >= 0; i--) {
              const monthIndex = (currentMonth - i + 12) % 12;
              chartLabels.push(months[monthIndex]);
            }
            
            // 根據卡片類型生成不同的模擬數據和顏色
            if (cardTitle === '總帳號數') {
              chartData = [620, 640, 660, 700, 720, 740, 780, 820, 840, 880, 920, 950];
              chartColor = '#4e73df';
            } else if (cardTitle === '活躍帳號') {
              chartData = [450, 465, 480, 510, 525, 540, 575, 600, 615, 640, 675, 700];
              chartColor = '#1cc88a';
            } else if (cardTitle === '本期新增') {
              chartData = [20, 25, 30, 40, 35, 30, 45, 50, 40, 45, 55, 65];
              chartColor = '#36b9cc';
            } else if (cardTitle === '主要角色') {
              chartData = [30, 32, 35, 38, 40, 42, 45, 48, 50, 52, 55, 58];
              chartColor = '#f6c23e';
            }
            
            // 創建趨勢圖
            new Chart(trendChartEl.getContext('2d'), {
              type: 'line',
              data: {
                labels: chartLabels,
                datasets: [{
                  label: cardTitle + '趨勢',
                  data: chartData,
                  backgroundColor: hexToRgba(chartColor, 0.1),
                  borderColor: chartColor,
                  borderWidth: 3,
                  pointBackgroundColor: chartColor,
                  pointBorderColor: '#fff',
                  pointBorderWidth: 2,
                  pointRadius: 6,
                  pointHoverRadius: 8,
                  fill: true,
                  tension: 0.3
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
                      font: {
                        size: 16
                      }
                    }
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                      size: 16
                    },
                    bodyFont: {
                      size: 14
                    },
                    titleMarginBottom: 10,
                    padding: 15,
                    displayColors: false
                  }
                },
                scales: {
                  x: {
                    grid: {
                      display: false
                    },
                    ticks: {
                      font: {
                        size: 14
                      }
                    }
                  },
                  y: {
                    grid: {
                      borderDash: [3, 3]
                    },
                    beginAtZero: true,
                    ticks: {
                      font: {
                        size: 14
                      }
                    }
                  }
                }
              }
            });
          } catch (error) {
            console.error('創建全螢幕趨勢圖時發生錯誤:', error);
          }
        }, 100);
      } else {
        // 獲取卡片標題
        const cardHeader = this.closest('.card-header');
        const cardTitle = cardHeader.querySelector('h5').textContent;
        fullscreenTitle.textContent = cardTitle;
        
        // 獲取卡片內容
        const cardBody = this.closest('.card').querySelector('.card-body');
        const chartId = cardBody.querySelector('canvas')?.id || cardBody.querySelector('.taiwan-map')?.id;
        
        // 清空之前的內容
        fullscreenContent.innerHTML = '';
        
        // 複製對應的圖表到全螢幕模態框
        if (chartId) {
          const isMap = chartId === 'taiwanMap';
          
          if (isMap) {
            // 對於地圖，創建新的容器
            const mapContainer = document.createElement('div');
            mapContainer.id = 'fullscreenMap';
            mapContainer.className = 'taiwan-map';
            fullscreenContent.appendChild(mapContainer);
            
            // 複製地圖到全螢幕容器
            const data = window.cachedMockData || [];
            const filteredData = getFilteredData(data);
            
            // 創建新的地圖實例
            setTimeout(() => {
              try {
                // 確保地圖容器存在
                const fullscreenMapEl = document.getElementById('fullscreenMap');
                if (!fullscreenMapEl) {
                  console.error('無法找到地圖容器元素');
                  return;
                }
                
                const fullscreenMap = L.map('fullscreenMap', {
                  center: [23.6978, 120.9605],
                  zoom: 7.5,
                  minZoom: 7,
                  maxZoom: 11
                });
                
                // 設置地圖瓦片圖層
                const isDarkMode = document.body.getAttribute('data-theme') === 'dark';
                const tileLayer = isDarkMode 
                  ? L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                      subdomains: 'abcd',
                      maxZoom: 20
                    })
                  : L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                      maxZoom: 19
                    });
                
                tileLayer.addTo(fullscreenMap);
                
                // 處理地圖數據
                if (typeof processMapData === 'function') {
                  processMapData(filteredData);
                } else {
                  console.error('找不到 processMapData 函數');
                  return;
                }
                
                // 創建標記圖層組
                const fullscreenMarkersLayer = L.layerGroup().addTo(fullscreenMap);
                
                // 添加標記
                if (typeof mapData !== 'undefined' && mapData && mapData.features) {
                  // 使用與原始地圖相同的添加標記邏輯
                  const cities = {
                    '臺北市': [25.0598, 121.5598],
                    '新北市': [24.9312, 121.6739],
                    '桃園市': [24.9936, 121.3010],
                    '臺中市': [24.1383, 120.6839],
                    '臺南市': [22.9908, 120.2133],
                    '高雄市': [22.6273, 120.3133],
                    '基隆市': [25.1288, 121.7414],
                    '新竹市': [24.8138, 120.9647],
                    '嘉義市': [23.4801, 120.4473],
                    '新竹縣': [24.7384, 121.1252],
                    '苗栗縣': [24.5602, 120.8202],
                    '彰化縣': [24.0517, 120.5415],
                    '南投縣': [23.8310, 120.9876],
                    '雲林縣': [23.7092, 120.5249],
                    '嘉義縣': [23.4518, 120.3897],
                    '屏東縣': [22.5520, 120.4473],
                    '宜蘭縣': [24.7008, 121.7195],
                    '花蓮縣': [23.9966, 121.6010],
                    '臺東縣': [22.7583, 121.1150],
                    '澎湖縣': [23.5713, 119.5793],
                    '金門縣': [24.4493, 118.3186],
                    '連江縣': [26.1521, 119.9512]
                  };
                  
                  mapData.features.forEach(feature => {
                    if (feature && feature.properties) {
                      const city = feature.properties.city;
                      const count = feature.properties.count;
                      const color = feature.properties.color;
                      
                      try {
                        const roleData = feature.properties.roleData ? 
                          JSON.parse(feature.properties.roleData) : [];
                          
                        if (cities[city]) {
                          const [lat, lng] = cities[city];
                          
                          // 全螢幕模式下標記大小略大
                          const markerSize = Math.max(30, Math.sqrt(count) * 5);
                          
                          const markerIcon = L.divIcon({
                            className: 'custom-marker',
                            html: `<div style="
                              background-color: ${color}; 
                              width: ${markerSize}px; 
                              height: ${markerSize}px; 
                              border-radius: 50%; 
                              display: flex; 
                              align-items: center; 
                              justify-content: center;
                              border: 2px solid white;
                              box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
                              font-weight: bold;
                              color: white;
                              font-size: ${Math.max(12, Math.min(16, count.toString().length > 2 ? 12 : 14))}px;
                            ">${count}</div>`,
                            iconSize: [markerSize, markerSize],
                            iconAnchor: [markerSize/2, markerSize/2]
                          });
                          
                          const marker = L.marker([lat, lng], { icon: markerIcon });
                          
                          if (typeof createPopupContent === 'function') {
                            marker.bindPopup(createPopupContent(city, roleData), {
                              maxWidth: 300
                            });
                            
                            marker.on('mouseover', function() {
                              this.openPopup();
                            });
                            
                            fullscreenMarkersLayer.addLayer(marker);
                          } else {
                            console.error('找不到 createPopupContent 函數');
                          }
                        }
                      } catch (error) {
                        console.error('處理地圖標記時發生錯誤:', error);
                      }
                    }
                  });
                } else {
                  console.error('地圖數據不存在或格式不正確');
                }
                
                // 調整地圖視圖到台灣範圍
                fullscreenMap.fitBounds([
                  [21.5, 118.0], // 西南角 
                  [25.5, 122.5]  // 東北角
                ]);
                
              } catch (error) {
                console.error('創建全螢幕地圖時發生錯誤:', error);
              }
            }, 100);
          } else {
            // 對於其他圖表，創建新的canvas
            const canvas = document.createElement('canvas');
            canvas.id = 'fullscreen' + chartId;
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            
            // 创建容器包裹canvas，确保尺寸正确
            const chartContainer = document.createElement('div');
            chartContainer.style.width = '100%';
            chartContainer.style.height = '100%';
            chartContainer.style.position = 'relative';
            
            chartContainer.appendChild(canvas);
            fullscreenContent.appendChild(chartContainer);
            
            // 複製圖表到全螢幕容器
            const originalChart = Chart.getChart(chartId);
            if (originalChart) {
              // 獲取原始圖表的配置
              const originalConfig = originalChart.config;
              
              // 在配置中調整大小相關設定
              const newConfig = JSON.parse(JSON.stringify(originalConfig));
              
              // 確保options對象存在
              if (!newConfig.options) {
                newConfig.options = {};
              }
              
              // 修改配置以適應全螢幕
              if (newConfig.options.maintainAspectRatio !== false) {
                newConfig.options.maintainAspectRatio = false;
              }
              
              if (newConfig.options.responsive !== true) {
                newConfig.options.responsive = true;
              }
              
              // 增加字體大小
              if (newConfig.options.plugins && newConfig.options.plugins.datalabels) {
                newConfig.options.plugins.datalabels.font = {
                  size: 16
                };
              }
              
              if (newConfig.options.scales) {
                Object.values(newConfig.options.scales).forEach(scale => {
                  if (scale && scale.ticks) {
                    scale.ticks.font = {
                      size: 14
                    };
                  }
                });
              }
              
              // 創建新圖表
              setTimeout(() => {
                try {
                  const fullscreenChartCtx = document.getElementById('fullscreen' + chartId);
                  if (fullscreenChartCtx) {
                    new Chart(
                      fullscreenChartCtx.getContext('2d'),
                      newConfig
                    );
                  } else {
                    console.error('無法找到目標canvas元素：fullscreen' + chartId);
                  }
                } catch (error) {
                  console.error('創建全螢幕圖表時發生錯誤:', error);
                }
              }, 100);
            }
          }
        }
      }
      
      // 顯示全螢幕模態框
      fullscreenModal.style.display = 'block';
      document.body.style.overflow = 'hidden'; // 防止背景滾動
    });
  });
  
  // 關閉全螢幕模態框
  closeFullscreenBtn.addEventListener('click', function() {
    fullscreenModal.style.display = 'none';
    document.body.style.overflow = ''; // 恢復背景滾動
  });
  
  // 點擊ESC鍵關閉全螢幕
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && fullscreenModal.style.display === 'block') {
      fullscreenModal.style.display = 'none';
      document.body.style.overflow = '';
    }
  });
}

// 輔助函數：將十六進制顏色轉換為rgba
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * 儀表板頁籤功能相關處理
 */

// 初始化頁籤功能
function initDashboardTabs() {
  const addDashboardTabBtn = document.getElementById('addDashboardTab');
  const dashboardTabs = document.getElementById('dashboardTabs');
  const confirmAddDashboardBtn = document.getElementById('confirmAddDashboard');
  let tabCounter = 5; // 初始頁籤數量+1
  
  // 使頁籤可以拖曳重新排序
  initDraggableTabs();
  
  // 為預設頁籤添加關閉按鈕
  addCloseButtonsToTabs();
  
  // 新增儀表板按鈕點擊事件
  addDashboardTabBtn.addEventListener('click', function() {
    const addDashboardModal = new bootstrap.Modal(document.getElementById('addDashboardModal'));
    addDashboardModal.show();
  });
  
  // 確認新增儀表板按鈕點擊事件
  confirmAddDashboardBtn.addEventListener('click', function() {
    const dashboardName = document.getElementById('newDashboardName').value.trim();
    const iconClass = document.getElementById('dashboardIcon').value;
    const template = document.getElementById('dashboardTemplate').value;
    
    if (dashboardName) {
      // 創建新頁籤
      createNewDashboardTab(dashboardName, iconClass, template);
      
      // 關閉模態框並重置表單
      bootstrap.Modal.getInstance(document.getElementById('addDashboardModal')).hide();
      document.getElementById('newDashboardName').value = '';
    }
  });
  
  /**
   * 為預設頁籤添加關閉按鈕
   */
  function addCloseButtonsToTabs() {
    const tabs = dashboardTabs.querySelectorAll('.nav-link:not(#account-tab)'); // 第一個頁籤不可關閉
    
    tabs.forEach(tab => {
      // 檢查頁籤是否已有關閉按鈕
      if (!tab.querySelector('.close-tab')) {
        const closeBtn = document.createElement('span');
        closeBtn.className = 'close-tab';
        closeBtn.innerHTML = '<i class="bi bi-x"></i>';
        closeBtn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          closeTab(tab);
        });
        
        tab.appendChild(closeBtn);
      }
    });
  }
  
  /**
   * 創建新儀表板頁籤
   */
  function createNewDashboardTab(name, iconClass, template) {
    // 生成唯一ID
    const tabId = `tab-${tabCounter}`;
    const contentId = `dashboard-${tabCounter}`;
    tabCounter++;
    
    // 創建頁籤元素
    const tabItem = document.createElement('li');
    tabItem.className = 'nav-item draggable-tab';
    tabItem.setAttribute('role', 'presentation');
    
    const tabButton = document.createElement('button');
    tabButton.className = 'nav-link';
    tabButton.id = tabId;
    tabButton.setAttribute('data-bs-toggle', 'tab');
    tabButton.setAttribute('data-bs-target', `#${contentId}`);
    tabButton.setAttribute('type', 'button');
    tabButton.setAttribute('role', 'tab');
    tabButton.setAttribute('aria-controls', contentId);
    tabButton.setAttribute('aria-selected', 'false');
    tabButton.innerHTML = `<i class="bi ${iconClass} me-2"></i>${name}`;
    
    // 添加關閉按鈕
    const closeBtn = document.createElement('span');
    closeBtn.className = 'close-tab';
    closeBtn.innerHTML = '<i class="bi bi-x"></i>';
    closeBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      closeTab(tabButton);
    });
    
    tabButton.appendChild(closeBtn);
    tabItem.appendChild(tabButton);
    
    // 將新頁籤添加到頁籤列表
    const addBtnLi = dashboardTabs.querySelector('.nav-item.ms-auto');
    dashboardTabs.insertBefore(tabItem, addBtnLi);
    
    // 創建頁籤內容
    const tabContent = document.createElement('div');
    tabContent.className = 'tab-pane fade';
    tabContent.id = contentId;
    tabContent.setAttribute('role', 'tabpanel');
    tabContent.setAttribute('aria-labelledby', tabId);
    
    // 根據模板設置內容
    switch (template) {
      case 'blank':
        tabContent.innerHTML = `
          <div class="card mb-4">
            <div class="card-body text-center py-5">
              <i class="bi ${iconClass} display-1 text-muted mb-3"></i>
              <h3>${name}</h3>
              <p class="lead text-muted">這是一個空白儀表板，請開始添加您的內容。</p>
              <button class="btn btn-outline-primary mt-3">
                <i class="bi bi-plus-lg me-2"></i>添加內容
              </button>
            </div>
          </div>
        `;
        break;
      case 'account':
        // 複製帳號統計儀表板的內容
        const accountDashboard = document.getElementById('account-dashboard');
        tabContent.innerHTML = accountDashboard.innerHTML;
        break;
      case 'usage':
        tabContent.innerHTML = `
          <div class="card mb-4">
            <div class="card-body">
              <div class="row">
                <div class="col-md-4 mb-4">
                  <div class="card stat-card">
                    <div class="card-body">
                      <div class="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 class="card-title">總使用量</h6>
                          <h3 class="mb-0">1.2 TB</h3>
                        </div>
                        <div class="stat-icon">
                          <i class="bi bi-hdd-fill"></i>
                        </div>
                      </div>
                      <div class="mt-2 growth-info">
                        <span class="text-success">+5%</span> 相比上一期間
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-4 mb-4">
                  <div class="card stat-card">
                    <div class="card-body">
                      <div class="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 class="card-title">活躍用戶</h6>
                          <h3 class="mb-0">324</h3>
                        </div>
                        <div class="stat-icon">
                          <i class="bi bi-person-check-fill"></i>
                        </div>
                      </div>
                      <div class="mt-2 growth-info">
                        <span class="text-success">+12%</span> 相比上一期間
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-4 mb-4">
                  <div class="card stat-card">
                    <div class="card-body">
                      <div class="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 class="card-title">平均使用時間</h6>
                          <h3 class="mb-0">42 分鐘</h3>
                        </div>
                        <div class="stat-icon">
                          <i class="bi bi-clock-fill"></i>
                        </div>
                      </div>
                      <div class="mt-2 growth-info">
                        <span class="text-danger">-3%</span> 相比上一期間
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
        break;
      case 'security':
        tabContent.innerHTML = `
          <div class="card mb-4">
            <div class="card-body">
              <div class="row">
                <div class="col-md-4 mb-4">
                  <div class="card stat-card">
                    <div class="card-body">
                      <div class="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 class="card-title">安全評分</h6>
                          <h3 class="mb-0">85/100</h3>
                        </div>
                        <div class="stat-icon">
                          <i class="bi bi-shield-check"></i>
                        </div>
                      </div>
                      <div class="mt-2 growth-info">
                        <span class="text-success">+8 分</span> 相比上次評估
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-4 mb-4">
                  <div class="card stat-card">
                    <div class="card-body">
                      <div class="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 class="card-title">安全事件</h6>
                          <h3 class="mb-0">2</h3>
                        </div>
                        <div class="stat-icon">
                          <i class="bi bi-exclamation-triangle-fill"></i>
                        </div>
                      </div>
                      <div class="mt-2 growth-info">
                        <span class="text-success">-5</span> 相比上一期間
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-4 mb-4">
                  <div class="card stat-card">
                    <div class="card-body">
                      <div class="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 class="card-title">更新狀態</h6>
                          <h3 class="mb-0">已更新</h3>
                        </div>
                        <div class="stat-icon">
                          <i class="bi bi-check-circle-fill"></i>
                        </div>
                      </div>
                      <div class="mt-2 growth-info">
                        最近更新：<span>昨天</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
        break;
    }
    
    // 將頁籤內容添加到頁籤內容區域
    document.getElementById('dashboardTabsContent').appendChild(tabContent);
    
    // 激活新頁籤
    new bootstrap.Tab(tabButton).show();
    
    // 重新初始化拖曳功能
    initDraggableTabs();
  }
  
  /**
   * 關閉頁籤
   */
  function closeTab(tab) {
    // 獲取頁籤ID和內容ID
    const tabId = tab.id;
    const contentId = tab.getAttribute('data-bs-target').substring(1);
    
    // 如果關閉的是當前活躍頁籤，先激活第一個頁籤
    if (tab.classList.contains('active')) {
      new bootstrap.Tab(document.getElementById('account-tab')).show();
    }
    
    // 移除頁籤和內容
    tab.parentNode.remove();
    const content = document.getElementById(contentId);
    if (content) {
      content.remove();
    }
  }
  
  /**
   * 初始化拖曳功能
   */
  function initDraggableTabs() {
    const draggableTabs = document.querySelectorAll('.draggable-tab');
    
    // 這裡可以添加您的拖曳功能實現
    // 如果需要實現拖曳功能，建議使用Sortable.js等庫
    // 簡單示例：
    
    draggableTabs.forEach(tab => {
      tab.addEventListener('dragstart', handleDragStart);
      tab.addEventListener('dragover', handleDragOver);
      tab.addEventListener('drop', handleDrop);
      tab.addEventListener('dragend', handleDragEnd);
      tab.setAttribute('draggable', 'true');
    });
    
    let dragSrcEl = null;
    
    function handleDragStart(e) {
      this.style.opacity = '0.4';
      dragSrcEl = this;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', this.innerHTML);
    }
    
    function handleDragOver(e) {
      if (e.preventDefault) {
        e.preventDefault();
      }
      e.dataTransfer.dropEffect = 'move';
      return false;
    }
    
    function handleDrop(e) {
      if (e.stopPropagation) {
        e.stopPropagation();
      }
      
      if (dragSrcEl !== this) {
        // 確保不將頁籤拖到"新增"按鈕之後
        if (!this.classList.contains('ms-auto')) {
          // 交換頁籤的HTML內容和屬性
          const tempInnerHTML = this.innerHTML;
          const tempId = this.querySelector('button').id;
          const tempTarget = this.querySelector('button').getAttribute('data-bs-target');
          const tempControls = this.querySelector('button').getAttribute('aria-controls');
          
          this.innerHTML = dragSrcEl.innerHTML;
          this.querySelector('button').id = dragSrcEl.querySelector('button').id;
          this.querySelector('button').setAttribute('data-bs-target', dragSrcEl.querySelector('button').getAttribute('data-bs-target'));
          this.querySelector('button').setAttribute('aria-controls', dragSrcEl.querySelector('button').getAttribute('aria-controls'));
          
          dragSrcEl.innerHTML = tempInnerHTML;
          dragSrcEl.querySelector('button').id = tempId;
          dragSrcEl.querySelector('button').setAttribute('data-bs-target', tempTarget);
          dragSrcEl.querySelector('button').setAttribute('aria-controls', tempControls);
          
          // 重新綁定關閉按鈕事件
          const closeBtn = this.querySelector('.close-tab');
          if (closeBtn) {
            const tabButton = this.querySelector('button');
            closeBtn.addEventListener('click', function(e) {
              e.preventDefault();
              e.stopPropagation();
              closeTab(tabButton);
            });
          }
          
          const srcCloseBtn = dragSrcEl.querySelector('.close-tab');
          if (srcCloseBtn) {
            const srcTabButton = dragSrcEl.querySelector('button');
            srcCloseBtn.addEventListener('click', function(e) {
              e.preventDefault();
              e.stopPropagation();
              closeTab(srcTabButton);
            });
          }
        }
      }
      
      return false;
    }
    
    function handleDragEnd(e) {
      draggableTabs.forEach(function(tab) {
        tab.style.opacity = '1';
      });
    }
  }
}

/**
 * 切換深色/淺色模式
 */
function toggleDarkMode() {
    const body = document.body;
    const isDarkMode = body.classList.toggle('dark-mode');
    
    // 保存用戶偏好設置
    localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
    
    // 更新導航欄按鈕圖標
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        const icon = darkModeToggle.querySelector('i');
        if (icon) {
            if (isDarkMode) {
                icon.classList.replace('bi-moon', 'bi-sun');
            } else {
                icon.classList.replace('bi-sun', 'bi-moon');
            }
        }
    }
    
    // 更新圖表顏色
    updateChartsForDarkMode(isDarkMode);
    
    // 更新硬碟健康狀態卡片
    updateDiskHealthColors(isDarkMode);
    
    // 更新服務器狀態詳情
    updateServerStatusColors(isDarkMode);
    
    // 更新使用者習慣摘要
    updateUserHabitColors(isDarkMode);
    
    // 更新安全事件顏色
    updateSecurityEventColors(isDarkMode);
}

/**
 * 根據深色模式更新圖表顏色
 */
function updateChartsForDarkMode(isDarkMode) {
    // 獲取頁面上所有Chart.js實例
    if (window.Chart && Chart.instances) {
        Object.values(Chart.instances).forEach(chart => {
            if (chart.config && chart.config.options) {
                // 更新圖表網格線顏色
                if (chart.config.options.scales) {
                    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
                    const fontColor = isDarkMode ? '#e2e8f0' : '#666';
                    
                    // 更新X軸
                    if (chart.config.options.scales.x) {
                        chart.config.options.scales.x.grid = chart.config.options.scales.x.grid || {};
                        chart.config.options.scales.x.grid.color = gridColor;
                        chart.config.options.scales.x.ticks = chart.config.options.scales.x.ticks || {};
                        chart.config.options.scales.x.ticks.color = fontColor;
                    }
                    
                    // 更新Y軸
                    if (chart.config.options.scales.y) {
                        chart.config.options.scales.y.grid = chart.config.options.scales.y.grid || {};
                        chart.config.options.scales.y.grid.color = gridColor;
                        chart.config.options.scales.y.ticks = chart.config.options.scales.y.ticks || {};
                        chart.config.options.scales.y.ticks.color = fontColor;
                    }
                }
                
                // 更新標題顏色
                if (chart.config.options.plugins && chart.config.options.plugins.title) {
                    chart.config.options.plugins.title.color = isDarkMode ? '#e2e8f0' : '#666';
                }
                
                // 更新圖例顏色
                if (chart.config.options.plugins && chart.config.options.plugins.legend) {
                    chart.config.options.plugins.legend.labels = chart.config.options.plugins.legend.labels || {};
                    chart.config.options.plugins.legend.labels.color = isDarkMode ? '#e2e8f0' : '#666';
                }
                
                // 更新提示框
                if (chart.config.options.plugins && chart.config.options.plugins.tooltip) {
                    chart.config.options.plugins.tooltip.backgroundColor = isDarkMode ? '#1a202c' : 'rgba(0, 0, 0, 0.7)';
                    chart.config.options.plugins.tooltip.titleColor = isDarkMode ? '#e2e8f0' : '#fff';
                    chart.config.options.plugins.tooltip.bodyColor = isDarkMode ? '#e2e8f0' : '#fff';
                    chart.config.options.plugins.tooltip.borderColor = isDarkMode ? '#4a5568' : 'rgba(0, 0, 0, 0.1)';
                }
                
                // 更新數據標籤顏色
                if (chart.config.options.plugins && chart.config.options.plugins.datalabels) {
                    chart.config.options.plugins.datalabels.color = isDarkMode ? '#e2e8f0' : '#666';
                }
            }
            
            // 應用更改
            chart.update();
        });
    }
}

/**
 * 更新硬碟健康狀態顏色
 */
function updateDiskHealthColors(isDarkMode) {
    const diskHealthCards = document.querySelectorAll('.disk-health-card');
    diskHealthCards.forEach(card => {
        const progressBars = card.querySelectorAll('.progress-bar');
        progressBars.forEach(progressBar => {
            // 保持進度條顏色，但調整其它元素
            const diskLabels = card.querySelectorAll('.disk-label');
            diskLabels.forEach(label => {
                label.style.color = isDarkMode ? '#e2e8f0' : '#333';
            });
            
            const diskValues = card.querySelectorAll('.disk-value');
            diskValues.forEach(value => {
                value.style.color = isDarkMode ? '#a0aec0' : '#666';
            });
        });
    });
}

/**
 * 更新服務器狀態顏色
 */
function updateServerStatusColors(isDarkMode) {
    const serverStatusCards = document.querySelectorAll('.server-status-card');
    serverStatusCards.forEach(card => {
        const statusIndicators = card.querySelectorAll('.status-indicator');
        statusIndicators.forEach(indicator => {
            // 根據狀態設置不同的顏色
            if (indicator.classList.contains('status-online')) {
                indicator.style.backgroundColor = isDarkMode ? '#48bb78' : '#38a169';
            } else if (indicator.classList.contains('status-warning')) {
                indicator.style.backgroundColor = isDarkMode ? '#ed8936' : '#dd6b20';
            } else if (indicator.classList.contains('status-offline')) {
                indicator.style.backgroundColor = isDarkMode ? '#f56565' : '#e53e3e';
            }
        });
        
        // 進度條背景
        const progressBars = card.querySelectorAll('.progress');
        progressBars.forEach(progress => {
            progress.style.backgroundColor = isDarkMode ? '#4a5568' : '#e9ecef';
        });
    });
}

/**
 * 更新使用者習慣顏色
 */
function updateUserHabitColors(isDarkMode) {
    const userHabitCards = document.querySelectorAll('.user-habit-card');
    userHabitCards.forEach(card => {
        const statValues = card.querySelectorAll('.stat-value');
        statValues.forEach(value => {
            value.style.color = isDarkMode ? '#e2e8f0' : '#333';
        });
        
        const statLabels = card.querySelectorAll('.stat-label');
        statLabels.forEach(label => {
            label.style.color = isDarkMode ? '#a0aec0' : '#666';
        });
    });
}

/**
 * 更新安全事件顏色
 */
function updateSecurityEventColors(isDarkMode) {
    const securityEvents = document.querySelectorAll('.security-event-item');
    securityEvents.forEach(event => {
        // 根據事件等級設置不同的背景色
        if (event.classList.contains('high-severity')) {
            event.style.backgroundColor = isDarkMode ? '#742a2a' : '#fed7d7';
            event.style.borderColor = isDarkMode ? '#9b2c2c' : '#feb2b2';
        } else if (event.classList.contains('medium-severity')) {
            event.style.backgroundColor = isDarkMode ? '#744a2a' : '#feebc8';
            event.style.borderColor = isDarkMode ? '#9b5c2c' : '#fbd38d';
        } else if (event.classList.contains('low-severity')) {
            event.style.backgroundColor = isDarkMode ? '#2a4a74' : '#bee3f8';
            event.style.borderColor = isDarkMode ? '#2c5282' : '#90cdf4';
        }
        
        // 事件時間文字顏色
        const eventTimes = event.querySelectorAll('.event-time');
        eventTimes.forEach(time => {
            time.style.color = isDarkMode ? '#a0aec0' : '#718096';
        });
    });
} 