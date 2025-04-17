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

document.addEventListener('DOMContentLoaded', function() {
    loadContactInfo();
    loadResources();
    loadSkills();
});