/**
 * popup.js - 機器學習彈出窗口的交互邏輯
 */

document.addEventListener('DOMContentLoaded', function() {
    // 獲取彈出窗口元素
    const mlPopup = document.querySelector('.ml-popup');
    const popupTrigger = document.querySelector('.popup-trigger');
    const popupClose = document.querySelector('.popup-close');
    const listItemContent = document.querySelector('.list-item-content');
    
    // 點擊觸發器打開彈出窗口
    if (popupTrigger) {
        popupTrigger.addEventListener('click', function(e) {
            e.stopPropagation();
            mlPopup.classList.add('active');
        });
    }
    
    // 點擊列表項目內容也可以打開彈出窗口
    if (listItemContent) {
        listItemContent.addEventListener('click', function() {
            mlPopup.classList.add('active');
        });
    }
    
    // 點擊關閉按鈕關閉彈出窗口
    if (popupClose) {
        popupClose.addEventListener('click', function() {
            mlPopup.classList.remove('active');
        });
    }
    
    // 點擊彈出窗口外部關閉彈出窗口
    if (mlPopup) {
        mlPopup.addEventListener('click', function(e) {
            if (e.target === mlPopup) {
                mlPopup.classList.remove('active');
            }
        });
    }
    
    // 按ESC鍵關閉彈出窗口
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mlPopup.classList.contains('active')) {
            mlPopup.classList.remove('active');
        }
    });
}); 