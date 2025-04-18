// 頁面載入後執行
document.addEventListener('DOMContentLoaded', function() {
    // 獲取DOM元素
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const mainContent = document.getElementById('mainContent');
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const sections = document.querySelectorAll('.section');
    const pageTransitionOverlay = document.querySelector('.page-transition-overlay');
    
    // 確保側邊欄初始狀態為收起
    sidebar.classList.remove('open');
    mainContent.classList.remove('shifted');
    
    // 側邊欄項目點擊事件
    sidebarItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 顯示頁面切換效果
            pageTransitionOverlay.classList.add('active');
            
            // 移除所有項目的活動狀態
            sidebarItems.forEach(i => i.classList.remove('active'));
            
            // 添加當前項目的活動狀態
            this.classList.add('active');
            
            // 獲取對應的部分ID
            const sectionId = this.getAttribute('data-section');
            
            // 使用延遲切換部分，使過渡效果更流暢
            setTimeout(() => {
                // 隱藏所有部分
                sections.forEach(section => section.classList.remove('active'));
                
                // 顯示對應的部分
                document.getElementById(sectionId).classList.add('active');
                
                // 在小螢幕上點擊後關閉sidebar
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('open');
                    menuToggle.classList.remove('open');
                }
                
                // 隱藏頁面切換效果
                pageTransitionOverlay.classList.remove('active');
                
                // 滾動到頂部
                window.scrollTo({top: 0, behavior: 'smooth'});
                
                // 重新初始化滾動檢測（適用於新顯示的部分）
                if (window.initScrollDetection) {
                    window.initScrollDetection();
                }
                
                // 更新URL中的部分參數，但不刷新頁面
                updateUrlWithSection(sectionId);
                
                // 保存最後訪問的頁面到localStorage
                localStorage.setItem('last-visited-section', sectionId);
            }, 300);
        });
    });
    
    // 在小屏幕下點擊主內容區域時關閉側邊欄
    mainContent.addEventListener('click', function() {
        if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            menuToggle.classList.remove('open');
        }
    });
    
    // 處理窗口大小變化
    window.addEventListener('resize', function() {
        // 如果從小屏幕切換到大屏幕，且側邊欄是開啟的，確保主內容區域也有對應的shifted類
        if (window.innerWidth > 768 && sidebar.classList.contains('open')) {
            mainContent.classList.add('shifted');
        }
    });
    
    // 初始化側邊欄
    initSidebar();
    
    
    // 添加回到頂部按鈕
    addBackToTopButton();
    
    // 初始化手機手勢
    initMobileGestures();
    
    // 根據URL參數或默認設置打開特定頁面
    openInitialSection();
    
});

// 根據URL參數或默認設置打開特定頁面
function openInitialSection() {
    // 從URL獲取section參數
    const urlParams = new URLSearchParams(window.location.search);
    const sectionParam = urlParams.get('section');
    
    // 如果URL中有指定section參數
    if (sectionParam) {
        // 查找匹配的側邊欄項目
        const targetItem = document.querySelector(`.sidebar-item[data-section="${sectionParam}"]`);
        if (targetItem) {
            // 模擬點擊該項目
            targetItem.click();
            return;
        }
    }
    
    // 如果URL中沒有參數，或者參數無效，檢查本地存儲中的最後訪問頁面
    const lastVisitedSection = localStorage.getItem('last-visited-section');
    if (lastVisitedSection) {
        const lastVisitedItem = document.querySelector(`.sidebar-item[data-section="${lastVisitedSection}"]`);
        if (lastVisitedItem) {
            lastVisitedItem.click();
            return;
        }
    }
    
    // 如果沒有URL參數和最後訪問記錄，則檢查是否有用戶設置的默認頁面
    const defaultSection = localStorage.getItem('default-section');
    if (defaultSection) {
        const defaultItem = document.querySelector(`.sidebar-item[data-section="${defaultSection}"]`);
        if (defaultItem) {
            defaultItem.click();
            return;
        }
    }
    
    // 如果以上都沒有，則使用第一個側邊欄項目（默認行為）
    // 第一個側邊欄項目通常是自動選擇的，因此這裡不需要額外操作
}

// 更新URL中的部分參數，但不刷新頁面
function updateUrlWithSection(sectionId) {
    if (history.pushState) {
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('section', sectionId);
        window.history.pushState({path: newUrl.href}, '', newUrl.href);
    }
}

// 添加設置默認頁面功能
function initDefaultSectionSetting() {
    // 創建設置默認頁面的UI元素（可以在設置菜單或其他適當位置添加）
    const settingsContainer = document.getElementById('settingsContainer');
    if (!settingsContainer) return;
    
    const defaultSectionSetting = document.createElement('div');
    defaultSectionSetting.className = 'setting-item';
    defaultSectionSetting.innerHTML = `
        <h4>設置默認頁面</h4>
        <p>選擇網站載入時自動打開的頁面：</p>
        <select id="defaultSectionSelect">
            <option value="">無（使用首頁）</option>
        </select>
        <button id="saveDefaultSection" class="setting-button">保存設置</button>
    `;
    
    settingsContainer.appendChild(defaultSectionSetting);
    
    // 填充選項
    const selectElement = document.getElementById('defaultSectionSelect');
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    
    sidebarItems.forEach(item => {
        const sectionId = item.getAttribute('data-section');
        const sectionName = item.textContent.trim();
        const option = document.createElement('option');
        option.value = sectionId;
        option.textContent = sectionName;
        
        // 如果是當前保存的默認值，則設為選中
        if (sectionId === localStorage.getItem('default-section')) {
            option.selected = true;
        }
        
        selectElement.appendChild(option);
    });
    
    // 保存按鈕點擊事件
    document.getElementById('saveDefaultSection').addEventListener('click', function() {
        const selectedValue = selectElement.value;
        
        if (selectedValue) {
            localStorage.setItem('default-section', selectedValue);
            alert('默認頁面設置已保存！下次訪問網站時將自動打開所選頁面。');
        } else {
            // 如果選擇"無"，則清除本地存儲中的設置
            localStorage.removeItem('default-section');
            alert('已清除默認頁面設置，網站將使用標準首頁。');
        }
    });
}

// 初始化側邊欄功能
function initSidebar() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    
    // 菜單按鈕點擊事件
    menuToggle.addEventListener('click', function(e) {
        // 防止事件冒泡到mainContent
        e.stopPropagation();
        
        sidebar.classList.toggle('open');
        this.classList.toggle('open');
        
        // 在大屏幕上移動主內容區
        if (window.innerWidth > 768) {
            mainContent.classList.toggle('shifted');
        }
        
        // 根據側邊欄狀態修改按鈕圖標
        if(sidebar.classList.contains('open')) {
            // 如果側邊欄打開，改變圖標為關閉圖標
            this.querySelector('i').className = 'fa fa-times';
        } else {
            // 如果側邊欄關閉，改變圖標為菜單圖標
            this.querySelector('i').className = 'fa fa-bars';
        }
    });
    
    // 點擊側邊欄項目
    sidebarItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 移除所有項目的活動狀態
            sidebarItems.forEach(i => i.classList.remove('active'));
            
            // 設置當前項目為活動狀態
            this.classList.add('active');
            
            // 獲取對應的部分ID
            const sectionId = this.getAttribute('data-section');
            
            // 隱藏所有部分
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });
            
            // 顯示所選部分
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
            
            // 在移動設備上關閉側邊欄
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
                menuToggle.classList.remove('open');
            }
        });
    });
    
    // 點擊主內容區域時在移動設備上關閉側邊欄
    mainContent.addEventListener('click', function() {
        if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            menuToggle.classList.remove('open');
        }
    });
}

// 添加回到頂部按鈕
function addBackToTopButton() {
    const button = document.createElement('button');
    button.className = 'back-to-top glass-effect';
    button.innerHTML = '<i class="fa fa-arrow-up"></i>';
    document.body.appendChild(button);
    
    // 滾動時顯示/隱藏按鈕
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    
    // 點擊回到頂部
    button.addEventListener('click', function() {
        window.scrollTo({top: 0, behavior: 'smooth'});
    });
}
