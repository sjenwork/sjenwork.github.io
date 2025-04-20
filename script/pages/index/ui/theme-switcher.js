// 主題切換器功能
document.addEventListener('DOMContentLoaded', function() {
    // 初始化主題切換器
    initThemeSwitcher();
    
    // 從localStorage獲取保存的主題
    const savedTheme = localStorage.getItem('preferred-theme') || 'default';
    setTheme(savedTheme);
});

// 初始化主題切換器
function initThemeSwitcher() {
    // 創建漂浮主題切換器
    const themeSwitcher = document.createElement('div');
    themeSwitcher.className = 'theme-switcher';
    
    // 定義主題配置
    const themes = [
        { name: 'default', title: '藍紫主題' },
        { name: 'dark', title: '深色主題' },
        { name: 'green', title: '綠色主題' },
        { name: 'ocean', title: '海洋主題' },
        { name: 'warm', title: '暖色主題' }
    ];
    
    // 創建每個主題選項
    themes.forEach(theme => {
        const themeOption = document.createElement('div');
        themeOption.className = 'theme-option';
        themeOption.setAttribute('data-theme', theme.name);
        themeOption.setAttribute('title', theme.title);
        
        // 點擊事件切換主題
        themeOption.addEventListener('click', function() {
            const pageTransitionOverlay = document.querySelector('.page-transition-overlay');
            
            // 顯示頁面切換效果
            if (pageTransitionOverlay) {
                pageTransitionOverlay.classList.add('active');
            }
            
            setTimeout(() => {
                setTheme(theme.name);
                
                // 隱藏頁面切換效果
                if (pageTransitionOverlay) {
                    pageTransitionOverlay.classList.remove('active');
                }
            }, 300);
        });
        
        themeSwitcher.appendChild(themeOption);
    });
    
    // 將主題切換器添加到頁面
    document.body.appendChild(themeSwitcher);
    
    // 標記當前主題
    updateActiveThemeOption();
}

// 設定主題
function setTheme(theme) {
    // 移除舊主題
    document.documentElement.removeAttribute('data-theme');
    
    // 如果不是默認主題，則添加新主題
    if (theme !== 'default') {
        document.documentElement.setAttribute('data-theme', theme);
    }
    
    // 保存主題設置到本地存儲
    localStorage.setItem('preferred-theme', theme);
    
    // 更新激活的主題選項
    updateActiveThemeOption();
}

// 更新當前激活的主題選項
function updateActiveThemeOption() {
    const currentTheme = localStorage.getItem('preferred-theme') || 'default';
    
    // 移除所有主題選項的active類
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.remove('active');
    });
    
    // 給當前主題添加active類
    const activeOptions = document.querySelectorAll(`.theme-option[data-theme="${currentTheme}"]`);
    activeOptions.forEach(option => {
        option.classList.add('active');
    });
} 