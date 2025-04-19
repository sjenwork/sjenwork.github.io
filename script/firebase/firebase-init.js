/**
 * Firebase初始化
 * 集中管理Firebase配置和初始化
 * 在各種需要Firebase的腳本之前載入此檔案
 */

// 使用共享的Firebase配置
// 注意：確保在HTML中先引入config/firebase-config.js

/**
 * 初始化Firebase應用
 * 如果Firebase尚未初始化，則進行初始化
 * 每個依賴Firebase的腳本都可以調用此函數確保Firebase已初始化
 * @returns {boolean} 初始化成功返回true，失敗返回false
 */
function initializeFirebase() {
    if (typeof firebase !== 'undefined') {
        // 檢查Firebase是否已經初始化
        try {
            if (!firebase.apps.length) {
                firebase.initializeApp(window.firebaseConfig);
                console.log("Firebase已由firebase-init.js初始化");
            } else {
                console.log("Firebase已經被初始化過");
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

// 立即初始化Firebase
initializeFirebase();

// 導出函數以便在其他腳本中使用
if (typeof window !== 'undefined') {
    window.firebaseHelper = {
        initialize: initializeFirebase,
        getConfig: function() { return window.firebaseConfig; }
    };
} 