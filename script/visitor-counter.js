/**
 * 網站訪問計數器 - 基於Firebase
 * 用於記錄網站的訪問人次
 */

// Firebase 配置
// 注意: 請將以下配置替換為您從Firebase控制台獲得的配置
const firebaseConfig = {
    apiKey: "AIzaSyB3gvcVEiFkm5jptM1qw5uZMsED0yLIXiA",
    authDomain: "sjenwork-github.firebaseapp.com",
    databaseURL: "https://sjenwork-github-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "sjenwork-github",
    storageBucket: "sjenwork-github.appspot.com",
    messagingSenderId: "1010951404944",
    appId: "1:1010951404944:web:0af04ded3f97237154c715",
    measurementId: "G-D5BW7CYDM0"
};

// 初始化Firebase應用
function initializeFirebase() {
    if (typeof firebase !== 'undefined') {
        // 檢查Firebase是否已經初始化
        try {
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
            return true;
        } catch (error) {
            console.error("Firebase初始化失敗:", error);
            return false;
        }
    } else {
        console.error("Firebase SDK未載入，請確保在HTML中引入Firebase SDK");
        return false;
    }
}

// 初始化訪問計數器
function initVisitorCounter() {
    // 確保DOM已完全載入
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupVisitorCounter);
    } else {
        setupVisitorCounter();
    }
}

// 設置訪問計數器
function setupVisitorCounter() {
    // 檢查Firebase是否已正確初始化
    if (!initializeFirebase()) {
        displayError("Firebase初始化失敗");
        return;
    }

    // 獲取資料庫引用
    const database = firebase.database();
    const visitsRef = database.ref('website-stats/visits');

    // 檢查用戶是否在當前會話中已被計數
    if (!sessionStorage.getItem('visit_counted')) {
        // 讀取當前計數
        visitsRef.once('value')
            .then((snapshot) => {
                const currentCount = snapshot.exists() ? snapshot.val() : 0;
                
                // 增加訪問計數
                return visitsRef.set(currentCount + 1);
            })
            .then(() => {
                // 標記此用戶在當前會話中已被計數
                sessionStorage.setItem('visit_counted', 'true');
                sessionStorage.setItem('visit_counted_recently_set', 'true');
                
                // 向GA4發送訪問事件（如果已加載）
                if (typeof gtag === 'function') {
                    gtag('event', 'new_visitor_counted', {
                        'method': 'firebase_counter'
                    });
                }
                
                // 添加會話開始時間
                sessionStorage.setItem('visit_start_time', new Date().toISOString());
            })
            .catch((error) => {
                console.error("訪問計數更新失敗:", error);
                displayError("無法更新訪問計數");
            });
    } else {
        // 移除最近設置標記
        sessionStorage.removeItem('visit_counted_recently_set');
    }

    // 監聽計數更新並顯示
    visitsRef.on('value', (snapshot) => {
        const count = snapshot.exists() ? snapshot.val() : 0;
        updateCounterDisplay(count);
    }, (error) => {
        console.error("讀取訪問計數失敗:", error);
        displayError("無法讀取訪問計數");
    });
    
    // 在頁面關閉/離開時記錄停留時間
    window.addEventListener('beforeunload', function() {
        const startTimeStr = sessionStorage.getItem('visit_start_time');
        if (startTimeStr && typeof gtag === 'function') {
            const startTime = new Date(startTimeStr);
            const endTime = new Date();
            const durationSeconds = Math.floor((endTime - startTime) / 1000);
            
            gtag('event', 'session_duration', {
                'duration_seconds': durationSeconds
            });
        }
    });
}

// 更新計數器顯示
function updateCounterDisplay(count) {
    // 查找所有訪問計數顯示元素
    const counterElements = document.querySelectorAll('.visitor-count');
    
    if (counterElements.length === 0) {
        console.warn("找不到訪問計數顯示元素，請在HTML中添加class為'visitor-count'的元素");
    }
    
    // 更新所有計數器顯示元素
    counterElements.forEach(element => {
        element.textContent = formatNumber(count);
    });
    
    // 觸發自定義事件，以便於GA4整合
    const isNewVisit = sessionStorage.getItem('visit_counted_recently_set') === 'true';
    const event = new CustomEvent('visitorCountUpdated', { 
        detail: { 
            count: count,
            isNewVisit: isNewVisit
        } 
    });
    document.dispatchEvent(event);
}

// 格式化數字（添加千位分隔符）
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// 顯示錯誤信息
function displayError(message) {
    const counterElements = document.querySelectorAll('.visitor-count');
    counterElements.forEach(element => {
        element.textContent = "--";
        element.title = message;
    });
}

// 獲取當前訪問計數（可供外部調用）
function getCurrentVisitorCount(callback) {
    if (!initializeFirebase()) {
        callback(0, new Error("Firebase初始化失敗"));
        return;
    }

    const database = firebase.database();
    const visitsRef = database.ref('website-stats/visits');
    
    visitsRef.once('value')
        .then((snapshot) => {
            const count = snapshot.exists() ? snapshot.val() : 0;
            callback(count, null);
        })
        .catch((error) => {
            console.error("獲取訪問計數失敗:", error);
            callback(0, error);
        });
}

// 自動初始化計數器
initVisitorCounter();

// 導出函數以便在其他腳本中使用
if (typeof window !== 'undefined') {
    window.visitorCounter = {
        initialize: initVisitorCounter,
        getCurrentCount: getCurrentVisitorCount
    };
} 