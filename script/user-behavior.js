/**
 * 用戶行為分析 - 深入追蹤用戶互動
 * 與GA4整合，收集更詳細的用戶行為數據
 */

// 初始化用戶行為追蹤
function initUserBehaviorTracking() {
    // 確保DOM已完全載入
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupBehaviorTracking);
    } else {
        setupBehaviorTracking();
    }
}

// 設置行為追蹤
function setupBehaviorTracking() {
    // 初始化會話ID
    const sessionId = generateSessionId();
    
    // 追蹤滾動深度
    trackScrollDepth();
    
    // 追蹤頁面停留時間
    trackTimeOnPage();
    
    // 追蹤用戶點擊
    trackUserClicks();
    
    // 追蹤表單互動
    trackFormInteractions();
    
}

// 生成會話ID
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 追蹤滾動深度
function trackScrollDepth() {
    let maxScrollDepth = 0;
    let checkpoints = [25, 50, 75, 90, 100];
    let reachedCheckpoints = [];
    
    // 計算文檔總高度
    function getDocHeight() {
        const body = document.body;
        const html = document.documentElement;
        
        return Math.max(
            body.scrollHeight, body.offsetHeight,
            html.clientHeight, html.scrollHeight, html.offsetHeight
        );
    }
    
    // 計算滾動百分比
    function calculateScrollPercentage() {
        const docHeight = getDocHeight();
        const windowHeight = window.innerHeight;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const trackLength = docHeight - windowHeight;
        return Math.floor((scrollTop / trackLength) * 100);
    }
    
    // 滾動事件處理
    window.addEventListener('scroll', function() {
        const scrollPercentage = calculateScrollPercentage();
        
        // 更新最大滾動深度
        if (scrollPercentage > maxScrollDepth) {
            maxScrollDepth = scrollPercentage;
            
            // 檢查是否達到新檢查點
            checkpoints.forEach(function(checkpoint) {
                if (maxScrollDepth >= checkpoint && !reachedCheckpoints.includes(checkpoint)) {
                    reachedCheckpoints.push(checkpoint);
                    
                    // 發送到GA4
                    if (typeof gtag === 'function') {
                        gtag('event', 'scroll_depth', {
                            'depth_percentage': checkpoint,
                            'page_title': document.title,
                            'page_location': window.location.href
                        });
                    }
                }
            });
        }
    }, { passive: true });
    
    // 在離開頁面時發送最終滾動深度
    window.addEventListener('beforeunload', function() {
        if (typeof gtag === 'function' && maxScrollDepth > 0) {
            gtag('event', 'final_scroll_depth', {
                'depth_percentage': maxScrollDepth,
                'page_title': document.title
            });
        }
    });
}

// 追蹤頁面停留時間
function trackTimeOnPage() {
    const startTime = Date.now();
    const timeCheckpoints = [10, 30, 60, 120, 300, 600]; // 秒數
    const reachedTimeCheckpoints = [];
    
    // 定時檢查頁面停留時間
    const timeInterval = setInterval(function() {
        const secondsOnPage = Math.floor((Date.now() - startTime) / 1000);
        
        // 檢查是否達到新時間檢查點
        timeCheckpoints.forEach(function(checkpoint) {
            if (secondsOnPage >= checkpoint && !reachedTimeCheckpoints.includes(checkpoint)) {
                reachedTimeCheckpoints.push(checkpoint);
                
                // 發送到GA4
                if (typeof gtag === 'function') {
                    gtag('event', 'time_on_page', {
                        'time_seconds': checkpoint,
                        'page_title': document.title
                    });
                }
            }
        });
    }, 1000);
    
    // 在頁面離開時清除定時器
    window.addEventListener('beforeunload', function() {
        clearInterval(timeInterval);
        
        // 發送總停留時間
        const totalSeconds = Math.floor((Date.now() - startTime) / 1000);
        if (typeof gtag === 'function') {
            gtag('event', 'total_time_on_page', {
                'time_seconds': totalSeconds,
                'page_title': document.title
            });
        }
    });
}

// 追蹤用戶點擊
function trackUserClicks() {
    document.addEventListener('click', function(e) {
        // 獲取點擊元素
        const element = e.target;
        
        // 獲取元素資訊
        const elementInfo = {
            'tag_name': element.tagName,
            'element_id': element.id || '(no id)',
            'element_class': element.className || '(no class)',
            'element_text': element.textContent?.trim().substring(0, 50) || '(no text)',
            'page_title': document.title
        };
        
        // 發送到GA4
        if (typeof gtag === 'function') {
            gtag('event', 'user_click', elementInfo);
        }
    }, { passive: true });
}

// 追蹤表單互動
function trackFormInteractions() {
    // 獲取所有表單
    const forms = document.querySelectorAll('form');
    
    forms.forEach(function(form) {
        // 追蹤表單填寫開始
        const formInputs = form.querySelectorAll('input, textarea, select');
        let formStarted = false;
        
        formInputs.forEach(function(input) {
            input.addEventListener('focus', function() {
                if (!formStarted) {
                    formStarted = true;
                    
                    // 發送表單開始填寫事件
                    if (typeof gtag === 'function') {
                        gtag('event', 'form_start', {
                            'form_id': form.id || form.getAttribute('name') || '(unnamed form)',
                            'page_title': document.title
                        });
                    }
                }
            });
        });
        
        // 追蹤表單提交
        form.addEventListener('submit', function(e) {
            // 發送表單提交事件
            if (typeof gtag === 'function') {
                gtag('event', 'form_submit', {
                    'form_id': form.id || form.getAttribute('name') || '(unnamed form)',
                    'page_title': document.title
                });
            }
        });
    });
}

// 自動初始化
initUserBehaviorTracking();

// 導出公共函數
if (typeof window !== 'undefined') {
    window.userBehavior = {
        init: initUserBehaviorTracking
    };
} 