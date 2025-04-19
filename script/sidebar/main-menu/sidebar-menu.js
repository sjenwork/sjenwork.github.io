/**
 * 主側邊欄菜單功能
 * 處理側邊欄的顯示、隱藏和導航功能
 */

// 將側邊欄控制器暴露為全局變數
window.sidebarController = null;

// 初始化側邊欄功能
function initSidebar() {
    
    const menuToggle = document.getElementById('menuToggle');
    const sidebarClose = document.getElementById('sidebarClose');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const mobileSidebarOverlay = document.querySelector('.mobile-sidebar-overlay');
    
    // 檢查DOM元素是否存在
    if (!menuToggle) {
        console.error('【側邊欄】找不到menuToggle按鈕元素！');
    }
    if (!sidebar) {
        console.error('【側邊欄】找不到sidebar元素！');
        return; // 無法繼續初始化
    }
    
    
    // 菜單按鈕點擊事件 - 切換側邊欄開關
    if (menuToggle) {
        // 移除舊的事件監聽器（如果有的話）
        menuToggle.removeEventListener('click', menuToggleHandler);
        
        // 添加新的事件監聽器
        menuToggle.addEventListener('click', menuToggleHandler);
    }
    
    // 菜單按鈕點擊處理函數
    function menuToggleHandler(e) {
        // 防止事件冒泡到mainContent
        e.stopPropagation();
        
        // 切換側邊欄
        toggleSidebar();
    }
    
    // 側邊欄關閉按鈕點擊事件
    if (sidebarClose) {
        sidebarClose.addEventListener('click', function(e) {
            e.stopPropagation();
            
            closeSidebar();
        });
    }
    
    // 點擊毛玻璃覆蓋層關閉側邊欄
    if (mobileSidebarOverlay) {
        mobileSidebarOverlay.addEventListener('click', function() {
            closeSidebar();
        });
    }
    
    // 側邊欄切換函數
    function toggleSidebar() {
        if (sidebar.classList.contains('open')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    }
    
    // 打開側邊欄函數
    function openSidebar() {
        sidebar.classList.add('open');
        
        // 在大屏幕上移動主內容區
        if (window.innerWidth > 768) {
            mainContent.classList.add('shifted');
        } else {
            // 小屏幕下激活覆蓋層
            if (mobileSidebarOverlay) {
                mobileSidebarOverlay.classList.add('active');
            }
            // 禁止背景滾動
            document.body.classList.add('sidebar-open');
        }
    }
    
    // 關閉側邊欄函數
    function closeSidebar() {
        console.log('【側邊欄】關閉側邊欄');
        sidebar.classList.remove('open');
        
        // 在大屏幕上恢復主內容區
        if (window.innerWidth > 768) {
            mainContent.classList.remove('shifted');
        } else {
            // 小屏幕下移除覆蓋層
            if (mobileSidebarOverlay) {
                mobileSidebarOverlay.classList.remove('active');
            }
            // 恢復背景滾動
            document.body.classList.remove('sidebar-open');
        }
    }
    
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
            
            // 記錄用戶訪問的區域，更新URL
            if (window.updateUrlWithSection && typeof window.updateUrlWithSection === 'function') {
                window.updateUrlWithSection(sectionId);
            }
            
            // 在移動設備上關閉側邊欄
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        });
    });
    
    // 點擊主內容區域時在移動設備上關閉側邊欄
    mainContent.addEventListener('click', function() {
        if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
            closeSidebar();
        }
    });
    
    // 監聽窗口大小變化，自動調整側邊欄狀態
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            // 在大屏幕上，如果側邊欄打開，確保主內容移動
            if (sidebar.classList.contains('open')) {
                mainContent.classList.add('shifted');
            }
            // 移除移動設備相關樣式
            mobileSidebarOverlay?.classList.remove('active');
            document.body.classList.remove('sidebar-open');
        } else {
            // 在小屏幕上，主內容不移動
            mainContent.classList.remove('shifted');
            // 如果側邊欄打開，確保覆蓋層和body樣式正確
            if (sidebar.classList.contains('open')) {
                mobileSidebarOverlay?.classList.add('active');
                document.body.classList.add('sidebar-open');
            }
        }
    });
    
    // 導出側邊欄操作函數到全局，以便其他腳本使用
    window.sidebarController = {
        open: openSidebar,
        close: closeSidebar,
        toggle: toggleSidebar
    };
    
    return window.sidebarController;
}

// 在DOM加載完成後初始化側邊欄功能
document.addEventListener('DOMContentLoaded', function() {
    initSidebar();
}); 