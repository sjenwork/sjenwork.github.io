/**
 * scroll-detection.js
 * 滾動檢測功能模塊
 * 
 * 此模塊負責處理頁面元素的滾動顯示效果，在元素進入視口時添加動畫。
 * 主要功能包括：
 * 1. 找到所有帶有 'fade-in-element' 類的元素
 * 2. 在頁面滾動時檢查這些元素是否進入視口
 * 3. 當元素進入視口時，添加 'visible' 類來觸發淡入動畫
 */

// 初始化滾動檢測
function initScrollDetection() {
    // 獲取所有帶有淡入效果類的元素
    const fadeElements = document.querySelectorAll('.fade-in-element');
    
    // 檢查元素是否在視口中可見
    function checkVisibility() {
        fadeElements.forEach(element => {
            // 獲取元素相對於視口的位置
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            
            // 判斷元素是否進入視口（偏移100px，提前觸發動畫）
            const isVisible = (elementTop < window.innerHeight - 100) && (elementBottom > 0);
            
            // 如果元素可見，添加visible類以觸發動畫
            if (isVisible) {
                element.classList.add('visible');
            }
        });
    }
    
    // 頁面加載時立即進行初始檢查
    checkVisibility();
    
    // 監聽滾動事件，在用戶滾動頁面時檢查元素可見性
    window.addEventListener('scroll', checkVisibility);
}

// 頁面DOM加載完成後執行
document.addEventListener('DOMContentLoaded', function() {
    // 為頁面中的卡片和技能項添加淡入效果類
    const elements = document.querySelectorAll('.slide-card, .project-card, .blog-card, .skill-item, .resource-item');
    elements.forEach(element => {
        element.classList.add('fade-in-element');
    });
    
    // 初始化滾動檢測功能
    initScrollDetection();
    
    // 向外暴露initScrollDetection函數，使其可以在其他地方被調用
    // 例如在頁面切換或動態加載內容後重新初始化
    window.initScrollDetection = initScrollDetection;
});

// 當窗口大小改變時，重新檢查元素可見性
window.addEventListener('resize', function() {
    // 重新初始化滾動檢測（適用於響應式佈局）
    initScrollDetection();
});