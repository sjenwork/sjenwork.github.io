# Firebase 部落格管理系統使用指南

## 簡介

這是一個基於 Firebase Realtime Database 的部落格管理系統，它讓您可以輕鬆管理部落格文章，無需複雜的後端處理。此系統包含以下組件：

1. 資料儲存：使用 Firebase Realtime Database 儲存部落格文章資料
2. 前端顯示：修改的 blog-loader-firebase.js 從 Firebase 載入部落格資料
3. 管理介面：blog-admin.html 提供完整的部落格管理功能

## 安裝步驟

### 1. 設定 Firebase

先建立一個 Firebase 專案。

### 2. 匯入現有部落格資料

使用 `firebase-migration/blog-firebase-import.js` 腳本將現有 blog.json 資料匯入到 Firebase：

1. 從 Firebase 控制台下載服務帳號金鑰檔案（serviceAccountKey.json）並放入 firebase-migration 資料夾
2. 安裝相依套件：`npm install firebase-admin`
3. 開啟 blog-firebase-import.js 並取消註釋相關程式碼
4. 執行腳本：`node firebase-migration/blog-firebase-import.js`

### 3. 更新網站程式碼

要啟用 Firebase 部落格載入，請更新 index.html 檔案，替換原始的 blog-loader.js 引用為 blog-loader-firebase.js：

```html
<!-- 將此行 -->
<script src="script/blog-loader.js"></script>

<!-- 替換為 -->
<script src="script/blog-loader-firebase.js"></script>
```

### 4. 設定管理員帳號

1. 在 Firebase 控制台中啟用電子郵件/密碼身份驗證
2. 建立一個管理員使用者
3. 使用這些憑證登入 blog-admin.html

## 使用管理介面

1. 訪問 blog-admin.html 並登入
2. 使用介面新增、編輯或刪除部落格文章和分類
3. 所有更改會立即儲存到 Firebase

## 系統優勢

- **無需後端**：完全使用 Firebase 託管資料，無需額外伺服器
- **即時更新**：資料更改即時生效
- **易於管理**：友善的使用者介面進行部落格管理
- **安全可靠**：使用 Firebase 身份驗證保護管理介面
- **擴展性**：可輕鬆新增更多功能，如評論、點讚等

## 部落格資料結構

Firebase 中的資料結構與原始 blog.json 相同：

```
blog-posts/
  - [0]
    - category: "心得"
    - items: [
        {
          title: "文章標題",
          date: "2024-01-01",
          description: "文章描述",
          tags: ["標籤1", "標籤2"],
          file_path: "blogs/Insights/article.md",
          cover_image: "blogs/images/cover.png"
        },
        ...
      ]
  - [1]
    - category: "人工智慧"
    - items: [...]
  ...
```

## 後續開發：

1. **新增 Markdown 編輯器**：整合線上 Markdown 編輯器，直接編輯文章內容
2. **圖片上傳功能**：使用 Firebase Storage 新增圖片上傳功能
3. **文章預覽**：新增即時預覽功能