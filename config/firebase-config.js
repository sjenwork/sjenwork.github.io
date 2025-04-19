// 統一的Firebase配置，兼容Node.js和瀏覽器環境
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

// 根據運行環境導出配置
if (typeof module !== 'undefined' && module.exports) {
    // Node.js環境
    module.exports = firebaseConfig;
} else {
    // 瀏覽器環境
    window.firebaseConfig = firebaseConfig;
} 