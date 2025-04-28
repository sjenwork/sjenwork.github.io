// 從Firebase載入部落格文章
document.addEventListener('DOMContentLoaded', function() {
    // 確保DOM已完全載入
    loadBlogPosts();
});

function loadBlogPosts() {
    // 確保Firebase已正確初始化
    if (!initializeFirebase()) {
        console.error("Firebase未初始化，無法載入部落格內容");
        displayError("無法載入部落格內容");
        return;
    }

    // 從Firebase獲取部落格文章數據
    const database = firebase.database();
    const blogRef = database.ref('blog-posts');
    
    blogRef.once('value')
        .then(snapshot => {
            if (!snapshot.exists()) {
                throw new Error('無法載入部落格文章數據');
            }
            console.log(snapshot.val());
            displayBlogPosts(snapshot.val());
        })
        .catch(error => {
            console.error('載入部落格文章時發生錯誤:', error);
            document.querySelector('.blog-grid').innerHTML = `
                <div class="error-message">
                    <p><i class="fa fa-exclamation-circle"></i> 載入部落格文章時發生錯誤</p>
                    <p>請稍後再試或聯繫網站管理員</p>
                </div>
            `;
        });
}

// 檢查Firebase初始化
function initializeFirebase() {
    if (typeof window.firebaseHelper !== 'undefined') {
        // 使用共享的初始化函數
        const result = window.firebaseHelper.initialize();
        return result;
    } else {
        // 嘗試檢查Firebase是否已經在其他地方初始化
        if (typeof firebase !== 'undefined') {
            try {
                if (firebase.apps.length > 0) {
                    return true;
                } else {
                    console.error("Firebase未初始化，且找不到初始化模組");
                    return false;
                }
            } catch (error) {
                console.error("Firebase初始化檢查失敗:", error);
                return false;
            }
        } else {
            console.error("Firebase SDK未載入");
            return false;
        }
    }
}

// 顯示錯誤訊息
function displayError(message) {
    document.querySelector('.blog-grid').innerHTML = `
        <div class="error-message">
            <p><i class="fa fa-exclamation-circle"></i> ${message}</p>
            <p>請稍後再試或聯繫網站管理員</p>
        </div>
    `;
}

function displayBlogPosts(blogData) {
    const blogGrid = document.querySelector('.blog-grid');
    let blogPostsHTML = '';
    
    // 遍歷所有分類
    blogData.forEach(category => {
        // 只取每個類別中的最新10篇文章顯示在首頁
        const latestPosts = category.items.slice(0, 10);
        
        latestPosts.forEach(post => {
            blogPostsHTML += `
                <div class="blog-card">
                    <div class="card-preview">
                        <img src="${post.cover_image}" alt="${post.title}">
                        <div class="card-overlay"></div>
                    </div>
                    <div class="card-content">
                        <h2 class="card-title">${post.title}</h2>
                        <p class="card-description">${post.description}</p>
                        <p><small>發布日期：${post.date}</small></p>
                        <a href="${post.file_path}" class="card-link">閱讀文章</a>
                    </div>
                </div>
            `;
        });
    });
    
    // 如果沒有文章
    if (blogPostsHTML === '') {
        blogPostsHTML = `
            <div class="empty-message">
                <p><i class="fa fa-info-circle"></i> 目前還沒有部落格文章</p>
                <p>請稍後再來查看</p>
            </div>
        `;
    }
    
    // 更新DOM
    blogGrid.innerHTML = blogPostsHTML;
    
    // 為卡片添加點擊事件（打開部落格文章）
    document.querySelectorAll('.blog-card .card-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const postPath = this.getAttribute('href');
            
            // 使用fetch獲取Markdown內容
            fetch(postPath)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('無法載入文章內容');
                    }
                    return response.text();
                })
                .then(markdown => {
                    // 這裡需要一個Markdown解析器，但暫時先將內容顯示在新頁面中
                    localStorage.setItem('blog-content', markdown);
                    localStorage.setItem('blog-path', postPath);
                    
                    // 在實際應用中，可能需要導航到專門的部落格閱讀頁面
                    window.open('blog-reader.html', '_blank');
                })
                .catch(error => {
                    console.error('載入文章內容時發生錯誤:', error);
                    alert('無法載入文章內容，請稍後再試');
                });
        });
    });
} 