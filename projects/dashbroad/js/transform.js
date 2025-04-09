/**
 * 化學雲分析儀表板
 * 轉置狀態相關JavaScript - 處理數據源轉置的狀態和記錄
 */

// 存儲當前篩選條件
const transformFilters = {
  dateRange: {
    startDate: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000), // 預設30天前
    endDate: new Date()
  },
  timeGranularity: 'day', // 預設按天顯示
  metric: 'count',        // 預設顯示資料筆數
  sources: ['all']        // 預設顯示所有來源
};

// 儲存視圖設定
const savedViews = [];
let defaultViewId = null;

// 存儲模擬數據
let transformMockData = [];
let activeTasksMockData = [];

// 矩陣圖相關變數
let matrixChart = null;
let matrixScale = 1.0;
let matrixTranslateX = 0;
let matrixTranslateY = 0;
let isDragging = false;
let lastX = 0;
let lastY = 0;

// 時間序列表格視圖相關變數
let timelineSettings = {
  visibleDays: 30,
  startDate: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
  timeUnit: 'day',
  showCompletedOnly: false
};

// 已完成任務相關變數
let completedTasksMockData = [];
let completedTimeRange = 30; // 預設顯示最近30天的已完成任務

// 初始化系統來源列表
const systemSources = [
  { id: 'system1', name: '內政部消防署-消防安全檢查列管系統' },
  { id: 'system2', name: '衛生福利部食品藥物管理署食品組-食品追溯追蹤管理資訊系統' },
  { id: 'system3', name: '勞動部職業安全衛生署-化學品報備與許可平臺' },
  { id: 'system4', name: '環境部化學物質管理署-毒性及關注化學物質登記申報系統' },
  { id: 'system5', name: '經濟部產業發展署-工廠危險物品申報網' },
  { id: 'system6', name: '國家科學及技術委員會中部科學園區管理局-自主申報系統' },
  { id: 'system7', name: '環境部化學物質管理署-化學物質登錄平台' },
  { id: 'system8', name: '衛生福利部食品藥物管理署食品組-食品追溯追蹤管理資訊系統	' }
];

/**
 * 初始化轉置狀態儀表板
 */
function initTransformDashboard() {
  console.log('初始化轉置狀態儀表板');
  
  // 生成模擬數據
  generateTransformMockData();
  
  // 初始化日期範圍選擇器
  initTransformDateRangePicker();
  
  // 初始化來源系統選擇
  initSourceSystemCheckboxes();
  
  // 初始化篩選器事件
  bindTransformFilterEvents();
  
  // 初始化矩陣圖
  initMatrixChart();
  
  // 初始化拖曳和縮放事件
  initMatrixInteractions();
  
  // 初始化進行中的任務
  updateActiveTransformTasks();
  
  // 初始化已完成的任務
  bindCompletedTasksEvents();
  updateCompletedTransformTasks();
  
  // 初始化時間序列表格視圖
  initTimelineView();
  
  // 更新儀表板
  updateTransformDashboard();
}

/**
 * 初始化日期範圍選擇器
 */
function initTransformDateRangePicker() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  // 格式化日期
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };
  
  // 設置日期範圍選擇器
  flatpickr('#transformDateRange', {
    mode: 'range',
    dateFormat: 'Y-m-d',
    defaultDate: [formatDate(thirtyDaysAgo), formatDate(now)],
    locale: 'zh_tw',
    onChange: function(selectedDates) {
      if (selectedDates.length === 2) {
        transformFilters.dateRange.startDate = selectedDates[0];
        transformFilters.dateRange.endDate = selectedDates[1];
      }
    }
  });
}

/**
 * 初始化來源系統選擇
 */
function initSourceSystemCheckboxes() {
  // 獲取系統來源容器
  const sourceContainer = document.querySelector('.source-select-container');
  
  // 清空現有內容
  sourceContainer.innerHTML = '';
  
  // 添加"全部"選項
  const allCheckbox = document.createElement('div');
  allCheckbox.className = 'form-check me-3 mb-2';
  allCheckbox.innerHTML = `
    <input class="form-check-input source-checkbox" type="checkbox" value="all" id="sourceAll" checked>
    <label class="form-check-label" for="sourceAll">全部</label>
  `;
  sourceContainer.appendChild(allCheckbox);
  
  // 為每個系統來源創建複選框
  systemSources.forEach(source => {
    const checkbox = document.createElement('div');
    checkbox.className = 'form-check me-3 mb-2';
    checkbox.innerHTML = `
      <input class="form-check-input source-checkbox" type="checkbox" value="${source.id}" id="source${source.id}">
      <label class="form-check-label" for="source${source.id}">${source.name}</label>
    `;
    sourceContainer.appendChild(checkbox);
  });
  
  // 綁定來源選擇事件
  document.querySelectorAll('.source-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', handleSourceCheckboxChange);
  });
}

/**
 * 處理系統來源複選框變更
 */
function handleSourceCheckboxChange() {
  if (this.value === 'all') {
    // 如果選擇了"全部"，取消其他選擇
    if (this.checked) {
      document.querySelectorAll('.source-checkbox:not([value="all"])').forEach(cb => {
        cb.checked = false;
      });
      transformFilters.sources = ['all'];
    } else {
      // 如果取消了"全部"，且沒有其他選擇，則重新選中"全部"
      const anyChecked = document.querySelector('.source-checkbox:checked');
      if (!anyChecked) {
        document.getElementById('sourceAll').checked = true;
        transformFilters.sources = ['all'];
      }
    }
  } else {
    // 如果選擇了特定來源，取消"全部"選擇
    if (this.checked) {
      document.getElementById('sourceAll').checked = false;
      if (!transformFilters.sources.includes(this.value) && transformFilters.sources.includes('all')) {
        transformFilters.sources = []; // 清除"全部"
      }
      if (!transformFilters.sources.includes(this.value)) {
        transformFilters.sources.push(this.value);
      }
    } else {
      // 如果取消了特定來源，從選擇中移除
      transformFilters.sources = transformFilters.sources.filter(source => source !== this.value);
      // 如果沒有選擇，則選中"全部"
      if (transformFilters.sources.length === 0) {
        document.getElementById('sourceAll').checked = true;
        transformFilters.sources = ['all'];
      }
    }
  }
}

/**
 * 綁定篩選器事件
 */
function bindTransformFilterEvents() {
  // 時間粒度選擇事件
  document.getElementById('transformTimeGranularity').addEventListener('change', function() {
    transformFilters.timeGranularity = this.value;
  });
  
  // 數據指標選擇事件
  document.getElementById('transformMetric').addEventListener('change', function() {
    transformFilters.metric = this.value;
  });
  
  // 套用篩選按鈕事件
  document.getElementById('applyTransformFilters').addEventListener('click', function() {
    updateTransformDashboard();
  });
  
  // 重置篩選按鈕事件
  document.getElementById('transformResetFilters').addEventListener('click', function() {
    resetTransformFilters();
  });
  
  // 儲存視圖按鈕事件
  document.getElementById('saveTransformView').addEventListener('click', function() {
    saveCurrentView();
  });
  
  // 設為預設視圖按鈕事件
  document.getElementById('setDefaultView').addEventListener('click', function() {
    setCurrentViewAsDefault();
  });
}

/**
 * 重置篩選條件
 */
function resetTransformFilters() {
  // 重置時間範圍
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  transformFilters.dateRange.startDate = thirtyDaysAgo;
  transformFilters.dateRange.endDate = now;
  
  // 重置其他篩選條件
  transformFilters.timeGranularity = 'day';
  transformFilters.metric = 'count';
  transformFilters.sources = ['all'];
  
  // 重置UI
  document.getElementById('transformTimeGranularity').value = 'day';
  document.getElementById('transformMetric').value = 'count';
  
  // 重置來源選擇
  document.querySelectorAll('.source-checkbox').forEach(checkbox => {
    checkbox.checked = checkbox.value === 'all';
  });
  
  // 重置日期範圍選擇器
  const fp = document.getElementById('transformDateRange')._flatpickr;
  fp.setDate([thirtyDaysAgo, now]);
  
  // 更新儀表板
  updateTransformDashboard();
}

/**
 * 初始化矩陣圖
 */
function initMatrixChart() {
  // 獲取矩陣圖容器
  const container = document.getElementById('transformMatrixChart');
  const containerWrapper = document.querySelector('.matrix-chart-container');
  
  // 設置容器樣式
  container.style.position = 'relative';
  container.style.overflow = 'hidden';
  container.style.userSelect = 'none';
  container.style.width = '2000px';
  container.style.height = '1000px';
  container.style.transform = `scale(${matrixScale}) translate(${matrixTranslateX}px, ${matrixTranslateY}px)`;
  container.style.transformOrigin = '0 0';
  
  // 創建懸停系統名稱顯示區域
  if (!document.getElementById('hoverSystemInfo')) {
    const hoverInfoContainer = document.createElement('div');
    hoverInfoContainer.id = 'hoverSystemInfo';
    hoverInfoContainer.className = 'hover-system-info';
    hoverInfoContainer.style.position = 'absolute';
    hoverInfoContainer.style.top = '10px';
    hoverInfoContainer.style.left = '50%';
    hoverInfoContainer.style.transform = 'translateX(-50%)';
    hoverInfoContainer.style.backgroundColor = isDarkMode() ? 'rgba(40, 40, 40, 0.9)' : 'rgba(240, 240, 240, 0.9)';
    hoverInfoContainer.style.color = isDarkMode() ? '#fff' : '#333';
    hoverInfoContainer.style.padding = '8px 16px';
    hoverInfoContainer.style.borderRadius = '20px';
    hoverInfoContainer.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    hoverInfoContainer.style.zIndex = '1000';
    hoverInfoContainer.style.minWidth = '200px';
    hoverInfoContainer.style.textAlign = 'center';
    hoverInfoContainer.style.display = 'none';
    hoverInfoContainer.style.fontWeight = 'bold';
    hoverInfoContainer.style.fontSize = '14px';
    hoverInfoContainer.innerHTML = '<span>移動滑鼠以顯示系統</span>';
    
    // 添加到圖表外部容器
    const chartCard = containerWrapper.closest('.chart-card');
    if (chartCard) {
      const cardBody = chartCard.querySelector('.card-body');
      if (cardBody) {
        cardBody.style.position = 'relative';
        cardBody.appendChild(hoverInfoContainer);
      }
    }
  }
  
  // 創建初始矩陣圖
  updateMatrixChart();
}

/**
 * 初始化矩陣圖的拖曳和縮放功能
 */
function initMatrixInteractions() {
  const container = document.getElementById('transformMatrixChart');
  const containerWrapper = document.querySelector('.matrix-chart-container');
  
  // 鼠標按下事件 - 開始拖曳
  container.addEventListener('mousedown', function(e) {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    container.style.cursor = 'grabbing';
  });
  
  // 鼠標移動事件 - 拖曳過程
  document.addEventListener('mousemove', function(e) {
    if (isDragging) {
      const deltaX = e.clientX - lastX;
      const deltaY = e.clientY - lastY;
      
      // 更新位置
      matrixTranslateX += deltaX / matrixScale;
      matrixTranslateY += deltaY / matrixScale;
      
      // 應用變換
      container.style.transform = `scale(${matrixScale}) translate(${matrixTranslateX}px, ${matrixTranslateY}px)`;
      
      lastX = e.clientX;
      lastY = e.clientY;
    }
  });
  
  // 鼠標釋放事件 - 結束拖曳
  document.addEventListener('mouseup', function() {
    isDragging = false;
    container.style.cursor = 'grab';
  });
  
  // 鼠標離開事件 - 結束拖曳
  document.addEventListener('mouseleave', function() {
    isDragging = false;
    container.style.cursor = 'grab';
  });
  
  // 縮放按鈕事件
  document.querySelector('.zoom-in-btn').addEventListener('click', function() {
    matrixScale = Math.min(matrixScale * 1.2, 3.0);
    container.style.transform = `scale(${matrixScale}) translate(${matrixTranslateX}px, ${matrixTranslateY}px)`;
  });
  
  document.querySelector('.zoom-out-btn').addEventListener('click', function() {
    matrixScale = Math.max(matrixScale / 1.2, 0.3);
    container.style.transform = `scale(${matrixScale}) translate(${matrixTranslateX}px, ${matrixTranslateY}px)`;
  });
  
  // 滾輪縮放
  containerWrapper.addEventListener('wheel', function(e) {
    e.preventDefault();
    
    // 決定縮放方向
    const zoomIn = e.deltaY < 0;
    
    // 計算滑鼠相對於矩陣圖的位置
    const rect = containerWrapper.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    // 計算滑鼠在縮放前的世界座標
    const worldX = (offsetX / matrixScale) - matrixTranslateX;
    const worldY = (offsetY / matrixScale) - matrixTranslateY;
    
    // 調整縮放因子
    if (zoomIn) {
      matrixScale = Math.min(matrixScale * 1.1, 3.0);
    } else {
      matrixScale = Math.max(matrixScale / 1.1, 0.3);
    }
    
    // 調整平移以保持滑鼠位置不變
    matrixTranslateX = -(worldX * matrixScale - offsetX) / matrixScale;
    matrixTranslateY = -(worldY * matrixScale - offsetY) / matrixScale;
    
    // 應用變換
    container.style.transform = `scale(${matrixScale}) translate(${matrixTranslateX}px, ${matrixTranslateY}px)`;
  }, { passive: false });
  
  // 添加全屏按鈕功能
  document.querySelector('.fullscreen-btn').addEventListener('click', function() {
    const chartCard = this.closest('.chart-card');
    if (chartCard) {
      const modal = document.getElementById('fullscreenModal');
      const modalContent = document.getElementById('fullscreenContent');
      const modalTitle = document.getElementById('fullscreenTitle');
      
      modalTitle.textContent = chartCard.querySelector('.card-header h5').textContent;
      
      // 克隆矩陣圖到全屏模態
      modalContent.innerHTML = '';
      const clonedContainer = document.createElement('div');
      clonedContainer.className = 'matrix-chart-container';
      clonedContainer.style.height = '100%';
      clonedContainer.style.overflow = 'auto';
      
      const clonedChart = document.createElement('div');
      clonedChart.id = 'fullscreenMatrixChart';
      clonedChart.className = 'matrix-chart';
      clonedChart.style.position = 'relative';
      clonedChart.style.userSelect = 'none';
      clonedChart.style.width = '2000px';
      clonedChart.style.height = '1000px';
      clonedChart.style.transform = `scale(${matrixScale}) translate(${matrixTranslateX}px, ${matrixTranslateY}px)`;
      clonedChart.style.transformOrigin = '0 0';
      
      clonedContainer.appendChild(clonedChart);
      modalContent.appendChild(clonedContainer);
      
      // 更新全屏模式下的矩陣圖
      updateMatrixChartContent(clonedChart);
      
      // 顯示全屏模態
      modal.style.display = 'flex';
      
      // 綁定關閉全屏模態事件
      document.querySelector('.close-fullscreen').addEventListener('click', function() {
        modal.style.display = 'none';
      });
    }
  });
}

/**
 * 儲存當前視圖設定
 */
function saveCurrentView() {
  // 顯示輸入對話框
  const viewName = prompt('請輸入視圖名稱:', '');
  
  if (viewName) {
    // 生成唯一ID
    const viewId = 'view_' + Date.now();
    
    // 儲存視圖設定
    const view = {
      id: viewId,
      name: viewName,
      filters: JSON.parse(JSON.stringify(transformFilters)), // 深拷貝篩選條件
      matrixScale: matrixScale,
      matrixTranslateX: matrixTranslateX,
      matrixTranslateY: matrixTranslateY
    };
    
    savedViews.push(view);
    
    // 更新已儲存視圖列表
    updateSavedViewsList();
    
    // 提示成功
    alert(`已儲存視圖 "${viewName}"`);
  }
}

/**
 * 設置當前視圖為預設視圖
 */
function setCurrentViewAsDefault() {
  if (savedViews.length === 0) {
    // 先儲存當前視圖
    const viewName = prompt('請先為當前視圖指定名稱:', '預設視圖');
    
    if (viewName) {
      // 生成唯一ID
      const viewId = 'view_' + Date.now();
      
      // 儲存視圖設定
      const view = {
        id: viewId,
        name: viewName,
        filters: JSON.parse(JSON.stringify(transformFilters)), // 深拷貝篩選條件
        matrixScale: matrixScale,
        matrixTranslateX: matrixTranslateX,
        matrixTranslateY: matrixTranslateY
      };
      
      savedViews.push(view);
      defaultViewId = viewId;
      
      // 更新已儲存視圖列表
      updateSavedViewsList();
      
      // 提示成功
      alert(`已將 "${viewName}" 設為預設視圖`);
    }
  } else {
    // 顯示選擇對話框
    const selectedIndex = prompt('請輸入要設為預設的視圖編號 (1-' + savedViews.length + '):', '1');
    
    if (selectedIndex && !isNaN(selectedIndex)) {
      const index = parseInt(selectedIndex) - 1;
      
      if (index >= 0 && index < savedViews.length) {
        defaultViewId = savedViews[index].id;
        
        // 更新已儲存視圖列表
        updateSavedViewsList();
        
        // 提示成功
        alert(`已將 "${savedViews[index].name}" 設為預設視圖`);
      } else {
        alert('無效的編號');
      }
    }
  }
}

/**
 * 更新已儲存的視圖列表
 */
function updateSavedViewsList() {
  const container = document.getElementById('savedTransformViews');
  
  // 清空現有內容
  container.innerHTML = '';
  
  // 添加已儲存的視圖
  savedViews.forEach((view, index) => {
    const viewButton = document.createElement('button');
    viewButton.className = 'btn btn-outline-primary m-1';
    viewButton.dataset.viewId = view.id;
    
    // 如果是預設視圖，添加星標
    if (view.id === defaultViewId) {
      viewButton.innerHTML = `<i class="bi bi-star-fill text-warning me-1"></i>${view.name}`;
    } else {
      viewButton.innerHTML = `<i class="bi bi-bookmark me-1"></i>${view.name}`;
    }
    
    // 添加點擊事件
    viewButton.addEventListener('click', function() {
      applyView(view.id);
    });
    
    container.appendChild(viewButton);
  });
}

/**
 * 應用已儲存的視圖
 */
function applyView(viewId) {
  const view = savedViews.find(v => v.id === viewId);
  
  if (view) {
    // 應用篩選條件
    transformFilters.dateRange = JSON.parse(JSON.stringify(view.filters.dateRange));
    transformFilters.timeGranularity = view.filters.timeGranularity;
    transformFilters.metric = view.filters.metric;
    transformFilters.sources = [...view.filters.sources];
    
    // 更新UI
    document.getElementById('transformTimeGranularity').value = transformFilters.timeGranularity;
    document.getElementById('transformMetric').value = transformFilters.metric;
    
    // 更新來源選擇
    document.querySelectorAll('.source-checkbox').forEach(checkbox => {
      if (checkbox.value === 'all') {
        checkbox.checked = transformFilters.sources.includes('all');
      } else {
        checkbox.checked = transformFilters.sources.includes(checkbox.value);
      }
    });
    
    // 更新日期範圍選擇器
    const fp = document.getElementById('transformDateRange')._flatpickr;
    fp.setDate([transformFilters.dateRange.startDate, transformFilters.dateRange.endDate]);
    
    // 應用矩陣圖設定
    matrixScale = view.matrixScale;
    matrixTranslateX = view.matrixTranslateX;
    matrixTranslateY = view.matrixTranslateY;
    
    const container = document.getElementById('transformMatrixChart');
    container.style.transform = `scale(${matrixScale}) translate(${matrixTranslateX}px, ${matrixTranslateY}px)`;
    
    // 更新儀表板
    updateTransformDashboard();
  }
}

/**
 * 更新轉置儀表板
 */
function updateTransformDashboard() {
  console.log('更新轉置儀表板', transformFilters);
  
  // 按照篩選條件更新矩陣圖
  updateMatrixChart();
  
  // 更新進行中的轉置任務
  updateActiveTransformTasks();
  
  // 更新已完成的轉置任務
  updateCompletedTransformTasks();
  
  // 更新時間序列表格視圖
  updateTimelineView();
}

/**
 * 更新矩陣圖
 */
function updateMatrixChart() {
  const container = document.getElementById('transformMatrixChart');
  
  // 清空現有內容並更新
  container.innerHTML = '';
  updateMatrixChartContent(container);
}

/**
 * 更新矩陣圖內容
 */
function updateMatrixChartContent(container) {
  // 獲取篩選後的數據
  const filteredData = getFilteredTransformData();
  
  // 按時間分組
  const timeSegments = groupDataByTime(filteredData);
  
  // 準備系統列表（y軸）
  let systemList = [];
  
  if (transformFilters.sources.includes('all')) {
    systemList = systemSources.map(s => s.id);
  } else {
    systemList = transformFilters.sources;
  }
  
  // 計算格子尺寸
  const cellWidth = 80;
  const cellHeight = 50;
  const cellMargin = 2;
  const totalWidth = timeSegments.length * (cellWidth + cellMargin);
  const totalHeight = systemList.length * (cellHeight + cellMargin);
  
  // 設置容器尺寸
  container.style.width = `${Math.max(2000, totalWidth)}px`;
  container.style.height = `${Math.max(1000, totalHeight)}px`;
  
  // 創建背景網格
  createBackgroundGrid(container, timeSegments, systemList, cellWidth, cellHeight, cellMargin);
  
  // 添加滑鼠移動監聽器以顯示當前系統
  const matrixContainer = container.closest('.matrix-chart-container');
  if (matrixContainer) {
    matrixContainer.addEventListener('mousemove', function(e) {
      // 獲取滑鼠相對於容器的y位置
      const containerRect = matrixContainer.getBoundingClientRect();
      const y = e.clientY - containerRect.top;
      
      // 根據y位置計算當前行（考慮縮放因子）
      const adjustedY = y / matrixScale - matrixTranslateY;
      
      // 計算對應的系統索引
      const systemIndex = Math.floor(adjustedY / (cellHeight + cellMargin));
      
      // 確認索引有效
      if (systemIndex >= 0 && systemIndex < systemList.length) {
        const systemId = systemList[systemIndex];
        const system = systemSources.find(s => s.id === systemId);
        
        // 更新懸停信息顯示
        const hoverInfo = document.getElementById('hoverSystemInfo');
        if (hoverInfo && system) {
          hoverInfo.innerHTML = `<span>當前系統: <strong>${system.name}</strong></span>`;
          hoverInfo.style.display = 'block';
          
          // 高亮顯示當前系統行
          document.querySelectorAll('.y-label').forEach(label => {
            if (label.dataset.systemId === systemId) {
              label.style.backgroundColor = isDarkMode() ? 'rgba(70, 130, 180, 0.8)' : 'rgba(70, 130, 180, 0.3)';
              label.style.color = isDarkMode() ? 'white' : 'black';
              label.style.fontWeight = 'bold';
            } else {
              label.style.backgroundColor = isDarkMode() ? 'rgba(40, 40, 40, 0.8)' : 'rgba(245, 245, 245, 0.8)';
              label.style.color = '';
              label.style.fontWeight = '';
            }
          });
        }
      }
    });
    
    // 滑鼠離開時隱藏系統信息
    matrixContainer.addEventListener('mouseleave', function() {
      const hoverInfo = document.getElementById('hoverSystemInfo');
      if (hoverInfo) {
        hoverInfo.style.display = 'none';
      }
      
      // 移除所有高亮
      document.querySelectorAll('.y-label').forEach(label => {
        label.style.backgroundColor = isDarkMode() ? 'rgba(40, 40, 40, 0.8)' : 'rgba(245, 245, 245, 0.8)';
        label.style.color = '';
        label.style.fontWeight = '';
      });
    });
  }
  
  // 繪製數據點
  drawDataPoints(container, filteredData, timeSegments, systemList, cellWidth, cellHeight, cellMargin);
  
  // 繪製坐標軸
  drawAxes(container, timeSegments, systemList, cellWidth, cellHeight, cellMargin);
}

/**
 * 創建矩陣圖背景網格
 */
function createBackgroundGrid(container, timeSegments, systemList, cellWidth, cellHeight, cellMargin) {
  // 添加網格背景
  const gridContainer = document.createElement('div');
  gridContainer.className = 'matrix-grid';
  gridContainer.style.position = 'absolute';
  gridContainer.style.top = '0';
  gridContainer.style.left = '0';
  gridContainer.style.width = '100%';
  gridContainer.style.height = '100%';
  
  // 添加網格線
  for (let i = 0; i <= timeSegments.length; i++) {
    const verticalLine = document.createElement('div');
    verticalLine.style.position = 'absolute';
    verticalLine.style.top = '0';
    verticalLine.style.left = `${i * (cellWidth + cellMargin)}px`;
    verticalLine.style.width = '1px';
    verticalLine.style.height = '100%';
    verticalLine.style.backgroundColor = 'rgba(200, 200, 200, 0.3)';
    gridContainer.appendChild(verticalLine);
  }
  
  for (let i = 0; i <= systemList.length; i++) {
    const horizontalLine = document.createElement('div');
    horizontalLine.style.position = 'absolute';
    horizontalLine.style.top = `${i * (cellHeight + cellMargin)}px`;
    horizontalLine.style.left = '0';
    horizontalLine.style.width = '100%';
    horizontalLine.style.height = '1px';
    horizontalLine.style.backgroundColor = 'rgba(200, 200, 200, 0.3)';
    gridContainer.appendChild(horizontalLine);
  }
  
  container.appendChild(gridContainer);
}

/**
 * 繪製坐標軸和標籤
 */
function drawAxes(container, timeSegments, systemList, cellWidth, cellHeight, cellMargin) {
  // 繪製x軸（時間軸）
  const xAxis = document.createElement('div');
  xAxis.className = 'x-axis';
  xAxis.style.position = 'absolute';
  xAxis.style.top = `${systemList.length * (cellHeight + cellMargin) + 10}px`;
  xAxis.style.left = '0';
  xAxis.style.width = '100%';
  xAxis.style.height = '30px';
  
  // 添加時間標籤
  timeSegments.forEach((segment, index) => {
    const label = document.createElement('div');
    label.className = 'axis-label x-label';
    label.style.position = 'absolute';
    label.style.top = '0';
    label.style.left = `${index * (cellWidth + cellMargin) + cellWidth / 2 - 30}px`;
    label.style.width = '60px';
    label.style.textAlign = 'center';
    label.style.fontSize = '12px';
    label.textContent = formatTimeLabel(segment.startTime, transformFilters.timeGranularity);
    xAxis.appendChild(label);
  });
  
  container.appendChild(xAxis);
  
  // 獲取矩陣圖的父容器
  const matrixContainer = container.closest('.matrix-chart-container');
  if (!matrixContainer) return;
  
  // 調整矩陣圖容器的相對定位
  matrixContainer.style.position = 'relative';
  
  // 首先移除任何現有的左側標籤容器
  const existingYLabels = document.querySelectorAll('.y-axis-label-container');
  existingYLabels.forEach(el => el.remove());
  
  // 創建y軸標籤容器（在圖表外側）
  const yLabelsContainer = document.createElement('div');
  yLabelsContainer.className = 'y-axis-label-container';
  yLabelsContainer.style.position = 'absolute';
  yLabelsContainer.style.top = '0';
  yLabelsContainer.style.right = '100%'; // 放在圖表的左側
  yLabelsContainer.style.width = '120px';
  yLabelsContainer.style.height = '100%';
  yLabelsContainer.style.paddingRight = '10px';
  yLabelsContainer.style.boxSizing = 'border-box';
  
  // 添加系統標籤
  systemList.forEach((systemId, index) => {
    const system = systemSources.find(s => s.id === systemId);
    if (system) {
      const label = document.createElement('div');
      label.className = 'axis-label y-label';
      label.dataset.systemId = systemId;
      label.style.position = 'absolute';
      label.style.top = `${index * (cellHeight + cellMargin) + cellHeight / 2 - 10}px`;
      label.style.right = '0';
      label.style.left = '0';
      label.style.textAlign = 'right';
      label.style.fontSize = '12px';
      label.style.padding = '3px 5px';
      label.style.borderRadius = '3px';
      label.style.backgroundColor = isDarkMode() ? 'rgba(40, 40, 40, 0.8)' : 'rgba(245, 245, 245, 0.8)';
      label.style.border = isDarkMode() ? '1px solid rgba(70, 70, 70, 0.5)' : '1px solid rgba(200, 200, 200, 0.5)';
      label.style.whiteSpace = 'nowrap';
      label.style.overflow = 'hidden';
      label.style.textOverflow = 'ellipsis';
      label.textContent = system.name;
      label.title = system.name;
      yLabelsContainer.appendChild(label);
    }
  });
  
  // 添加y軸標籤容器到外部容器
  matrixContainer.appendChild(yLabelsContainer);
  
  // 為矩陣圖容器添加足夠的左內邊距，以容納系統標籤
  matrixContainer.style.paddingLeft = '120px';
}

/**
 * 繪製數據點
 */
function drawDataPoints(container, data, timeSegments, systemList, cellWidth, cellHeight, cellMargin) {
  // 獲取數據點的最大值，用於顏色和大小的比例
  let maxValue = 0;
  timeSegments.forEach(segment => {
    systemList.forEach(systemId => {
      const key = `${systemId}_${segment.startTime.getTime()}`;
      const count = segment.systemCounts[key] || 0;
      maxValue = Math.max(maxValue, count);
    });
  });
  
  // 創建浮動提示框
  const tooltip = document.createElement('div');
  tooltip.className = 'matrix-tooltip';
  tooltip.style.position = 'absolute';
  tooltip.style.display = 'none';
  tooltip.style.padding = '8px 12px';
  tooltip.style.backgroundColor = isDarkMode() ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)';
  tooltip.style.border = isDarkMode() ? '1px solid rgba(200, 200, 200, 0.3)' : '1px solid rgba(0, 0, 0, 0.1)';
  tooltip.style.borderRadius = '4px';
  tooltip.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
  tooltip.style.fontSize = '12px';
  tooltip.style.color = isDarkMode() ? '#eee' : '#333';
  tooltip.style.zIndex = '100';
  tooltip.style.pointerEvents = 'none';
  container.appendChild(tooltip);
  
  // 為每個系統和時間段繪製數據點
  systemList.forEach((systemId, yIndex) => {
    timeSegments.forEach((segment, xIndex) => {
      const key = `${systemId}_${segment.startTime.getTime()}`;
      const count = segment.systemCounts[key] || 0;
      
      if (count > 0) {
        // 計算該數據點在矩陣中的位置
        const x = xIndex * (cellWidth + cellMargin) + cellWidth / 2;
        const y = yIndex * (cellHeight + cellMargin) + cellHeight / 2;
        
        // 繪製數據點
        const point = document.createElement('div');
        point.className = 'data-point';
        
        // 根據數值比例計算大小和顏色
        const sizeRatio = Math.sqrt(count / maxValue); // 使用平方根使小值更易區分
        const size = Math.max(10, Math.min(cellWidth - 10, Math.round(sizeRatio * (cellWidth - 10))));
        
        // 使用藍色色調，透明度根據數值變化
        const intensity = Math.min(0.9, Math.max(0.2, count / maxValue));
        const color = isDarkMode() 
          ? `rgba(100, 149, 237, ${intensity})` // 深色模式下的顏色
          : `rgba(65, 105, 225, ${intensity})`; // 淺色模式下的顏色
        
        point.style.position = 'absolute';
        point.style.left = `${x - size / 2}px`;
        point.style.top = `${y - size / 2}px`;
        point.style.width = `${size}px`;
        point.style.height = `${size}px`;
        point.style.borderRadius = transformFilters.metric === 'count' ? '50%' : '3px'; // 數量用圓形，大小用正方形
        point.style.backgroundColor = color;
        point.style.border = '1px solid rgba(255, 255, 255, 0.5)';
        point.style.zIndex = '10';
        point.style.cursor = 'pointer';
        point.style.transition = 'transform 0.2s, box-shadow 0.2s';
        
        // 滑鼠懸停事件處理
        point.addEventListener('mouseenter', function(e) {
          // 放大效果
          point.style.transform = 'scale(1.1)';
          point.style.boxShadow = '0 0 8px rgba(0, 100, 255, 0.6)';
          
          // 設置提示框內容
          tooltip.innerHTML = `
            <div><strong>系統來源:</strong> ${getSystemName(systemId)}</div>
            <div><strong>時間:</strong> ${formatTimeLabel(segment.startTime, transformFilters.timeGranularity)}</div>
            <div><strong>${transformFilters.metric === 'count' ? '資料筆數' : '檔案大小'}:</strong> ${formatDataValue(count, transformFilters.metric)}</div>
          `;
          
          // 計算提示框位置 (避免超出視窗邊界)
          const containerRect = container.getBoundingClientRect();
          const pointRect = point.getBoundingClientRect();
          const tooltipWidth = 200; // 估計的寬度
          const tooltipHeight = 80; // 估計的高度
          
          let left = pointRect.left - containerRect.left + size + 10;
          let top = pointRect.top - containerRect.top;
          
          // 確保提示框不會超出右側邊界
          if (left + tooltipWidth > containerRect.width) {
            left = pointRect.left - containerRect.left - tooltipWidth - 10;
          }
          
          // 確保提示框不會超出底部邊界
          if (top + tooltipHeight > containerRect.height) {
            top = containerRect.height - tooltipHeight;
          }
          
          tooltip.style.left = `${left}px`;
          tooltip.style.top = `${top}px`;
          tooltip.style.display = 'block';
        });
        
        point.addEventListener('mouseleave', function() {
          // 恢復原始狀態
          point.style.transform = 'scale(1)';
          point.style.boxShadow = 'none';
          tooltip.style.display = 'none';
        });
        
        container.appendChild(point);
        
        // 如果數據量很大，添加數值標籤
        if (count > maxValue * 0.5) {
          const label = document.createElement('div');
          label.className = 'point-label';
          label.style.position = 'absolute';
          label.style.left = `${x}px`;
          label.style.top = `${y}px`;
          label.style.transform = 'translate(-50%, -50%)';
          label.style.color = 'white';
          label.style.fontSize = '10px';
          label.style.fontWeight = 'bold';
          label.style.textShadow = '0 0 2px rgba(0, 0, 0, 0.8)';
          label.style.zIndex = '11';
          label.style.pointerEvents = 'none';
          label.textContent = formatCompactNumber(count);
          container.appendChild(label);
        }
      }
    });
  });
}

/**
 * 根據篩選條件獲取轉置數據
 */
function getFilteredTransformData() {
  // 時間範圍篩選
  let filtered = transformMockData.filter(item => {
    const timestamp = new Date(item.timestamp);
    return timestamp >= transformFilters.dateRange.startDate && timestamp <= transformFilters.dateRange.endDate;
  });
  
  // 系統來源篩選
  if (!transformFilters.sources.includes('all')) {
    filtered = filtered.filter(item => transformFilters.sources.includes(item.source));
  }
  
  return filtered;
}

/**
 * 按時間粒度分組數據
 */
function groupDataByTime(data) {
  if (data.length === 0) return [];
  
  // 獲取時間範圍
  const startDate = transformFilters.dateRange.startDate;
  const endDate = transformFilters.dateRange.endDate;
  
  // 根據粒度計算時間間隔
  let interval;
  let intervalUnit;
  
  switch (transformFilters.timeGranularity) {
    case 'hour':
      interval = 1;
      intervalUnit = 'hour';
      break;
    case 'day':
      interval = 1;
      intervalUnit = 'day';
      break;
    case 'week':
      interval = 7;
      intervalUnit = 'day';
      break;
    case 'month':
      interval = 1;
      intervalUnit = 'month';
      break;
    default:
      interval = 1;
      intervalUnit = 'day';
  }
  
  // 計算需要多少時間段
  const intervals = getIntervalsCount(startDate, endDate, interval, intervalUnit);
  
  // 初始化分組數據
  const groupedData = [];
  
  for (let i = 0; i < intervals; i++) {
    const intervalStart = addTimeInterval(startDate, i * interval, intervalUnit);
    const intervalEnd = addTimeInterval(startDate, (i + 1) * interval, intervalUnit);
    
    // 限制在結束日期以內
    const adjustedIntervalEnd = intervalEnd > endDate ? endDate : intervalEnd;
    
    groupedData.push({
      startTime: intervalStart,
      endTime: adjustedIntervalEnd,
      systemCounts: {}
    });
  }
  
  // 統計每個系統在每個時間段的數據
  data.forEach(item => {
    const timestamp = new Date(item.timestamp);
    const sourceSystem = item.source;
    const value = transformFilters.metric === 'count' ? 1 : item.size;
    
    for (let i = 0; i < groupedData.length; i++) {
      if (timestamp >= groupedData[i].startTime && timestamp < groupedData[i].endTime) {
        const key = `${sourceSystem}_${groupedData[i].startTime.getTime()}`;
        
        if (!groupedData[i].systemCounts[key]) {
          groupedData[i].systemCounts[key] = value;
        } else {
          groupedData[i].systemCounts[key] += value;
        }
        
        break;
      }
    }
  });
  
  return groupedData;
}

/**
 * 計算兩個日期之間的間隔數量
 */
function getIntervalsCount(startDate, endDate, interval, unit) {
  let count = 0;
  let current = new Date(startDate);
  
  while (current < endDate) {
    count++;
    current = addTimeInterval(startDate, count * interval, unit);
  }
  
  return count;
}

/**
 * 添加時間間隔
 */
function addTimeInterval(date, interval, unit) {
  const result = new Date(date);
  
  switch (unit) {
    case 'hour':
      result.setHours(result.getHours() + interval);
      break;
    case 'day':
      result.setDate(result.getDate() + interval);
      break;
    case 'month':
      result.setMonth(result.getMonth() + interval);
      break;
  }
  
  return result;
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
  
  switch (granularity) {
    case 'hour':
      return `${month}/${day} ${hours}:00`;
    case 'day':
      return `${month}/${day}`;
    case 'week':
      // 獲取該週的第一天
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return `${String(weekStart.getMonth() + 1).padStart(2, '0')}/${String(weekStart.getDate()).padStart(2, '0')}-${String(weekEnd.getMonth() + 1).padStart(2, '0')}/${String(weekEnd.getDate()).padStart(2, '0')}`;
    case 'month':
      return `${year}/${month}`;
    default:
      return `${month}/${day}`;
  }
}

/**
 * 格式化數據值
 */
function formatDataValue(value, metric) {
  if (metric === 'size') {
    // 格式化檔案大小
    if (value < 1024) {
      return `${value} B`;
    } else if (value < 1024 * 1024) {
      return `${(value / 1024).toFixed(2)} KB`;
    } else if (value < 1024 * 1024 * 1024) {
      return `${(value / (1024 * 1024)).toFixed(2)} MB`;
    } else {
      return `${(value / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
  } else {
    // 格式化數量
    return value.toLocaleString();
  }
}

/**
 * 格式化壓縮數字（用於標籤）
 */
function formatCompactNumber(value) {
  if (value < 1000) {
    return value.toString();
  } else if (value < 1000000) {
    return `${(value / 1000).toFixed(1)}K`;
  } else {
    return `${(value / 1000000).toFixed(1)}M`;
  }
}

/**
 * 根據系統ID獲取系統名稱
 */
function getSystemName(systemId) {
  const system = systemSources.find(s => s.id === systemId);
  return system ? system.name : systemId;
}

/**
 * 更新進行中的轉置任務
 */
function updateActiveTransformTasks() {
  // 獲取進行中的轉置任務容器
  const container = document.getElementById('activeTransformTasks');
  
  // 清空現有內容
  container.innerHTML = '';
  
  // 檢查是否有進行中的任務
  if (activeTasksMockData.length === 0) {
    const noTaskMessage = document.createElement('div');
    noTaskMessage.className = 'col-12 text-center py-5';
    noTaskMessage.innerHTML = `
      <div class="text-muted">
        <i class="bi bi-info-circle me-2"></i>目前沒有進行中的轉置任務
      </div>
    `;
    container.appendChild(noTaskMessage);
    return;
  }
  
  // 添加進行中的任務卡片
  activeTasksMockData.forEach(task => {
    const taskCard = document.createElement('div');
    taskCard.className = 'col-lg-4 mb-3';
    
    // 計算進度百分比
    const progressPercent = Math.round((task.completedCount / task.totalCount) * 100);
    
    taskCard.innerHTML = `
      <div class="card transform-task-card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h6 class="mb-0">${task.name}</h6>
          <span class="badge bg-primary">進行中</span>
        </div>
        <div class="card-body">
          <p class="mb-2"><strong>來源：</strong>${getSystemName(task.source)}</p>
          <p class="mb-2"><strong>開始時間：</strong>${formatDateTime(task.startTime)}</p>
          <div class="mb-2">
            <div class="d-flex justify-content-between">
              <span>處理進度：</span>
              <span>${progressPercent}%</span>
            </div>
            <div class="progress">
              <div class="progress-bar" role="progressbar" style="width: ${progressPercent}%;" 
                aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
          </div>
          <div class="task-stats mt-3">
            <div class="row g-2">
              <div class="col-4">
                <div class="p-2 border rounded text-center">
                  <div>總筆數</div>
                  <strong>${task.totalCount.toLocaleString()}</strong>
                </div>
              </div>
              <div class="col-4">
                <div class="p-2 border rounded text-center">
                  <div>已完成</div>
                  <strong>${task.completedCount.toLocaleString()}</strong>
                </div>
              </div>
              <div class="col-4">
                <div class="p-2 border rounded text-center text-danger">
                  <div>有問題</div>
                  <strong>${task.errorCount.toLocaleString()}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    container.appendChild(taskCard);
  });
}

/**
 * 格式化日期時間
 */
function formatDateTime(date) {
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * 生成模擬數據
 */
function generateTransformMockData() {
  transformMockData = [];
  activeTasksMockData = [];
  completedTasksMockData = [];
  
  // 設置時間範圍（過去180天）
  const now = new Date();
  const startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
  
  // 模擬各系統的數據轉置記錄
  systemSources.forEach(system => {
    // 為每個系統生成不同的數據模式
    const frequencyFactor = Math.random() * 0.8 + 0.2; // 0.2 到 1.0 的隨機因子
    const sizeFactor = Math.random() * 5000 + 1000;    // 平均檔案大小 (1KB-6KB)
    
    // 模擬這段時間內的轉置記錄
    let currentDate = new Date(startDate);
    
    while (currentDate <= now) {
      // 判斷這一天是否有數據轉置
      if (Math.random() < frequencyFactor * 0.3) {
        // 這一天有數據轉置，生成1-5筆記錄
        const recordsCount = Math.floor(Math.random() * 5) + 1;
        
        for (let i = 0; i < recordsCount; i++) {
          // 生成隨機時間點
          const recordTime = new Date(currentDate);
          recordTime.setHours(Math.floor(Math.random() * 24));
          recordTime.setMinutes(Math.floor(Math.random() * 60));
          
          // 生成隨機數據量
          const recordSize = Math.floor(Math.random() * sizeFactor * 10) + sizeFactor;
          const recordCount = Math.floor(Math.random() * 1000) + 100;
          
          // 添加記錄
          transformMockData.push({
            source: system.id,
            timestamp: recordTime,
            size: recordSize,
            count: recordCount
          });
        }
      }
      
      // 前進一天
      currentDate.setDate(currentDate.getDate() + 1);
    }
  });
  
  // 按時間排序
  transformMockData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  // 生成進行中的任務
  const activeSystems = [];
  
  // 隨機選擇2-3個系統作為當前正在轉置的系統
  const activeCounts = Math.floor(Math.random() * 2) + 2;
  
  while (activeSystems.length < activeCounts) {
    const randomSystem = systemSources[Math.floor(Math.random() * systemSources.length)];
    
    if (!activeSystems.includes(randomSystem.id)) {
      activeSystems.push(randomSystem.id);
      
      // 生成隨機任務數據
      const totalCount = Math.floor(Math.random() * 5000) + 1000;
      const completedCount = Math.floor(Math.random() * totalCount);
      const errorCount = Math.floor(Math.random() * 20);
      
      // 生成開始時間（最近24小時內）
      const startTime = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000);
      
      activeTasksMockData.push({
        id: `task_${Date.now()}_${randomSystem.id}`,
        name: `${randomSystem.name}資料轉置`,
        source: randomSystem.id,
        startTime: startTime,
        totalCount: totalCount,
        completedCount: completedCount,
        errorCount: errorCount
      });
    }
  }
  
  // 生成已完成的任務
  // 最近90天內的隨機日期生成15-25個已完成的任務
  const completedCount = Math.floor(Math.random() * 10) + 15;
  const usedSystems = new Set(); // 避免時間太近的情況下同一系統有多個任務
  
  for (let i = 0; i < completedCount; i++) {
    // 選擇一個系統
    let randomSystem;
    do {
      randomSystem = systemSources[Math.floor(Math.random() * systemSources.length)];
    } while (usedSystems.has(randomSystem.id));
    
    // 添加到已使用系統集合，但只保留最近的幾個避免所有系統都被用完
    if (i < 5) {
      usedSystems.add(randomSystem.id);
    }
    
    // 生成完成時間（最近90天內，距離現在至少36小時以上）
    const daysAgo = Math.random() * 90 + 1.5; // 1.5天到91.5天前
    const completionTime = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    // 生成開始時間（完成時間前1-24小時）
    const taskDuration = Math.random() * 23 * 60 + 60; // 1小時到24小時，以分鐘為單位
    const startTime = new Date(completionTime.getTime() - taskDuration * 60 * 1000);
    
    // 生成隨機任務數據
    const totalCount = Math.floor(Math.random() * 10000) + 500;
    // 隨機錯誤數，但確保不超過總數的10%
    const errorCount = Math.floor(Math.random() * (totalCount * 0.1));
    
    completedTasksMockData.push({
      id: `completed_task_${Date.now()}_${i}_${randomSystem.id}`,
      name: `${randomSystem.name}資料轉置`,
      source: randomSystem.id,
      startTime: startTime,
      completionTime: completionTime,
      totalCount: totalCount,
      errorCount: errorCount
    });
  }
  
  // 按完成時間排序
  completedTasksMockData.sort((a, b) => new Date(b.completionTime) - new Date(a.completionTime));
}

/**
 * 初始化時間序列表格視圖
 */
function initTimelineView() {
  // 初始化時間範圍顯示
  updateTimeRangeDisplay();
  
  // 綁定時間序列表格相關事件
  bindTimelineEvents();
  
  // 初始化時間序列表格
  updateTimelineView();
}

/**
 * 更新時間範圍顯示
 */
function updateTimeRangeDisplay() {
  const display = document.querySelector('.time-range-display');
  const endDate = new Date(timelineSettings.startDate.getTime() + timelineSettings.visibleDays * 24 * 60 * 60 * 1000);
  
  // 格式化日期
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };
  
  display.textContent = `${formatDate(timelineSettings.startDate)} 至 ${formatDate(endDate)}`;
}

/**
 * 綁定時間序列表格相關事件
 */
function bindTimelineEvents() {
  // 前一個時間區間按鈕
  document.querySelector('.time-nav-prev').addEventListener('click', function() {
    const days = timelineSettings.timeUnit === 'day' ? timelineSettings.visibleDays : 
                (timelineSettings.timeUnit === 'week' ? timelineSettings.visibleDays * 7 : timelineSettings.visibleDays * 30);
    
    timelineSettings.startDate = new Date(timelineSettings.startDate.getTime() - days * 24 * 60 * 60 * 1000);
    updateTimeRangeDisplay();
    updateTimelineView();
  });
  
  // 後一個時間區間按鈕
  document.querySelector('.time-nav-next').addEventListener('click', function() {
    const days = timelineSettings.timeUnit === 'day' ? timelineSettings.visibleDays : 
                (timelineSettings.timeUnit === 'week' ? timelineSettings.visibleDays * 7 : timelineSettings.visibleDays * 30);
    
    const newStartDate = new Date(timelineSettings.startDate.getTime() + days * 24 * 60 * 60 * 1000);
    
    // 確保不超過當前日期
    if (newStartDate <= new Date()) {
      timelineSettings.startDate = newStartDate;
      updateTimeRangeDisplay();
      updateTimelineView();
    }
  });
  
  // 時間單位選擇
  document.querySelector('.time-range-select').addEventListener('change', function() {
    timelineSettings.timeUnit = this.value;
    
    // 根據時間單位調整可見天數
    if (timelineSettings.timeUnit === 'day') {
      timelineSettings.visibleDays = 30;
    } else if (timelineSettings.timeUnit === 'week') {
      timelineSettings.visibleDays = 12;
    } else if (timelineSettings.timeUnit === 'month') {
      timelineSettings.visibleDays = 6;
    }
    
    updateTimeRangeDisplay();
    updateTimelineView();
  });
  
  // 只顯示已完成開關
  document.getElementById('showCompletedOnly').addEventListener('change', function() {
    timelineSettings.showCompletedOnly = this.checked;
    updateTimelineView();
  });
}

/**
 * 更新時間序列表格視圖
 */
function updateTimelineView() {
  // 生成時間序列
  const timelineData = generateTimelineData();
  
  // 獲取表頭和表體
  const tableHead = document.getElementById('timelineTableHead');
  const tableBody = document.getElementById('timelineTableBody');
  
  // 清空表格
  tableHead.innerHTML = '';
  tableBody.innerHTML = '';
  
  // 創建表頭
  const headerRow = document.createElement('tr');
  
  // 添加固定列標題
  const systemHeader = document.createElement('th');
  systemHeader.className = 'fixed-column';
  systemHeader.textContent = '系統來源';
  headerRow.appendChild(systemHeader);
  
  // 添加日期列標題
  const currentDate = new Date();
  timelineData.dates.forEach(date => {
    const dateHeader = document.createElement('th');
    dateHeader.className = 'date-header';
    
    // 如果是當前日期，添加特殊類名
    if (date.getDate() === currentDate.getDate() && 
        date.getMonth() === currentDate.getMonth() && 
        date.getFullYear() === currentDate.getFullYear()) {
      dateHeader.classList.add('current-date');
    }
    
    dateHeader.textContent = formatTimelineDate(date);
    headerRow.appendChild(dateHeader);
  });
  
  tableHead.appendChild(headerRow);
  
  // 創建表體行
  systemSources.forEach(system => {
    // 如果只顯示已完成且該系統沒有任何完成的記錄，則跳過
    if (timelineSettings.showCompletedOnly && 
        !timelineData.systems[system.id].some(cell => cell.status === 'completed')) {
      return;
    }
    
    const row = document.createElement('tr');
    
    // 添加系統名稱列
    const systemCell = document.createElement('td');
    systemCell.className = 'fixed-column';
    systemCell.dataset.systemId = system.id;
    systemCell.textContent = system.name;
    row.appendChild(systemCell);
    
    // 添加數據單元格
    timelineData.systems[system.id].forEach((cell, index) => {
      const dataCell = document.createElement('td');
      dataCell.className = 'timeline-cell';
      
      // 如果有數據，添加指示器
      if (cell.count > 0) {
        const maxCount = timelineData.maxCount;
        const sizeRatio = Math.sqrt(cell.count / maxCount);
        const size = Math.max(10, Math.min(30, Math.round(20 * sizeRatio)));
        
        // 創建資料指示器
        const indicator = document.createElement('div');
        indicator.className = 'data-indicator';
        indicator.style.width = `${size}px`;
        indicator.style.height = `${size}px`;
        
        // 設置顏色
        let bgColor;
        if (cell.status === 'completed') {
          bgColor = isDarkMode() ? 'rgba(40, 167, 69, 0.8)' : 'rgba(40, 167, 69, 0.6)';
        } else if (cell.status === 'in-progress') {
          bgColor = isDarkMode() ? 'rgba(255, 193, 7, 0.8)' : 'rgba(255, 193, 7, 0.6)';
        } else if (cell.status === 'error') {
          bgColor = isDarkMode() ? 'rgba(220, 53, 69, 0.8)' : 'rgba(220, 53, 69, 0.6)';
        } else {
          bgColor = isDarkMode() ? 'rgba(0, 123, 255, 0.8)' : 'rgba(0, 123, 255, 0.6)';
        }
        indicator.style.backgroundColor = bgColor;
        
        // 添加懸停事件
        indicator.addEventListener('mouseenter', function() {
          const info = document.getElementById('hoverSystemInfoTimeline');
          if (info) {
            info.innerHTML = `
              <div><strong>${system.name}</strong></div>
              <div>${formatTimelineDate(timelineData.dates[index])}</div>
              <div>資料筆數: ${cell.count.toLocaleString()}</div>
              <div>狀態: ${getStatusText(cell.status)}</div>
            `;
            info.style.display = 'block';
          }
          
          // 高亮顯示對應系統行
          document.querySelectorAll('.timeline-table td.fixed-column').forEach(td => {
            if (td.dataset.systemId === system.id) {
              td.style.backgroundColor = isDarkMode() ? 'rgba(70, 130, 180, 0.5)' : 'rgba(70, 130, 180, 0.2)';
              td.style.color = isDarkMode() ? 'white' : 'black';
              td.style.fontWeight = 'bold';
            }
          });
        });
        
        indicator.addEventListener('mouseleave', function() {
          const info = document.getElementById('hoverSystemInfoTimeline');
          if (info) {
            info.style.display = 'none';
          }
          
          // 恢復正常顯示
          document.querySelectorAll('.timeline-table td.fixed-column').forEach(td => {
            td.style.backgroundColor = '';
            td.style.color = '';
            td.style.fontWeight = '';
          });
        });
        
        dataCell.appendChild(indicator);
        
        // 添加狀態指示標記
        if (cell.status === 'completed') {
          const completedMark = document.createElement('i');
          completedMark.className = 'bi bi-check-circle-fill completed-indicator';
          completedMark.title = '已完成';
          dataCell.appendChild(completedMark);
        } else if (cell.status === 'in-progress') {
          const inProgressMark = document.createElement('i');
          inProgressMark.className = 'bi bi-arrow-repeat in-progress-indicator';
          inProgressMark.title = '進行中';
          dataCell.appendChild(inProgressMark);
        } else if (cell.status === 'error') {
          const errorMark = document.createElement('i');
          errorMark.className = 'bi bi-exclamation-triangle-fill error-indicator';
          errorMark.title = '處理中出錯';
          dataCell.appendChild(errorMark);
        }
      }
      
      row.appendChild(dataCell);
    });
    
    tableBody.appendChild(row);
  });
}

/**
 * 生成時間序列數據
 */
function generateTimelineData() {
  // 準備時間序列
  const dates = [];
  const endDate = new Date(timelineSettings.startDate.getTime() + timelineSettings.visibleDays * 24 * 60 * 60 * 1000);
  
  // 根據時間單位生成日期
  let currentDate = new Date(timelineSettings.startDate);
  
  while (currentDate < endDate) {
    dates.push(new Date(currentDate));
    
    if (timelineSettings.timeUnit === 'day') {
      currentDate.setDate(currentDate.getDate() + 1);
    } else if (timelineSettings.timeUnit === 'week') {
      currentDate.setDate(currentDate.getDate() + 7);
    } else if (timelineSettings.timeUnit === 'month') {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  }
  
  // 準備系統數據
  const systems = {};
  let maxCount = 0;
  
  // 初始化每個系統的時間序列數據
  systemSources.forEach(system => {
    systems[system.id] = [];
    
    // 為每個時間點創建一個單元格數據
    dates.forEach(date => {
      // 用模擬數據填充
      const records = transformMockData.filter(record => {
        const recordDate = new Date(record.timestamp);
        
        if (timelineSettings.timeUnit === 'day') {
          return recordDate.getDate() === date.getDate() && 
                 recordDate.getMonth() === date.getMonth() && 
                 recordDate.getFullYear() === date.getFullYear() &&
                 record.source === system.id;
        } else if (timelineSettings.timeUnit === 'week') {
          const weekStart = new Date(date);
          const weekEnd = new Date(date);
          weekEnd.setDate(weekEnd.getDate() + 6);
          
          return recordDate >= weekStart && recordDate <= weekEnd && record.source === system.id;
        } else if (timelineSettings.timeUnit === 'month') {
          return recordDate.getMonth() === date.getMonth() && 
                 recordDate.getFullYear() === date.getFullYear() && 
                 record.source === system.id;
        }
      });
      
      // 計算總數
      const count = records.reduce((sum, record) => sum + record.count, 0);
      
      // 更新最大值
      maxCount = Math.max(maxCount, count);
      
      // 模擬狀態
      let status = 'none';
      if (count > 0) {
        // 隨機生成狀態，但讓較早的日期更可能完成
        const dateRatio = (new Date() - date) / (1000 * 60 * 60 * 24 * 180); // 過去180天的比例
        const completedChance = Math.min(0.8, dateRatio);
        
        if (Math.random() < completedChance) {
          status = 'completed';
        } else if (Math.random() < 0.2) {
          status = 'error';
        } else if (date < new Date() && date >= new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000)) {
          status = 'in-progress';
        }
      }
      
      systems[system.id].push({
        count: count,
        status: status
      });
    });
  });
  
  return {
    dates: dates,
    systems: systems,
    maxCount: maxCount
  };
}

/**
 * 格式化時間序列日期顯示
 */
function formatTimelineDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  if (timelineSettings.timeUnit === 'day') {
    return `${month}/${day}`;
  } else if (timelineSettings.timeUnit === 'week') {
    const weekEnd = new Date(date);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const endMonth = String(weekEnd.getMonth() + 1).padStart(2, '0');
    const endDay = String(weekEnd.getDate()).padStart(2, '0');
    
    return `${month}/${day}-${endMonth}/${endDay}`;
  } else if (timelineSettings.timeUnit === 'month') {
    return `${year}/${month}`;
  }
}

/**
 * 獲取狀態文字
 */
function getStatusText(status) {
  switch (status) {
    case 'completed':
      return '已完成';
    case 'in-progress':
      return '進行中';
    case 'error':
      return '處理出錯';
    default:
      return '未轉置';
  }
}

/**
 * 綁定已完成任務相關事件
 */
function bindCompletedTasksEvents() {
  // 綁定時間範圍選擇器事件
  const completedRangeSelect = document.getElementById('completedTimeRange');
  if (completedRangeSelect) {
    completedRangeSelect.addEventListener('change', function() {
      completedTimeRange = parseInt(this.value);
      updateCompletedTransformTasks();
    });
  }
}

/**
 * 更新已完成的轉置任務
 */
function updateCompletedTransformTasks() {
  // 獲取已完成的轉置任務容器
  const container = document.getElementById('completedTransformTasks');
  
  // 清空現有內容
  container.innerHTML = '';
  
  // 過濾出選定時間範圍內的已完成任務
  const now = new Date();
  const rangeStart = new Date(now.getTime() - completedTimeRange * 24 * 60 * 60 * 1000);
  const filteredTasks = completedTasksMockData.filter(task => {
    const completionDate = new Date(task.completionTime);
    return completionDate >= rangeStart && completionDate <= now;
  });
  
  // 檢查是否有已完成的任務
  if (filteredTasks.length === 0) {
    const noTaskMessage = document.createElement('div');
    noTaskMessage.className = 'col-12 text-center py-5';
    noTaskMessage.innerHTML = `
      <div class="text-muted">
        <i class="bi bi-info-circle me-2"></i>選定時間範圍內沒有已完成的轉置任務
      </div>
    `;
    container.appendChild(noTaskMessage);
    return;
  }
  
  // 按完成時間排序（最近的在前）
  filteredTasks.sort((a, b) => new Date(b.completionTime) - new Date(a.completionTime));
  
  // 添加已完成的任務卡片
  filteredTasks.forEach(task => {
    const taskCard = document.createElement('div');
    taskCard.className = 'col-lg-4 mb-3';
    
    // 計算成功率
    const successRate = Math.round(((task.totalCount - task.errorCount) / task.totalCount) * 100);
    const completionDate = formatDateTime(task.completionTime);
    const startDate = formatDateTime(task.startTime);
    
    // 計算總耗時
    const duration = Math.round((new Date(task.completionTime) - new Date(task.startTime)) / (1000 * 60));
    const durationText = duration >= 60 
      ? `${Math.floor(duration / 60)}小時${duration % 60}分鐘` 
      : `${duration}分鐘`;
    
    taskCard.innerHTML = `
      <div class="card transform-task-card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h6 class="mb-0">${task.name}</h6>
          <span class="badge bg-success">已完成</span>
        </div>
        <div class="card-body">
          <p class="mb-2"><strong>來源：</strong>${getSystemName(task.source)}</p>
          <p class="mb-2"><strong>開始時間：</strong>${startDate}</p>
          <p class="mb-2"><strong>完成時間：</strong>${completionDate}</p>
          <p class="mb-2"><strong>總耗時：</strong>${durationText}</p>
          <div class="mb-2">
            <div class="d-flex justify-content-between">
              <span>成功率：</span>
              <span>${successRate}%</span>
            </div>
            <div class="progress">
              <div class="progress-bar bg-success" role="progressbar" style="width: ${successRate}%;" 
                aria-valuenow="${successRate}" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
          </div>
          <div class="task-stats mt-3">
            <div class="row g-2">
              <div class="col-4">
                <div class="p-2 border rounded text-center">
                  <div>總筆數</div>
                  <strong>${task.totalCount.toLocaleString()}</strong>
                </div>
              </div>
              <div class="col-4">
                <div class="p-2 border rounded text-center text-success">
                  <div>成功</div>
                  <strong>${(task.totalCount - task.errorCount).toLocaleString()}</strong>
                </div>
              </div>
              <div class="col-4">
                <div class="p-2 border rounded text-center text-danger">
                  <div>失敗</div>
                  <strong>${task.errorCount.toLocaleString()}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    container.appendChild(taskCard);
  });
}

// 在文檔加載完成後初始化轉置狀態儀表板
document.addEventListener('DOMContentLoaded', function() {
  // 為"轉置狀態"頁籤添加事件監聽器
  const transformTab = document.getElementById('transform-tab');
  if (transformTab) {
    transformTab.addEventListener('shown.bs.tab', function() {
      initTransformDashboard();
    });
  }
}); 