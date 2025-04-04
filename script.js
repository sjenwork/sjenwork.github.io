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
                icon.className = `fas ${contact.icon}`;
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