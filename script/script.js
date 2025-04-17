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
        
        // 重新初始化滾動檢測
        initScrollDetection();
    });
    
    // 加載技能數據並生成技能列表
    loadSkills();
    
    // 加載聯絡資訊
    loadContactInfo();
    
    // 加載學習資源
    loadResources();
    
    // 初始化側邊欄
    initSidebar();
    
    // 初始化主題切換器
    initThemeSwitcher();
    
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

// 從JSON文件加載學習資源數據
function loadResources() {
    const resourcesContainer = document.querySelector('.resources-grid');
    
    if (!resourcesContainer) {
        console.error('找不到學習資源容器元素');
        return;
    }
    
    // 使用fetch API加載resources.json文件
    fetch('json/resources.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('無法加載學習資源數據：' + response.status);
            }
            return response.json();
        })
        .then(resources => {
            // 清空容器
            resourcesContainer.innerHTML = '';
            
            // 為每個資源類別創建元素
            resources.forEach(category => {
                const resourceItem = document.createElement('div');
                resourceItem.className = 'resource-item fade-in-element';
                
                const title = document.createElement('h3');
                title.className = 'resource-title';
                title.textContent = category.category;
                
                const list = document.createElement('ul');
                
                // 為每個資源項目創建元素
                category.items.forEach(item => {
                    const listItem = document.createElement('li');
                    const link = document.createElement('a');
                    link.href = 'javascript:void(0)';  // 修改為JavaScript空鏈接
                    link.style.color = 'var(--primary-color)';
                    
                    // 添加自定義數據屬性，用於保存資源數據
                    link.dataset.resource = JSON.stringify(item);
                    
                    // 添加圖標 (使用燈泡圖標作為默認，代表知識和學習資源)
                    const icon = document.createElement('i');
                    icon.className = 'fas fa-lightbulb';
                    icon.style.marginRight = '8px';
                    link.appendChild(icon);
                    
                    // 添加文字
                    const text = document.createTextNode(item.title);
                    link.appendChild(text);
                    
                    // 添加點擊事件處理器
                    link.addEventListener('click', function(e) {
                        e.preventDefault();
                        const resourceData = JSON.parse(this.dataset.resource);
                        showResourceSidebar(resourceData);
                    });
                    
                    listItem.appendChild(link);
                    list.appendChild(listItem);
                });
                
                resourceItem.appendChild(title);
                resourceItem.appendChild(list);
                resourcesContainer.appendChild(resourceItem);
            });
            
            // 初始化資源詳情側邊欄
            initResourceSidebar();
            
            // 重新初始化滾動檢測
            initScrollDetection();
        })
        .catch(error => {
            console.error('加載學習資源數據時出錯：', error);
            resourcesContainer.innerHTML = '<p style="color: red;">無法加載學習資源數據，請稍後再試。</p>';
        });
}

// 初始化資源詳情側邊欄
function initResourceSidebar() {
    const closeSidebarBtn = document.getElementById('closeSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', function() {
            hideResourceSidebar();
        });
    }
    
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', function() {
            hideResourceSidebar();
        });
    }
    
    // 添加ESC鍵關閉側邊欄功能
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideResourceSidebar();
        }
    });
}

// 顯示資源詳情側邊欄
function showResourceSidebar(resourceData) {
    const sidebar = document.getElementById('resourceSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const title = document.getElementById('resourceTitle');
    const icon = document.getElementById('resourceIcon');
    const description = document.getElementById('resourceDescription');
    const linkContainer = document.getElementById('resourceLink');
    const subItemsContainer = document.getElementById('subItemsContainer');
    const subItemsList = document.getElementById('subItemsList');
    
    if (!sidebar || !title || !description || !icon || !linkContainer || !subItemsContainer || !subItemsList) {
        console.error('找不到資源詳情側邊欄元素');
        return;
    }
    
    // 設置資源標題
    title.textContent = resourceData.title;
    
    // 設置資源圖標 (使用燈泡圖標作為默認，代表知識和學習資源)
    icon.innerHTML = '';
    const iconElement = document.createElement('i');
    iconElement.className = 'fas fa-lightbulb';
    icon.appendChild(iconElement);
    
    // 設置資源描述
    description.textContent = resourceData.description || '沒有提供描述';
    
    // 清空原有的鏈接
    linkContainer.innerHTML = '';
    
    // 如果有links對象，創建各種社交媒體鏈接
    if (resourceData.links) {
        // 創建社交媒體鏈接容器
        const socialLinksContainer = document.createElement('div');
        socialLinksContainer.className = 'social-links-container';
        
        // 定義支持的社交媒體類型及其圖標
        const socialMediaTypes = [
            { type: 'youtube', icon: 'fab fa-youtube', label: 'YouTube' },
            { type: 'github', icon: 'fab fa-github', label: 'GitHub' },
            { type: 'blog', icon: 'fas fa-blog', label: '部落格' },
            { type: 'facebook', icon: 'fab fa-facebook', label: 'Facebook' },
            { type: 'twitter', icon: 'fab fa-twitter', label: 'Twitter' },
            { type: 'instagram', icon: 'fab fa-instagram', label: 'Instagram' },
            { type: 'linkedin', icon: 'fab fa-linkedin', label: 'LinkedIn' }
        ];
        
        // 遍歷創建各種社交媒體鏈接
        socialMediaTypes.forEach(social => {
            const url = resourceData.links[social.type];
            if (url && url.trim() !== '') {
                const linkElement = document.createElement('a');
                linkElement.href = url;
                linkElement.target = '_blank';
                linkElement.className = 'resource-social-link';
                linkElement.title = `訪問 ${social.label}`;
                
                const socialIcon = document.createElement('i');
                socialIcon.className = social.icon;
                
                linkElement.appendChild(socialIcon);
                socialLinksContainer.appendChild(linkElement);
            }
        });
        
        // 只有在有社交媒體鏈接時才添加容器
        if (socialLinksContainer.children.length > 0) {
            linkContainer.appendChild(socialLinksContainer);
        } else {
            // 如果沒有任何有效的社交媒體鏈接，顯示提示
            const noLinksMessage = document.createElement('p');
            noLinksMessage.textContent = '沒有提供社交媒體鏈接';
            noLinksMessage.style.fontStyle = 'italic';
            noLinksMessage.style.opacity = '0.7';
            linkContainer.appendChild(noLinksMessage);
        }
    }
    
    // 設置子項目
    if (resourceData.subItems && resourceData.subItems.length > 0) {
        subItemsContainer.style.display = 'block';
        subItemsList.innerHTML = '';
        
        resourceData.subItems.forEach(subItem => {
            const subItemCard = document.createElement('div');
            subItemCard.className = 'subitem-card';
            
            // 如果有URL，添加點擊事件和可點擊的樣式
            if (subItem.url && subItem.url !== '#') {
                subItemCard.classList.add('clickable');
                subItemCard.addEventListener('click', function() {
                    window.open(subItem.url, '_blank');
                });
            }
            
            const subItemTitle = document.createElement('h4');
            subItemTitle.className = 'subitem-title';
            
            // 如果有URL，添加一個小圖標表示可點擊
            if (subItem.url && subItem.url !== '#') {
                // 創建圖標元素
                const linkIcon = document.createElement('i');
                
                // 使用子項目自己的圖標，如果有的話
                if (subItem.icon) {
                    linkIcon.className = subItem.icon;
                } else {
                    // 默認使用外部鏈接圖標
                    linkIcon.className = 'fas fa-external-link-alt';
                }
                
                linkIcon.style.fontSize = '0.8rem';
                linkIcon.style.marginLeft = '8px';
                linkIcon.style.opacity = '0.7';
                
                subItemTitle.textContent = subItem.title;
                subItemTitle.appendChild(linkIcon);
            } else {
                subItemTitle.textContent = subItem.title;
            }
            
            const subItemDesc = document.createElement('p');
            subItemDesc.className = 'subitem-description';
            subItemDesc.textContent = subItem.description || '';
            
            subItemCard.appendChild(subItemTitle);
            subItemCard.appendChild(subItemDesc);
            subItemsList.appendChild(subItemCard);
        });
    } else {
        subItemsContainer.style.display = 'none';
    }
    
    // 顯示側邊欄和遮罩層
    sidebar.classList.add('active');
    if (overlay) {
        overlay.classList.add('active');
    }
    
    // 禁止背景滾動
    document.body.style.overflow = 'hidden';
}

// 隱藏資源詳情側邊欄
function hideResourceSidebar() {
    const sidebar = document.getElementById('resourceSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar) {
        sidebar.classList.remove('active');
    }
    
    if (overlay) {
        overlay.classList.remove('active');
    }
    
    // 恢復背景滾動
    document.body.style.overflow = '';
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
