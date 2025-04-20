/**
 * Google Analytics 4 整合
 * 用於追蹤網站訪問和用戶行為
 */

// GA4初始化
function initGA4() {
    // 檢查是否已經載入GA4
    if (typeof gtag !== 'function') {
        console.warn('GA4未正確載入，請確保在HTML中添加GA4代碼');
        return false;
    }
    
    // 註冊自定義事件類別
    registerCustomEvents();
    
    // 追蹤網站區域切換
    trackSectionViews();
    
    // 追蹤外部連結點擊
    trackExternalLinks();
    
    return true;
}

// 註冊自定義事件類別
function registerCustomEvents() {
    // 與訪問計數器整合
    document.addEventListener('visitorCountUpdated', function(e) {
        if (typeof gtag === 'function' && e.detail && e.detail.count) {
            gtag('event', 'visitor_counter_updated', {
                'total_visitors': e.detail.count,
                'is_new_visit': e.detail.isNewVisit || false
            });
        }
    });
}

// 追蹤網站各區域的瀏覽
function trackSectionViews() {
    // 監聽側邊欄項目點擊以追蹤區域切換
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            if (sectionId && typeof gtag === 'function') {
                gtag('event', 'view_section', {
                    'section_id': sectionId,
                    'section_name': this.textContent.trim()
                });
            }
        });
    });
}

// 追蹤外部連結點擊
function trackExternalLinks() {
    document.querySelectorAll('a').forEach(link => {
        // 檢查是否為外部連結
        if (link.hostname && link.hostname !== window.location.hostname) {
            link.addEventListener('click', function(e) {
                if (typeof gtag === 'function') {
                    // 阻止預設行為以確保事件發送
                    e.preventDefault();
                    
                    const destination = this.href;
                    const linkText = this.textContent.trim();
                    
                    // 發送事件到GA4
                    gtag('event', 'click_external_link', {
                        'link_url': destination,
                        'link_text': linkText
                    });
                    
                    // 延遲導航以確保事件發送
                    setTimeout(function() {
                        window.open(destination, '_blank');
                    }, 200);
                }
            });
        }
    });
}

// 發送自定義事件到GA4
function sendAnalyticsEvent(eventName, eventParams) {
    if (typeof gtag === 'function') {
        gtag('event', eventName, eventParams);
        return true;
    }
    return false;
}

// 在DOM載入完成後初始化GA4整合
document.addEventListener('DOMContentLoaded', function() {
    initGA4();
});

// 導出公共函數
if (typeof window !== 'undefined') {
    window.analytics = {
        sendEvent: sendAnalyticsEvent
    };
} 