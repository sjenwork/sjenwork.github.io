// 初始化主題切換功能
function initThemeSwitcher() {
    const themeOptions = document.querySelectorAll('.theme-option');
    const pageTransitionOverlay = document.querySelector('.page-transition-overlay');
    
    // 檢查本地存儲中是否有保存的主題
    const savedTheme = localStorage.getItem('preferred-theme');
    if (savedTheme) {
        setTheme(savedTheme);
        
        // 更新活動選項
        themeOptions.forEach(option => {
            if (option.getAttribute('data-theme') === savedTheme) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }
    
    // 為每個主題選項添加點擊事件
    themeOptions.forEach(option => {
        option.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            
            // 顯示頁面切換效果
            pageTransitionOverlay.classList.add('active');
            
            setTimeout(() => {
                // 移除所有選項的活動狀態
                themeOptions.forEach(opt => opt.classList.remove('active'));
                
                // 設置當前選項為活動狀態
                this.classList.add('active');
                
                // 設置主題
                setTheme(theme);
                
                // 保存偏好到本地存儲
                localStorage.setItem('preferred-theme', theme);
                
                // 隱藏頁面切換效果
                pageTransitionOverlay.classList.remove('active');
            }, 300);
        });
    });
}

// 設置主題
function setTheme(theme) {
    // 移除舊主題
    document.documentElement.removeAttribute('data-theme');
    
    // 如果不是默認主題，則添加新主題
    if (theme !== 'default') {
        document.documentElement.setAttribute('data-theme', theme);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initThemeSwitcher();
});