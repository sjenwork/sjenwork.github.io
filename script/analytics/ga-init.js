/**
 * Google Analytics 初始化
 * 用於載入GA4並設置基本配置
 */

// 創建全局gtag函數
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;  // 確保gtag函數在全局範圍可用

// 動態載入Google Analytics腳本
(function() {
    // 創建script元素
    var gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-D5BW7CYDM0';
    
    // 將script添加到頭部
    var firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(gaScript, firstScript);
    
    // 初始化GA4
    gtag('js', new Date());
    gtag('config', 'G-D5BW7CYDM0');
    
    // 輸出日誌
})(); 