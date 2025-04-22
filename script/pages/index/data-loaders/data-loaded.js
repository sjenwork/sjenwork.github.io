// 從Markdown文件加載聯絡資訊
function loadContactInfo() {
    const aboutContentElement = document.querySelector('.about-content');
    
    if (!aboutContentElement) {
        console.error('找不到about-content元素');
        return;
    }
    
    // 配置marked選項
    marked.setOptions({
        highlight: function(code, lang) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
        },
        langPrefix: 'hljs language-',
        gfm: true,
        breaks: true
    });
    
    // 使用fetch API加載Markdown文件
    fetch('https://raw.githubusercontent.com/sjenwork/personal-website-data/refs/heads/main/about/introduction.md')
        .then(response => {
            if (!response.ok) {
                throw new Error('無法加載聯絡資訊：' + response.status);
            }
            return response.text(); // 讀取文本
        })
        .then(markdownText => {
            // 清空容器
            aboutContentElement.innerHTML = '';
            
            console.log(markdownText);
            // 使用marked解析Markdown
            aboutContentElement.innerHTML = marked.parse(markdownText);
            console.log(marked.parse(markdownText));
            // 為所有鏈接添加樣式和target屬性
            // const links = aboutContentElement.querySelectorAll('a');
            // links.forEach(link => {
            //     link.style.color = 'var(--primary-color)';
            //     link.style.textDecoration = 'none';
                
            //     // 如果是外部鏈接，添加target="_blank"
            //     if (link.href.includes('github.com') || 
            //         link.href.includes('http://') || 
            //         link.href.includes('https://')) {
            //         link.target = '_blank';
            //     }
            // });
            
            // 添加圖標到聯絡方式（假設格式為：[icon:class] 文本）
            const paragraphs = aboutContentElement.querySelectorAll('p');
            paragraphs.forEach(p => {
                const text = p.innerHTML;
                const iconMatch = text.match(/\[icon:(.*?)\](.*)/);
                if (iconMatch) {
                    const iconClass = iconMatch[1].trim();
                    const remainingText = iconMatch[2].trim();
                    
                    // 創建圖標
                    const icon = document.createElement('i');
                    icon.className = iconClass;
                    icon.style.color = 'var(--primary-color)';
                    icon.style.marginRight = '10px';
                    
                    // 清空原內容並添加新內容
                    p.innerHTML = '';
                    p.appendChild(icon);
                    p.insertAdjacentHTML('beforeend', remainingText);
                    
                    // 設置段落樣式
                    p.style.marginBottom = '5px';
                }
            });
            
            // 為標題增加行高和樣式
            const headings = aboutContentElement.querySelectorAll('h2, h3');
            headings.forEach(heading => {
                heading.style.lineHeight = '1.5';
                heading.style.margin = '1.5rem 0 1rem';
                heading.style.color = 'var(--primary-color)';
                
                // 為h2和h3設置不同的樣式
                if (heading.tagName === 'H2') {
                    heading.style.fontSize = '1.8rem';
                    heading.style.borderBottom = '1px solid var(--border-color)';
                    heading.style.paddingBottom = '0.5rem';
                } else if (heading.tagName === 'H3') {
                    heading.style.fontSize = '1.5rem';
                }
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
    fetch('https://raw.githubusercontent.com/sjenwork/personal-website-data/refs/heads/main/resources/resources.json')
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
    fetch('https://raw.githubusercontent.com/sjenwork/personal-website-data/refs/heads/main/skills/skills.json')
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