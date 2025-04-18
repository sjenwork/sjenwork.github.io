// 初始化資源詳情側邊欄
function initResourceSidebar() {
    const resourceSidebarCloseBtn = document.getElementById('resourceSidebarClose');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    if (resourceSidebarCloseBtn) {
        resourceSidebarCloseBtn.addEventListener('click', function() {
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