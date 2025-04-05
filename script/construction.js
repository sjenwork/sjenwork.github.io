// 關閉建置中通知
document.querySelector('.notice-close').addEventListener('click', function() {
    document.querySelector('.construction-notice').style.display = 'none';
});

// 添加未完成功能的通知
document.addEventListener('DOMContentLoaded', function() {
    // 設置通知顯示函數
    function showConstructionNotice(event) {
        event.preventDefault();
        const notice = document.querySelector('.construction-notice');
        notice.style.display = 'flex';
    }
    
    
    // 為其他"查看專案"和"閱讀文章"按鈕添加事件（除了已有URL的按鈕外）
    document.querySelectorAll('.card-link').forEach(link => {
        if (link.getAttribute('href') === '#') {
            link.addEventListener('click', showConstructionNotice);
        }
    });
}); 