// 頁面載入後執行
document.addEventListener('DOMContentLoaded', function() {
    // 獲取DOM元素
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const mainContent = document.getElementById('mainContent');
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const sections = document.querySelectorAll('.section');
    const pageTransitionOverlay = document.querySelector('.page-transition-overlay');
    
    // 為每個卡片和技能項添加淡入效果類
    const fadeElements = document.querySelectorAll('.slide-card, .project-card, .blog-card, .skill-item, .resource-item');
    fadeElements.forEach(element => {
        element.classList.add('fade-in-element');
    });
    
    // 初始化滾動檢測
    initScrollDetection();
    
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
                initScrollDetection();
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
        
        // 重新初始化滾動檢測
        initScrollDetection();
    });
    
    // 加載技能數據並生成技能列表
    loadSkills();
    
    // 加載聯絡資訊
    loadContactInfo();
    
    // 初始化側邊欄
    initSidebar();
    
    // 初始化主題切換器
    initThemeSwitcher();
    
    // 初始化鍵盤快捷鍵
    initKeyboardShortcuts();
    
    // 添加回到頂部按鈕
    addBackToTopButton();
    
    // 初始化手機手勢
    initMobileGestures();
    
    // 初始化 AI 實驗室功能
    initPlaygroundFeatures();
    
    console.log("側邊欄功能已初始化");
});

// 初始化滾動檢測
function initScrollDetection() {
    const fadeElements = document.querySelectorAll('.fade-in-element');
    
    // 檢查元素是否在視口中
    function checkVisibility() {
        fadeElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            const isVisible = (elementTop < window.innerHeight - 100) && (elementBottom > 0);
            
            if (isVisible) {
                element.classList.add('visible');
            }
        });
    }
    
    // 初始檢查
    checkVisibility();
    
    // 滾動時檢查
    window.addEventListener('scroll', checkVisibility);
}

// 從JSON文件加載技能數據並動態生成技能列表
function loadSkills() {
    const skillsContainer = document.getElementById('skills-container');
    
    if (!skillsContainer) {
        console.error('找不到技能容器元素');
        return;
    }
    
    // 使用fetch API加載skills.json文件
    fetch('json/skills.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('無法加載技能數據：' + response.status);
            }
            return response.json();
        })
        .then(skills => {
            // 清空容器
            skillsContainer.innerHTML = '';
            
            // 為每個技能創建元素
            skills.forEach(skill => {
                const skillItem = document.createElement('div');
                skillItem.className = 'skill-item fade-in-element';
                
                const icon = document.createElement('i');
                icon.className = skill.icon + ' skill-icon';
                
                const name = document.createElement('span');
                name.textContent = skill.name;
                
                skillItem.appendChild(icon);
                skillItem.appendChild(name);
                skillsContainer.appendChild(skillItem);
            });
            
            // 重新初始化滾動檢測
            initScrollDetection();
        })
        .catch(error => {
            console.error('加載技能數據時出錯：', error);
            skillsContainer.innerHTML = '<p style="color: red;">無法加載技能數據，請稍後再試。</p>';
        });
}

// 從JSON文件加載聯絡資訊
function loadContactInfo() {
    const aboutContentElement = document.querySelector('.about-content');
    
    if (!aboutContentElement) {
        console.error('找不到about-content元素');
        return;
    }
    
    // 使用fetch API加載contact.json文件
    fetch('json/contact.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('無法加載聯絡資訊：' + response.status);
            }
            return response.json();
        })
        .then(data => {
            // 清空容器
            aboutContentElement.innerHTML = '';
            
            // 添加自我介紹段落
            data.intro.forEach(paragraph => {
                const p = document.createElement('p');
                p.textContent = paragraph;
                p.style.marginBottom = '1.5rem';
                aboutContentElement.appendChild(p);
            });
            
            // 添加聯絡方式標題
            const h3 = document.createElement('h3');
            h3.textContent = data.contactTitle;
            h3.style.color = 'var(--primary-color)';
            h3.style.margin = '2rem 0 1rem';
            aboutContentElement.appendChild(h3);
            
            // 添加聯絡方式
            data.contacts.forEach(contact => {
                const p = document.createElement('p');
                
                // 創建圖標
                const icon = document.createElement('i');
                icon.className = `fas fab ${contact.icon}`;
                icon.style.color = 'var(--primary-color)';
                icon.style.marginRight = '10px';
                
                // 創建鏈接
                const link = document.createElement('a');
                link.href = contact.link;
                link.textContent = contact.value;
                link.style.color = 'var(--text-color)';
                link.style.textDecoration = 'none';
                
                // 如果是GitHub鏈接，添加target="_blank"
                if (contact.type === 'github') {
                    link.target = '_blank';
                }
                
                // 組裝
                p.appendChild(icon);
                p.appendChild(link);
                aboutContentElement.appendChild(p);
            });
        })
        .catch(error => {
            console.error('加載聯絡資訊時出錯：', error);
            aboutContentElement.innerHTML = '<p style="color: red;">無法加載聯絡資訊，請稍後再試。</p>';
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

// 初始化鍵盤快捷鍵
function initKeyboardShortcuts() {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const mainContent = document.getElementById('mainContent');
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const sections = document.querySelectorAll('.section');
    const pageTransitionOverlay = document.querySelector('.page-transition-overlay');
    
    // 顯示快捷鍵指南
    createShortcutGuide();
    
    document.addEventListener('keydown', function(e) {
        // 如果用戶正在輸入，不處理快捷鍵
        if (document.activeElement.tagName === 'INPUT' || 
            document.activeElement.tagName === 'TEXTAREA') {
            return;
        }
        
        // ESC 鍵：切換側邊欄
        if (e.key === 'Escape') {
            e.preventDefault();
            toggleSidebar();
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
    
    // 切換側邊欄
    function toggleSidebar() {
        sidebar.classList.toggle('open');
        menuToggle.classList.toggle('open');
        
        if (sidebar.classList.contains('open')) {
            menuToggle.querySelector('i').className = 'fa fa-times';
        } else {
            menuToggle.querySelector('i').className = 'fa fa-bars';
        }
        
        // 在大屏幕上移動主內容區
        if (window.innerWidth > 768) {
            mainContent.classList.toggle('shifted');
        }
    }
    
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
        const guide = document.createElement('div');
        guide.className = 'shortcut-guide';
        guide.innerHTML = `
            <div class="guide-header">
                <h3>鍵盤快捷鍵</h3>
                <button class="guide-close"><i class="fa fa-times"></i></button>
            </div>
            <div class="guide-content">
                <div class="shortcut-item">
                    <span class="key">ESC</span>
                    <span class="description">切換側邊欄</span>
                </div>
                <div class="shortcut-item">
                    <span class="key">Ctrl + 1-6</span>
                    <span class="description">切換到對應頁面</span>
                </div>
                <div class="shortcut-item">
                    <span class="key">Home</span>
                    <span class="description">回到頂部</span>
                </div>
                <div class="shortcut-item">
                    <span class="key">Alt + /</span>
                    <span class="description">顯示/隱藏此指南</span>
                </div>
            </div>
        `;
        document.body.appendChild(guide);
        
        // 關閉按鈕事件
        guide.querySelector('.guide-close').addEventListener('click', function() {
            guide.classList.remove('active');
        });
        
        // 點擊其他區域關閉指南
        document.addEventListener('click', function(e) {
            if (!guide.contains(e.target) && guide.classList.contains('active')) {
                guide.classList.remove('active');
            }
        });
    }
    
    // 切換快捷鍵指南顯示
    function toggleShortcutGuide() {
        const guide = document.querySelector('.shortcut-guide');
        guide.classList.toggle('active');
    }
}

// 添加回到頂部按鈕
function addBackToTopButton() {
    const button = document.createElement('button');
    button.className = 'back-to-top';
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

// 初始化手機手勢
function initMobileGestures() {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const mainContent = document.getElementById('mainContent');
    const activeSection = document.querySelector('.section.active');
    
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;
    let touchStartTime = 0;
    
    // 最小滑動距離 (px)
    const minSwipeDistance = 50;
    
    // 滑動時間閾值 (ms)
    const maxSwipeTime = 300;
    
    // 添加顯示手勢提示按鈕
    addGestureTipsButton();
    
    // 捕獲開始觸摸事件
    document.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        touchStartTime = new Date().getTime();
    }, { passive: true });
    
    // 捕獲觸摸結束事件
    document.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        const touchEndTime = new Date().getTime();
        
        // 計算水平和垂直滑動距離
        const swipeDistanceX = touchEndX - touchStartX;
        const swipeDistanceY = touchEndY - touchStartY;
        const swipeTime = touchEndTime - touchStartTime;
        
        // 計算滑動角度，確定是水平還是垂直滑動
        const swipeAngle = Math.abs(Math.atan2(swipeDistanceY, swipeDistanceX) * 180 / Math.PI);
        const isHorizontalSwipe = (swipeAngle < 45 || swipeAngle > 135);
        
        // 只處理快速滑動
        if (swipeTime > maxSwipeTime) return;
        
        // 處理雙指手勢 (如果可用)
        if (e.touches && e.touches.length > 1) {
            // 雙指向下滑動返回頂部
            if (!isHorizontalSwipe && swipeDistanceY > minSwipeDistance) {
                window.scrollTo({top: 0, behavior: 'smooth'});
            }
        }
        
        // 當側邊欄關閉時，處理左右滑動切換頁面功能
        if (isHorizontalSwipe && Math.abs(swipeDistanceX) > minSwipeDistance * 1.5 && !sidebar.classList.contains('open')) {
            const currentSection = document.querySelector('.section.active');
            const currentItem = document.querySelector('.sidebar-item.active');
            
            if (currentItem) {
                const allItems = Array.from(document.querySelectorAll('.sidebar-item'));
                const currentIndex = allItems.indexOf(currentItem);
                
                // 向左滑動，顯示下一個部分
                if (swipeDistanceX < 0 && currentIndex < allItems.length - 1) {
                    showPageTransition();
                    setTimeout(() => {
                        allItems[currentIndex + 1].click();
                    }, 100);
                }
                // 向右滑動，顯示上一個部分
                else if (swipeDistanceX > 0 && currentIndex > 0) {
                    showPageTransition();
                    setTimeout(() => {
                        allItems[currentIndex - 1].click();
                    }, 100);
                }
            }
        }
    });
    
    // 添加雙指左右滑動手勢處理
    let multiTouchStartX = 0;
    
    document.addEventListener('touchstart', function(e) {
        // 檢測是否是雙指觸摸
        if (e.touches.length === 2) {
            // 記錄雙指觸摸的起始X坐標（使用兩指的平均位置）
            multiTouchStartX = (e.touches[0].screenX + e.touches[1].screenX) / 2;
        }
    }, { passive: true });
    
    document.addEventListener('touchend', function(e) {
        // 檢測是否由雙指觸摸結束（通過originalEvent）
        if (e.changedTouches.length === 2 || 
            (e.changedTouches.length === 1 && e.touches.length === 0 && multiTouchStartX !== 0)) {
            
            // 計算雙指滑動的結束X坐標（使用結束時的平均位置）
            const multiTouchEndX = (e.changedTouches[0].screenX + 
                                   (e.changedTouches[1] ? e.changedTouches[1].screenX : e.changedTouches[0].screenX)) / 2;
            
            // 計算雙指水平滑動距離
            const multiSwipeDistance = multiTouchEndX - multiTouchStartX;
            
            // 判斷是左滑還是右滑，並且設置最小滑動距離門檻
            if (Math.abs(multiSwipeDistance) > minSwipeDistance * 1.2) {
                // 雙指向右滑動 - 打開側邊欄
                if (multiSwipeDistance > 0 && !sidebar.classList.contains('open')) {
                    sidebar.classList.add('open');
                    menuToggle.classList.add('open');
                    menuToggle.querySelector('i').className = 'fa fa-times';
                    
                    // 在大屏幕上移動主內容區
                    if (window.innerWidth > 768) {
                        mainContent.classList.add('shifted');
                    }
                    
                    // 添加振動反饋
                    if (window.navigator && window.navigator.vibrate) {
                        window.navigator.vibrate(50);
                    }
                }
                // 雙指向左滑動 - 關閉側邊欄
                else if (multiSwipeDistance < 0 && sidebar.classList.contains('open')) {
                    sidebar.classList.remove('open');
                    menuToggle.classList.remove('open');
                    menuToggle.querySelector('i').className = 'fa fa-bars';
                    
                    // 添加振動反饋
                    if (window.navigator && window.navigator.vibrate) {
                        window.navigator.vibrate(50);
                    }
                }
            }
            
            // 重置雙指起始位置
            multiTouchStartX = 0;
        }
    }, { passive: true });
    
    // 處理頁面切換動畫
    function showPageTransition() {
        const overlay = document.querySelector('.page-transition-overlay');
        overlay.classList.add('active');
        setTimeout(() => {
            overlay.classList.remove('active');
        }, 500);
    }
    
    // 添加手勢提示按鈕和對話框
    function addGestureTipsButton() {
        // 創建手勢提示按鈕
        const tipsButton = document.createElement('button');
        tipsButton.className = 'gesture-tips-button';
        tipsButton.innerHTML = '<i class="fa fa-hand-pointer"></i>';
        tipsButton.setAttribute('title', '手勢操作說明');
        document.body.appendChild(tipsButton);
        
        // 創建手勢提示對話框
        const tipsDialog = document.createElement('div');
        tipsDialog.className = 'gesture-tips-dialog';
        tipsDialog.innerHTML = `
            <div class="tips-header">
                <h3>手勢操作指南</h3>
                <button class="tips-close"><i class="fa fa-times"></i></button>
            </div>
            <div class="tips-content">
                <div class="gesture-item">
                    <div class="gesture-icon"><i class="fa fa-arrow-circle-right"></i></div>
                    <div class="gesture-desc">
                        <h4>雙指向右滑動</h4>
                        <p>使用兩根手指向右滑動可打開側邊欄</p>
                    </div>
                </div>
                <div class="gesture-item">
                    <div class="gesture-icon"><i class="fa fa-arrow-circle-left"></i></div>
                    <div class="gesture-desc">
                        <h4>雙指向左滑動</h4>
                        <p>側邊欄開啟時，使用兩根手指向左滑動可關閉側邊欄</p>
                    </div>
                </div>
                <div class="gesture-item">
                    <div class="gesture-icon"><i class="fa fa-exchange"></i></div>
                    <div class="gesture-desc">
                        <h4>左右滑動切換頁面</h4>
                        <p>在主內容區域左右滑動可切換不同頁面</p>
                    </div>
                </div>
                <div class="gesture-item">
                    <div class="gesture-icon"><i class="fa fa-arrows-v"></i></div>
                    <div class="gesture-desc">
                        <h4>雙指下滑</h4>
                        <p>使用兩根手指向下滑動可快速回到頁面頂部</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(tipsDialog);
        
        // 顯示/隱藏提示對話框
        tipsButton.addEventListener('click', function() {
            tipsDialog.classList.toggle('active');
        });
        
        // 關閉按鈕事件
        tipsDialog.querySelector('.tips-close').addEventListener('click', function() {
            tipsDialog.classList.remove('active');
        });
        
        // 點擊其他區域關閉提示
        document.addEventListener('click', function(e) {
            if (!tipsDialog.contains(e.target) && !tipsButton.contains(e.target) && tipsDialog.classList.contains('active')) {
                tipsDialog.classList.remove('active');
            }
        });
        
        // 在首次訪問時顯示手勢提示
        if (!localStorage.getItem('gesture-tips-shown')) {
            setTimeout(() => {
                tipsDialog.classList.add('active');
                localStorage.setItem('gesture-tips-shown', 'true');
            }, 2000);
        }
    }
}

// AI 實驗室功能
function initPlaygroundFeatures() {
    // 模擬延遲時間 (500-2000ms)
    function getRandomDelay() {
        return Math.floor(Math.random() * 1500) + 500;
    }
    
    // 顯示加載動畫
    function showLoading(resultElement) {
        const placeholder = resultElement.querySelector('.result-placeholder');
        const content = resultElement.querySelector('.result-content');
        
        placeholder.innerHTML = '<i class="fa fa-spinner fa-spin"></i> AI 處理中...';
        placeholder.style.display = 'block';
        content.style.display = 'none';
    }
    
    // 顯示結果
    function showResult(resultElement, resultText) {
        const placeholder = resultElement.querySelector('.result-placeholder');
        const content = resultElement.querySelector('.result-content');
        
        content.textContent = resultText;
        placeholder.style.display = 'none';
        content.style.display = 'block';
    }
    
    // 文本生成功能
    const textGenerationButtons = document.querySelectorAll('[data-function="text-generation"]');
    textGenerationButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.playground-card');
            const input = card.querySelector('.playground-input').value.trim();
            const resultElement = card.querySelector('.playground-result');
            
            if (!input) {
                alert('請輸入提示詞以生成文本！');
                return;
            }
            
            showLoading(resultElement);
            
            // 模擬AI處理
            setTimeout(() => {
                let generatedText = '';
                
                // 根據不同提示詞生成不同類型的示例文本
                if (input.includes('詩') || input.includes('poem')) {
                    generatedText = "流光溢彩的科技海洋，\n智慧如浪潮翻湧不息，\n人類的思維與機器交融，\n開創萬物互聯的新紀元。\n\n在數據的星空中漫遊，\n我們共譜未來的序章，\n讓創新引領前行的步伐，\n在無限可能中綻放希望。";
                } else if (input.includes('故事') || input.includes('story')) {
                    generatedText = "在2050年的台北，老陳是一位退休工程師，他的家中有一個名叫「小智」的AI助手。某天早晨，小智突然向老陳展示了一段他從未見過的童年影像。「這怎麼可能？」老陳驚訝地問道，這些是他五歲時的畫面，而那時數碼相機還未普及。\n\n小智解釋說它通過分析老陳的記憶描述和家族照片，利用神經網絡重建了這些珍貴瞬間。老陳看著屏幕上自己和早已離世母親的互動，淚水盈眶。科技不僅連接了現在和未來，也成為連接過去的橋樑。";
                } else if (input.includes('報告') || input.includes('report')) {
                    generatedText = "人工智能發展趨勢報告\n\n近年來，人工智能技術呈現以下五大趨勢：\n\n1. 多模態模型的崛起：結合文本、圖像、聲音等多種數據類型的AI模型正成為主流。\n\n2. 智能體(Agent)技術的發展：具有自主決策能力的AI系統顯示出解決複雜問題的潛力。\n\n3. 邊緣計算與AI結合：將AI計算能力部署到終端設備，減少延遲並增強隱私保護。\n\n4. 個性化定制模型：小型專業化模型在特定領域超越通用大模型。\n\n5. AI民主化工具：低代碼/無代碼平台使更多非技術人員能夠開發AI應用。";
                } else {
                    generatedText = "感謝您的提示！基於您的輸入，我生成了以下內容：\n\n" + input + "是一個引人深思的話題。在現代社會中，我們不斷探索和發展這一領域，尋求突破和創新。從歷史角度來看，這一概念經歷了多次演變，如今已形成了完整的理論體系和應用框架。\n\n未來，隨著技術的進步和人們認識的深入，我們有理由相信這一領域將迎來更廣闊的發展前景，為人類社會帶來更多正面影響和價值。";
                }
                
                showResult(resultElement, generatedText);
            }, getRandomDelay());
        });
    });
    
    // 圖片上傳預覽
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');
    
    if (imageUpload && imagePreview) {
        imageUpload.addEventListener('change', function() {
            const file = this.files[0];
            if (file && file.type.match('image.*')) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    imagePreview.src = e.target.result;
                    imagePreview.style.display = 'block';
                    
                    // 啟用分析按鈕
                    const analyzeButton = document.querySelector('[data-function="image-description"]');
                    if (analyzeButton) {
                        analyzeButton.disabled = false;
                    }
                };
                
                reader.readAsDataURL(file);
            }
        });
    }
    
    // 圖像描述功能
    const imageDescriptionButtons = document.querySelectorAll('[data-function="image-description"]');
    imageDescriptionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.playground-card');
            const resultElement = card.querySelector('.playground-result');
            
            showLoading(resultElement);
            
            // 模擬AI處理
            setTimeout(() => {
                // 預設的圖片描述示例
                const descriptions = [
                    "這張圖片展示了一個城市景觀，具有現代化的高樓大廈和繁忙的街道。在前景中可以看到一些行人，背景則是藍天和幾朵白雲。整體氛圍顯得生機勃勃且充滿都市活力。",
                    "這是一張自然風景照，展現了壯麗的山脈和茂密的森林。前景有一條蜿蜒的小溪，水面反射著周圍的綠色植被。遠處的山峰覆蓋著白雪，與藍天形成鮮明對比。",
                    "圖片中是一盤精美的食物，看起來像是一道亞洲風格的料理。盤中有各種新鮮的蔬菜、肉類和一些調味料。食物的擺盤非常講究，色彩豐富且充滿誘人的質感。",
                    "這張圖片顯示的是一個科技產品，可能是最新款的智能手機或平板設備。該設備具有時尚的設計、光滑的表面和大型顯示屏。背景是簡潔的，突出了產品本身的細節和特點。"
                ];
                
                // 隨機選擇一個描述
                const randomIndex = Math.floor(Math.random() * descriptions.length);
                showResult(resultElement, descriptions[randomIndex]);
            }, getRandomDelay());
        });
    });
    
    // 情感分析功能
    const sentimentAnalysisButtons = document.querySelectorAll('[data-function="sentiment-analysis"]');
    sentimentAnalysisButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.playground-card');
            const input = card.querySelector('.playground-input').value.trim();
            const resultElement = card.querySelector('.playground-result');
            
            if (!input) {
                alert('請輸入文字以進行情感分析！');
                return;
            }
            
            showLoading(resultElement);
            
            // 模擬AI處理
            setTimeout(() => {
                // 簡單的情感分析邏輯
                const positiveWords = ['喜歡', '開心', '高興', '優秀', '美好', '讚', '棒', '好', '愛', '感謝'];
                const negativeWords = ['討厭', '傷心', '難過', '糟糕', '失望', '差', '壞', '恨', '憤怒', '不滿'];
                
                let positiveScore = 0;
                let negativeScore = 0;
                
                // 計算正面和負面詞語出現的次數
                positiveWords.forEach(word => {
                    if (input.includes(word)) {
                        positiveScore += 1;
                    }
                });
                
                negativeWords.forEach(word => {
                    if (input.includes(word)) {
                        negativeScore += 1;
                    }
                });
                
                // 根據分數判斷情感傾向
                let sentiment = '';
                let explanation = '';
                
                if (positiveScore > negativeScore) {
                    sentiment = '正面情感 😊';
                    explanation = `分析結果顯示，您的文本整體呈現正面情感傾向。識別到 ${positiveScore} 個正面情感詞彙，相比之下只有 ${negativeScore} 個負面情感詞彙。文本表達的態度積極樂觀，給人以正能量。`;
                } else if (negativeScore > positiveScore) {
                    sentiment = '負面情感 😔';
                    explanation = `分析結果顯示，您的文本整體呈現負面情感傾向。識別到 ${negativeScore} 個負面情感詞彙，相比之下只有 ${positiveScore} 個正面情感詞彙。文本表達的態度較為消極，可能反映了某種擔憂或不滿。`;
                } else if (positiveScore === 0 && negativeScore === 0) {
                    sentiment = '中性情感 😐';
                    explanation = '分析結果顯示，您的文本情感傾向中性。未識別到明顯的情感詞彙，內容可能偏向客觀陳述或事實描述，沒有表達明確的情感傾向。';
                } else {
                    sentiment = '混合情感 🤔';
                    explanation = `分析結果顯示，您的文本同時包含正面和負面情感。識別到 ${positiveScore} 個正面情感詞彙和 ${negativeScore} 個負面情感詞彙，表明內容中存在情感的複雜性和多樣性。`;
                }
                
                showResult(resultElement, `${sentiment}\n\n${explanation}`);
            }, getRandomDelay());
        });
    });
    
    // 聊天機器人功能
    const chatSendButtons = document.querySelectorAll('[data-function="chatbot"]');
    chatSendButtons.forEach(button => {
        button.addEventListener('click', function() {
            sendChatMessage(this);
        });
    });
    
    // 聊天輸入框回車鍵發送
    const chatInputs = document.querySelectorAll('.chat-input');
    chatInputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const sendButton = this.nextElementSibling;
                sendChatMessage(sendButton);
            }
        });
    });
    
    function sendChatMessage(sendButton) {
        const chatContainer = sendButton.closest('.chat-container');
        const messageInput = chatContainer.querySelector('.chat-input');
        const messagesContainer = chatContainer.querySelector('.chat-messages');
        
        const message = messageInput.value.trim();
        if (!message) return;
        
        // 添加用戶消息
        addMessage(messagesContainer, message, 'user');
        messageInput.value = '';
        
        // 滾動到底部
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // 模擬AI處理
        setTimeout(() => {
            // 預設的回應列表
            const responses = [
                "我理解您的問題。根據我的分析，這涉及到多個方面的考量。您可以從以下幾個角度思考這個問題...",
                "謝謝您的提問！這是一個有趣的話題。基於最新研究，我可以告訴您...",
                "您提到的情況很常見。許多人都有類似的疑問，我建議您可以嘗試...",
                "這個問題確實值得深入討論。從技術角度來看，主要有以下幾個關鍵點需要注意...",
                "我需要更多信息來全面回答您的問題。例如，您能否提供更多背景或具體細節？",
                "您的問題很有見地！實際上，這個領域最近有很多新的發展，包括..."
            ];
            
            // 根據用戶輸入選擇響應
            let response = '';
            
            if (message.includes('你好') || message.includes('嗨') || message.includes('hi') || message.includes('hello')) {
                response = "你好！很高興與您交流。我是您的AI助手，有什麼我可以幫助您的嗎？";
            } else if (message.includes('謝謝') || message.includes('感謝') || message.includes('thank')) {
                response = "不客氣！能夠幫助到您是我的榮幸。如果還有其他問題，隨時可以向我提問。";
            } else if (message.includes('再見') || message.includes('拜拜') || message.includes('bye')) {
                response = "再見！祝您有愉快的一天。期待下次再與您交流！";
            } else if (message.includes('?') || message.includes('？') || message.includes('什麼') || message.includes('如何') || message.includes('為什麼')) {
                // 針對問題的響應
                const questionResponses = [
                    "這是一個很好的問題。根據我的理解，",
                    "關於這個問題，有幾種不同的觀點：",
                    "讓我為您解答這個問題。基於目前的資訊，",
                    "這個問題很有深度。簡單來說，"
                ];
                const randomIndex = Math.floor(Math.random() * questionResponses.length);
                response = questionResponses[randomIndex] + responses[Math.floor(Math.random() * responses.length)].toLowerCase();
            } else {
                // 隨機響應
                const randomIndex = Math.floor(Math.random() * responses.length);
                response = responses[randomIndex];
            }
            
            // 添加機器人回應
            addMessage(messagesContainer, response, 'bot');
            
            // 滾動到底部
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, getRandomDelay());
    }
    
    function addMessage(container, message, type) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', type);
        
        const contentElement = document.createElement('div');
        contentElement.classList.add('message-content');
        contentElement.textContent = message;
        
        messageElement.appendChild(contentElement);
        container.appendChild(messageElement);
    }
} 