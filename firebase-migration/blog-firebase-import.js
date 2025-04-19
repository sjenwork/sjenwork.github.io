// 將blog.json匯入到Firebase Realtime Database的腳本
const fs = require('fs');
const path = require('path');

// 從共享配置文件導入Firebase配置
const firebaseConfig = require('../config/firebase-config');

// 將此腳本與firebase-admin一起使用
// 安裝命令: npm install firebase-admin

// 用法示例:
// 1. 安裝依賴: npm install firebase-admin
// 2. 運行腳本: node blog-firebase-import.js

//確保已經安裝firebase-admin:
//npm install firebase-admin
const admin = require('firebase-admin');

// 初始化Firebase Admin SDK
// 請先至Firebase控制台，專案總覽中，選擇專案設定，產生新的私密金鑰後下載存放到firebase-migration資料夾。
// 注意：serviceAccountKey.json 是 Firebase 的私密金鑰，請妥善保管，不要洩露給他人。
admin.initializeApp({
  credential: admin.credential.cert(require('./serviceAccountKey.json')),
  databaseURL: firebaseConfig.databaseURL
});

// 讀取blog.json檔案中的資料範例
const blogData = JSON.parse(fs.readFileSync(path.join(__dirname, '../json/blog.json'), 'utf8'));

// 獲取資料庫引用
const db = admin.database();
const blogRef = db.ref('blog-posts');

// 將數據寫入Firebase
blogRef.set(blogData)
  .then(() => {
    console.log('部落格數據成功匯入到Firebase!');
    process.exit(0);
  })
  .catch(error => {
    console.error('匯入失敗:', error);
    process.exit(1);
  });


// 注意: 您需要從Firebase控制台下載serviceAccountKey.json
console.log('請先下載serviceAccountKey.json並安裝相依套件，然後取消註釋相關程式碼。'); 