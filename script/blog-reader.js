// 確保highlight.js已初始化
document.addEventListener('DOMContentLoaded', function() {
    if (typeof hljs !== 'undefined') {
        hljs.configure({
            ignoreUnescapedHTML: true
        });
        hljs.highlightAll();
    }
    
    // 添加滾動事件監聽，處理標題固定效果
    handleStickyHeader();
});

// 處理固定標題
function handleStickyHeader() {
    const header = document.querySelector('.blog-reader-header');
    const headerTitle = header.querySelector('h1');
    if (!header) return;
    
    // 判斷是否為移動設備
    const isMobile = window.innerWidth <= 768;
    
    // 根據設備類型設定不同的初始值
    const initialPadding = isMobile ? 1.2 : 2; // rem
    const minPadding = isMobile ? 0.4 : 0.5; // rem
    const scrollRange = isMobile ? 150 : 200; // 滾動多少距離到達最小高度
    
    // 字體大小設定
    const initialFontSize = isMobile ? 1.5 : 2.2;
    const minFontSize = isMobile ? 1.2 : 1.4;
    
    // 設置窗口大小改變時的處理
    window.addEventListener('resize', function() {
        const newIsMobile = window.innerWidth <= 768;
        if (newIsMobile !== isMobile) {
            // 視窗大小跨越移動端與桌面端臨界點時強制刷新頁面
            window.location.reload();
        }
    });
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 0) {
            // 添加sticky類
            header.classList.add('sticky');
            
            // 計算縮放比例 (0到1之間)
            const scrollRatio = Math.min(scrollTop / scrollRange, 1);
            
            // 根據滾動比例計算padding (從初始值逐漸減小到最小值)
            const currentPadding = initialPadding - (scrollRatio * (initialPadding - minPadding));
            
            // 應用動態樣式
            if (isMobile) {
                header.style.padding = `${currentPadding}rem 1rem`;
            } else {
                header.style.padding = `${currentPadding}rem 1.5rem`;
            }
            
            // 同時縮放字體大小
            const currentFontSize = initialFontSize - (scrollRatio * (initialFontSize - minFontSize));
            headerTitle.style.fontSize = `${currentFontSize}rem`;
            
        } else {
            // 重置為初始狀態
            header.classList.remove('sticky');
            header.style.padding = '';
            headerTitle.style.fontSize = '';
        }
    });
}

// 主要文章載入邏輯
document.addEventListener('DOMContentLoaded', function() {
    // 從localStorage獲取文章內容
    const blogContent = localStorage.getItem('blog-content');
    const blogPath = localStorage.getItem('blog-path');
    
    if (!blogContent) {
        document.getElementById('blog-content').innerHTML = `
            <div class="error-message">
                <p><i class="fa fa-exclamation-circle"></i> 無法載入文章內容</p>
                <p>請從首頁重新選擇文章</p>
                <a href="index.html" class="return-button">返回首頁</a>
            </div>
        `;
        return;
    }
    
    // 解析Markdown內容
    const htmlContent = marked.parse(blogContent);
    document.getElementById('blog-content').innerHTML = htmlContent;
    
    // 提取標題和日期
    const titleMatch = blogContent.match(/^# (.*?)$/m);
    const dateMatch = blogContent.match(/\*發布日期：(.*?)\*/);
    const tagsMatch = blogContent.match(/\*標籤：(.*?)\*/);
    
    if (titleMatch && titleMatch[1]) {
        const title = titleMatch[1];
        document.getElementById('blog-title').textContent = title;
        document.title = `${title} | 部落格`;
    }
    
    if (dateMatch && dateMatch[1]) {
        document.getElementById('blog-date').textContent = dateMatch[1];
    }
    
    if (tagsMatch && tagsMatch[1]) {
        const tags = tagsMatch[1].split(',').map(tag => tag.trim());
        let tagsHTML = '';
        
        tags.forEach(tag => {
            tagsHTML += `<span class="blog-tag">${tag}</span>`;
        });
        
        document.getElementById('blog-tags').innerHTML = tagsHTML;
    }
    
    // 為程式碼區塊添加語法高亮
    if (typeof hljs !== 'undefined') {
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
    } else {
        console.warn('Highlight.js 未載入，代碼區塊將不會有語法高亮');
    }
    
    // 添加文章導航
    createTableOfContents();
});

/**
 * 創建文章目錄
 */
function createTableOfContents() {
    const content = document.getElementById('blog-content');
    const headings = content.querySelectorAll('h2, h3, h4');
    
    if (headings.length < 3) return; // 如果標題少於3個，不創建目錄
    
    const toc = document.createElement('div');
    toc.className = 'table-of-contents';
    toc.innerHTML = '<h3>文章目錄</h3><ul></ul>';
    
    const tocList = toc.querySelector('ul');
    
    headings.forEach((heading, index) => {
        const id = `heading-${index}`;
        heading.id = id;
        
        const listItem = document.createElement('li');
        listItem.className = `toc-${heading.tagName.toLowerCase()}`;
        
        const link = document.createElement('a');
        link.href = `#${id}`;
        link.textContent = heading.textContent;
        
        listItem.appendChild(link);
        tocList.appendChild(listItem);
    });
    
    // 將目錄插入到文章內容的開頭
    content.insertBefore(toc, content.firstChild);
} 