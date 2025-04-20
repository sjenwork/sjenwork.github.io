function initKeyboardShortcuts() {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const sidebarClose = document.getElementById('sidebarClose');
    const mainContent = document.getElementById('mainContent');
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const sections = document.querySelectorAll('.section');
    const pageTransitionOverlay = document.querySelector('.page-transition-overlay');
    const mobileSidebarOverlay = document.querySelector('.mobile-sidebar-overlay');
    const resourceSidebar = document.getElementById('resourceSidebar');
    
    // 顯示快捷鍵指南
    createShortcutGuide();
    
    // 用於長按Ctrl或Alt鍵的計時器
    let keyHoldTimer = null;
    // 追蹤按鍵是否已經顯示了指南
    let keyGuideShown = false;
    
    document.addEventListener('keydown', function(e) {
        // 如果用戶正在輸入，不處理快捷鍵
        if (document.activeElement.tagName === 'INPUT' || 
            document.activeElement.tagName === 'TEXTAREA') {
            return;
        }
        
        // 當按下Ctrl或Alt鍵時，設置計時器
        if ((e.key === 'Control' || e.key === 'Alt') && !keyHoldTimer && !keyGuideShown) {
            keyHoldTimer = setTimeout(() => {
                // 1秒後顯示快捷鍵指南
                showShortcutGuide();
                keyGuideShown = true;
            }, 200);
        }
        
        // SPACE 鍵：切換側邊欄
        if (e.key === ' ') {
            // 檢查resourceSidebar是否處於active狀態
            if (resourceSidebar && resourceSidebar.classList.contains('active')) {
                // 如果resourceSidebar處於active狀態，則不執行側邊欄切換
                console.log('【鍵盤快捷鍵】resourceSidebar處於active狀態，不執行側邊欄切換');
                return;
            }
            
            e.preventDefault();
            // 使用全局sidebarController來切換側邊欄
            if (window.sidebarController && typeof window.sidebarController.toggle === 'function') {
                window.sidebarController.toggle();
            } else {
                console.warn('警告：找不到sidebarController，無法切換側邊欄');
            }
        }
        
        // Alt + 數字鍵：切換到對應的部分
        if (e.altKey && !isNaN(parseInt(e.key)) && parseInt(e.key) > 0) {
            const index = parseInt(e.key) - 1;
            if (index < sidebarItems.length) {
                e.preventDefault();
                navigateToSection(sidebarItems[index]);
            }
        }
        
        // Alt + / 顯示快捷鍵指南
        if (e.altKey && e.key === '/') {
            e.preventDefault();
            toggleShortcutGuide();
        }
        
        // Home 或 Ctrl + 上箭頭：回到頂部
        if (e.key === 'Home' || (e.ctrlKey && e.key === 'ArrowUp')) {
            e.preventDefault();
            scrollToTop();
        }
        
        // 側邊欄項目的快捷鍵：Ctrl + 1-6
        if (e.ctrlKey && !isNaN(parseInt(e.key)) && parseInt(e.key) > 0) {
            const index = parseInt(e.key) - 1;
            if (index < sidebarItems.length) {
                e.preventDefault();
                navigateToSection(sidebarItems[index]);
            }
        }
    });
    
    // 按鍵釋放事件
    document.addEventListener('keyup', function(e) {
        // 當釋放Ctrl或Alt鍵時，清除計時器並隱藏指南
        if (e.key === 'Control' || e.key === 'Alt') {
            // 清除計時器
            if (keyHoldTimer) {
                clearTimeout(keyHoldTimer);
                keyHoldTimer = null;
            }
            
            // 如果指南是通過長按顯示的，則隱藏它
            if (keyGuideShown) {
                hideShortcutGuide();
                keyGuideShown = false;
            }
        }
    });
    
    // 導航到對應部分
    function navigateToSection(item) {
        if (!item) return;
        
        // 顯示頁面切換效果
        pageTransitionOverlay.classList.add('active');
        
        // 移除所有項目的活動狀態
        sidebarItems.forEach(i => i.classList.remove('active'));
        
        // 添加當前項目的活動狀態
        item.classList.add('active');
        
        // 獲取對應的部分ID
        const sectionId = item.getAttribute('data-section');
        
        // 使用延遲切換部分，使過渡效果更流暢
        setTimeout(() => {
            // 隱藏所有部分
            sections.forEach(section => section.classList.remove('active'));
            
            // 顯示對應的部分
            document.getElementById(sectionId).classList.add('active');
            
            // 隱藏頁面切換效果
            pageTransitionOverlay.classList.remove('active');
            
            // 滾動到頂部
            scrollToTop();
            
            // 重新初始化滾動檢測（適用於新顯示的部分）
            initScrollDetection();
        }, 300);
    }
    
    // 滾動到頂部
    function scrollToTop() {
        window.scrollTo({top: 0, behavior: 'smooth'});
    }
    
    // 創建快捷鍵指南
    function createShortcutGuide() {
        // 創建遮罩層
        if (!document.querySelector('.shortcut-guide-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'shortcut-guide-overlay';
            document.body.appendChild(overlay);
        }
        
        const guide = document.createElement('div');
        guide.className = 'shortcut-guide';
        
        // 添加 CSS 樣式到 head
        if (!document.getElementById('shortcut-guide-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'shortcut-guide-styles';
            styleSheet.textContent = `
                body.shortcut-guide-active {
                    overflow: hidden;
                }
                
                .shortcut-guide-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    z-index: 9998;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s var(--transition-function);
                }
                
                .shortcut-guide-overlay.active {
                    opacity: 1;
                    visibility: visible;
                }
                
                .shortcut-guide {
                    width: 600px;
                    max-width: 90%;
                    z-index: 9999;
                    overflow-y: auto;
                    overflow-x: hidden;
                }
                
                .guide-content {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: space-between;
                }
                
                .shortcut-section {
                    flex: 0 0 48%;
                    margin-bottom: 15px;
                }
                
                .shortcut-section:last-child {
                    margin-bottom: 0;
                }
                
                .section-heading {
                    color: var(--primary-color);
                    font-size: 1rem;
                    margin: 0 0 10px 0;
                    padding-bottom: 5px;
                    border-bottom: 1px solid var(--border-color);
                }
                
                .shortcut-guide .guide-content {
                    max-height: 400px;
                }
                
                @media (max-width: 768px) {
                    .shortcut-section {
                        flex: 0 0 100%;
                    }
                }
            `;
            document.head.appendChild(styleSheet);
        }
        
        guide.innerHTML = `
            <div class="guide-header">
                <h3>鍵盤快捷鍵</h3>
                <button class="guide-close"><i class="fa fa-times"></i></button>
            </div>
            <div class="guide-content">
                <div class="shortcut-section">
                    <h4 class="section-heading">一般操作</h4>
                    <div class="shortcut-item">
                        <span class="key">SPACE</span>
                        <span class="description">切換側邊欄</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="key">Home</span>
                        <span class="description">回到頂部</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="key">Alt + /</span>
                        <span class="description">顯示/隱藏此指南</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="key">長按 Ctrl/Alt</span>
                        <span class="description">臨時顯示此指南</span>
                    </div>
                </div>
                
                <div class="shortcut-section">
                    <h4 class="section-heading">頁面導航</h4>
                    <div class="shortcut-item">
                        <span class="key">Ctrl + 1</span>
                        <span class="description">簡報</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="key">Ctrl + 2</span>
                        <span class="description">專案</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="key">Ctrl + 3</span>
                        <span class="description">部落格</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="key">Ctrl + 4</span>
                        <span class="description">AI 實驗室</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="key">Ctrl + 5</span>
                        <span class="description">關於我</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="key">Ctrl + 6</span>
                        <span class="description">專業技能</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="key">Ctrl + 7</span>
                        <span class="description">網路資源</span>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(guide);
        
        // 關閉按鈕事件
        guide.querySelector('.guide-close').addEventListener('click', function() {
            hideShortcutGuide();
        });
        
        // 點擊遮罩層關閉指南
        document.querySelector('.shortcut-guide-overlay').addEventListener('click', function() {
            hideShortcutGuide();
        });
        
        // 防止快捷鍵指南內的滾動事件傳播到背景
        guide.addEventListener('wheel', function(e) {
            e.stopPropagation();
        });
    }
    
    // 切換快捷鍵指南顯示
    function toggleShortcutGuide() {
        const guide = document.querySelector('.shortcut-guide');
        if (guide.classList.contains('active')) {
            hideShortcutGuide();
        } else {
            showShortcutGuide();
        }
    }
    
    // 顯示快捷鍵指南
    function showShortcutGuide() {
        const guide = document.querySelector('.shortcut-guide');
        const overlay = document.querySelector('.shortcut-guide-overlay');
        
        // 顯示指南和遮罩
        guide.classList.add('active');
        overlay.classList.add('active');
        
        // 鎖定背景滾動
        document.body.classList.add('shortcut-guide-active');
    }
    
    // 隱藏快捷鍵指南
    function hideShortcutGuide() {
        const guide = document.querySelector('.shortcut-guide');
        const overlay = document.querySelector('.shortcut-guide-overlay');
        
        // 隱藏指南和遮罩
        guide.classList.remove('active');
        overlay.classList.remove('active');
        
        // 恢復背景滾動
        document.body.classList.remove('shortcut-guide-active');
    }
}

// 初始化鍵盤快捷鍵
document.addEventListener('DOMContentLoaded', function() {
    initKeyboardShortcuts();
});