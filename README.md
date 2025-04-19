# 個人網站專案

這是一個使用HTML、CSS和JavaScript構建的個人網站專案，集成了Firebase實時數據庫，提供部落格、作品集和互動式設計。

## 目錄結構

```
/
├── config/                  # 配置文件
│   └── firebase-config.js   # Firebase配置
├── firebase-migration/      # Firebase數據遷移工具
├── script/                  # JavaScript腳本
│   ├── analytics/           # 網站分析與用戶行為追踪
│   ├── core/                # 核心應用功能
│   ├── data-loaders/        # 數據加載模塊
│   ├── firebase/            # Firebase相關功能
│   ├── interaction/         # 用戶互動處理
│   ├── pages/               # 頁面特定功能
│   ├── sidebar/             # 側邊欄功能
│   └── ui/                  # 用戶界面元素
├── style/                   # CSS樣式表
├── blogs/                   # 部落格Markdown文件
├── images/                  # 圖片資源
├── projects/                # 項目展示內容
├── slides/                  # 簡報展示內容
└── json/                    # 本地資料，如個人檔案、部落格文章清單（可被Firebase取代）
```

### 主要腳本資料夾說明

- **analytics/**：Google Analytics和用戶行為分析模塊，追踪網站使用情況
- **core/**：包含核心應用邏輯，管理頁面導航和基本功能
- **firebase/**：Firebase連接和數據操作相關功能
- **interaction/**：處理鍵盤快捷鍵、移動設備手勢等用戶互動
- **pages/**：特定頁面功能，如部落格閱讀器、AI實驗室等
- **sidebar/**：側邊欄導航和資源詳情側邊欄功能
- **ui/**：通用UI元素，如主題切換、滾動效果等

## 網站功能

1. **響應式設計**：適配桌面和移動設備的界面
2. **部落格系統**：基於Firebase的部落格內容管理和展示
3. **主題切換**：支持多種配色主題，用戶可自由切換
4. **互動式側邊欄**：提供便捷的網站導航
5. **專案展示**：展示個人開發項目和作品
6. **簡報集合**：展示和分享演講簡報
7. **訪問統計**：使用Firebase追踪網站訪問量
8. **AI實驗室**：提供AI相關功能的互動式演示
9. **資源分享**：整合推薦的學習資源和工具
10. **鍵盤快捷鍵**：提供鍵盤導航支持
11. **移動手勢**：支持在移動設備上的滑動導航

## 部落格系統

### 切換部落格來源方法

本網站支持兩種部落格數據來源方式：

1. **本地JSON加載（原始方式）**
   - 使用`script/data-loaders/data-loaded.js`從本地JSON文件加載
   - 部落格文章存儲在`blogs/`目錄下的Markdown文件中

2. **Firebase數據庫（當前方式）**
   - 使用`script/firebase/blog-loader-firebase.js`從Firebase實時數據庫加載
   - 文章元數據存儲在Firebase中，內容仍存儲為Markdown文件

若要切換回本地JSON加載方式，請在`index.html`中做以下修改：

```html
<!-- 從 -->
<script src="script/firebase/blog-loader-firebase.js"></script>

<!-- 改為 -->
<script src="script/data-loaders/blog-loader.js"></script>
```

### 從本地JSON導入數據到Firebase

若要將本地部落格數據導入Firebase，請按以下步驟操作：

1. **設置Firebase**
   - 創建Firebase項目
   - 下載服務帳號密鑰(`serviceAccountKey.json`)並放在`firebase-migration/`目錄下

2. **安裝依賴**
   ```
   npm install firebase-admin
   ```

3. **執行導入腳本**
   ```
   node firebase-migration/blog-firebase-import.js
   ```

4. **切換到Firebase加載器**
   - 確保index.html中引用的是`script/firebase/blog-loader-firebase.js`

### 使用GitHub存儲部落格文章

如果想使用不同的GitHub倉庫來存儲部落格文章內容，只需在Firebase中更新文章的`file_path`字段，指向新的GitHub倉庫中的Markdown文件URL即可。例如：

```
https://raw.githubusercontent.com/yourusername/blog-content/main/articles/my-article.md
```

這樣可以將部落格內容與網站代碼分離，方便獨立管理。

## 開發與部署

### 本地開發
```
npx http-server
```

### 部署
網站可部署在任何靜態網站託管服務上，如GitHub Pages、Netlify或Firebase Hosting。 