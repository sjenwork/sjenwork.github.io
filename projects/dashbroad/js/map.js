/**
 * 化學雲帳號統計儀表板
 * 地圖相關JavaScript - 處理台灣地區帳號分布地圖的顯示和更新
 * 使用OpenStreetMap和Leaflet實現，完全開源不需授權
 */

// 地圖實例
window.taiwanMap = null;

// 存儲地圖數據
let mapData = null;

// 標記圖層組
let markersLayer = null;

/**
 * 初始化地圖
 */
function initMap(data) {
  // 處理地圖數據
  processMapData(data);
  
  // 如果地圖已經初始化，先移除舊的地圖實例
  if (window.taiwanMap) {
    window.taiwanMap.remove();
    window.taiwanMap = null;
  }
  
  // 清空容器
  const mapContainer = document.getElementById('taiwanMap');
  mapContainer.innerHTML = '';
  
  // 獲取當前主題
  const isDarkMode = document.body.getAttribute('data-theme') === 'dark';
  
  // 創建Leaflet地圖
  window.taiwanMap = L.map('taiwanMap', {
    center: [23.6978, 120.9605], // 台灣中心點
    zoom: 7.5,
    minZoom: 7,
    maxZoom: 11,
    attributionControl: true,
    zoomControl: true
  });
  
  // 設置地圖瓦片圖層（根據主題選擇樣式）
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
  
  tileLayer.addTo(window.taiwanMap);
  
  // 創建標記圖層組
  markersLayer = L.layerGroup().addTo(window.taiwanMap);
  
  // 添加帳號數量標記
  addAccountMarkers();
  
  // 調整地圖視圖到台灣範圍
  window.taiwanMap.fitBounds([
    [21.5, 118.0], // 西南角 
    [25.5, 122.5]  // 東北角
  ]);
}

/**
 * 更新地圖
 */
function updateMap(data) {
  // 更新地圖數據
  processMapData(data);
  
  // 如果地圖尚未初始化，先初始化
  if (!window.taiwanMap) {
    initMap(data);
    return;
  }
  
  // 清空舊的標記
  if (markersLayer) {
    markersLayer.clearLayers();
  }
  
  // 添加新的標記
  addAccountMarkers();
}

/**
 * 添加帳號數量標記
 */
function addAccountMarkers() {
  if (!mapData || !mapData.features || !window.taiwanMap) {
    return;
  }
  
  // 台灣各縣市坐標（經緯度）
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
  
  // 遍歷數據特徵並添加標記
  mapData.features.forEach(feature => {
    const city = feature.properties.city;
    const count = feature.properties.count;
    const color = feature.properties.color;
    const roleData = JSON.parse(feature.properties.roleData);
    
    // 檢查是否有該城市的坐標
    if (cities[city]) {
      const [lat, lng] = cities[city];
      
      // 計算標記大小（根據帳號數量調整）
      const markerSize = Math.max(20, Math.sqrt(count) * 4);
      
      // 創建自定義圖標
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
          font-size: ${Math.max(10, Math.min(14, count.toString().length > 2 ? 10 : 12))}px;
        ">${count}</div>`,
        iconSize: [markerSize, markerSize],
        iconAnchor: [markerSize/2, markerSize/2]
      });
      
      // 創建標記
      const marker = L.marker([lat, lng], { icon: markerIcon });
      
      // 添加彈出窗口
      marker.bindPopup(createPopupContent(city, roleData), {
        maxWidth: 250
      });
      
      // 滑鼠懸停事件
      marker.on('mouseover', function() {
        this.openPopup();
      });
      
      // 添加到圖層
      markersLayer.addLayer(marker);
    }
  });
}

/**
 * 創建彈出窗口內容
 */
function createPopupContent(city, roleData) {
  // 獲取縣市對應的總帳號數
  let totalCount = 0;
  roleData.forEach(item => {
    totalCount += item.count;
  });
  
  // 生成彈出窗口內容
  let html = `
    <div class="map-popup">
      <h5 style="margin-top: 0; font-size: 16px; text-align: center; margin-bottom: 8px;">${city}</h5>
      <p style="text-align: center; font-weight: bold; margin-bottom: 10px;">總帳號數: ${totalCount}</p>
      <div style="display: flex; flex-direction: column;">
  `;
  
  // 添加角色分布信息
  roleData.forEach(item => {
    if (item.count > 0) {
      const percentage = Math.round((item.count / totalCount) * 100);
      html += `
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <span>${item.role}:</span>
          <span>${item.count} (${percentage}%)</span>
        </div>
      `;
    }
  });
  
  html += `</div></div>`;
  
  return html;
}

/**
 * 處理地圖數據
 */
function processMapData(data) {
  // 台灣各縣市坐標（這裡我們使用實際的經緯度）
  const cities = {
    '臺北市': { lat: 25.0598, lng: 121.5598 },
    '新北市': { lat: 24.9312, lng: 121.6739 },
    '桃園市': { lat: 24.9936, lng: 121.3010 },
    '臺中市': { lat: 24.1383, lng: 120.6839 },
    '臺南市': { lat: 22.9908, lng: 120.2133 },
    '高雄市': { lat: 22.6273, lng: 120.3133 },
    '基隆市': { lat: 25.1288, lng: 121.7414 },
    '新竹市': { lat: 24.8138, lng: 120.9647 },
    '嘉義市': { lat: 23.4801, lng: 120.4473 },
    '新竹縣': { lat: 24.7384, lng: 121.1252 },
    '苗栗縣': { lat: 24.5602, lng: 120.8202 },
    '彰化縣': { lat: 24.0517, lng: 120.5415 },
    '南投縣': { lat: 23.8310, lng: 120.9876 },
    '雲林縣': { lat: 23.7092, lng: 120.5249 },
    '嘉義縣': { lat: 23.4518, lng: 120.3897 },
    '屏東縣': { lat: 22.5520, lng: 120.4473 },
    '宜蘭縣': { lat: 24.7008, lng: 121.7195 },
    '花蓮縣': { lat: 23.9966, lng: 121.6010 },
    '臺東縣': { lat: 22.7583, lng: 121.1150 },
    '澎湖縣': { lat: 23.5713, lng: 119.5793 },
    '金門縣': { lat: 24.4493, lng: 118.3186 },
    '連江縣': { lat: 26.1521, lng: 119.9512 }
  };
  
  // 按縣市和角色統計帳號數量
  const countByCity = {};
  const countByRoleAndCity = {};
  const roles = ['fire', 'economic', 'labor', 'health', 'environment'];
  
  // 獲取角色的中文名稱
  const roleNames = {
    fire: '消防單位',
    economic: '經濟部',
    labor: '勞動部',
    health: '衛福部',
    environment: '環境部'
  };
  
  // 初始化計數對象
  Object.keys(cities).forEach(city => {
    countByCity[city] = 0;
    countByRoleAndCity[city] = {};
    
    roles.forEach(role => {
      countByRoleAndCity[city][role] = 0;
    });
  });
  
  // 遍歷數據並統計
  data.forEach(item => {
    if (cities[item.location]) {
      countByCity[item.location]++;
      
      if (countByRoleAndCity[item.location][item.role] !== undefined) {
        countByRoleAndCity[item.location][item.role]++;
      }
    }
  });
  
  // 計算每個縣市的最大帳號數量，用於確定標記大小
  let maxCount = 0;
  Object.values(countByCity).forEach(count => {
    if (count > maxCount) {
      maxCount = count;
    }
  });
  
  // 創建GeoJSON格式的數據
  const features = [];
  
  Object.keys(cities).forEach(city => {
    const count = countByCity[city];
    
    // 計算主要角色（該縣市中帳號數量最多的角色）
    let maxRoleCount = 0;
    let mainRole = '';
    
    Object.keys(countByRoleAndCity[city]).forEach(role => {
      const roleCount = countByRoleAndCity[city][role];
      
      if (roleCount > maxRoleCount) {
        maxRoleCount = roleCount;
        mainRole = role;
      }
    });
    
    // 如果有帳號數據，則添加到地圖
    if (count > 0) {
      features.push({
        type: 'Feature',
        properties: {
          city: city,
          count: count,
          color: CHART_COLORS[mainRole] || '#4e73df',
          roleData: JSON.stringify(Object.keys(countByRoleAndCity[city]).map(role => ({
            role: roleNames[role],
            count: countByRoleAndCity[city][role]
          })))
        }
      });
    }
  });
  
  // 存儲處理後的數據
  mapData = {
    type: 'FeatureCollection',
    features: features
  };
}

/**
 * 更新地圖主題
 */
function updateMapTheme() {
  // 如果地圖已初始化，重新創建它以應用新主題
  if (window.taiwanMap) {
    const data = window.cachedMockData || [];
    initMap(getFilteredData(data));
  }
} 