# 網站功能與 API 架構草案 (Web Draft)

根據現有 HTML 檔案分析，以下列出 Rentaloop 專案可能需要的核心功能模組與後端 API 接口。

## 1. 核心功能模組 (Feature Modules)

### 1.1 使用者認證與管理 (Authentication & User Management)
*   **功能描述**: 處理使用者註冊、登入、登出及個人資料管理。
*   **關聯頁面**: Global Header (登入/開始租賃), `member/code.html`
*   **細項**:
    *   一般登入/註冊 (Email/Password)
    *   社群登入 (Google/Facebook - 潛在需求)
    *   個人資料編輯 (頭像、簡介、所在地)
    *   實名認證 (Identity Verification - 頁面顯示 "Identity Verified")

### 1.2 商品管理系統 (Item Management System)
*   **功能描述**: 物品的上架、瀏覽、搜尋、篩選與收藏。
*   **關聯頁面**: `index.html`, `products/code.html`, `upload/code.html`
*   **細項**:
    *   商品列表與網格顯示
    *   進階搜尋 (關鍵字)
    *   多維度篩選 (類別、價格範圍、物品狀況)
    *   排序功能 (推薦、價格高低、最新上架)
    *   發布新物品 (圖片上傳、定價、押金、面交地點)
    *   收藏/取消收藏物品

### 1.3 租賃交易系統 (Rental Transaction System)
*   **功能描述**: 處理租賃流程，從預訂、付款、狀態追蹤到歸還。
*   **關聯頁面**: `products/code.html` (Rent Now), `member/code.html` (History, Currently Borrowing)
*   **細項**:
    *   租賃預訂 (選擇日期)
    *   訂單狀態管理 (待確認、租賃中、已歸還、已完成)
    *   費用計算 (租金 * 天數 + 押金)
    *   歷史訂單查詢

### 1.4 會員中心與儀表板 (Member Dashboard)
*   **功能描述**: 顯示使用者活動概況、統計數據與評價。
*   **關聯頁面**: `member/code.html`
*   **細項**:
    *   個人統計數據 (分享數、租借數、碳排放減少量、種樹量)
    *   我的庫存管理 (Items for Rent)
    *   當前租借管理 (Currently Borrowing)
    *   交易歷史記錄 (History)
    *   評價系統 (Reviews - 顯示星等與評論)

### 1.5 支援與客服 (Support & Contact)
*   **功能描述**: 提供使用者協助與問題回報管道。
*   **關聯頁面**: `contact/code.html`
*   **細項**:
    *   常見問題分類 (使用問題、糾紛、系統問題)
    *   聯絡表單或工單系統

---

## 2. 建議 API 列表 (Proposed API Endpoints)

### 2.1 認證 (Auth)
*   `POST /api/auth/register` - 註冊新帳號
*   `POST /api/auth/login` - 使用者登入
*   `POST /api/auth/logout` - 登出
*   `GET /api/auth/me` - 取得當前登入使用者資訊

### 2.2 使用者 (User)
*   `GET /api/users/profile` - 取得個人資料 (包含統計數據)
*   `PUT /api/users/profile` - 更新個人資料
*   `GET /api/users/items` - 取得使用者上架的物品清單 (My Inventory)
*   `GET /api/users/rentals/active` - 取得當前進行中的租借 (Currently Borrowing)
*   `GET /api/users/rentals/history` - 取得歷史租借記錄
*   `GET /api/users/reviews` - 取得使用者收到的評價

### 2.3 物品 (Items)
*   `GET /api/items` - 取得物品列表 (支援分頁 pagination)
    *   Query Params: `search`, `category`, `min_price`, `max_price`, `condition`, `sort`, `page`, `limit`
*   `GET /api/items/{id}` - 取得單一物品詳細資訊
*   `POST /api/items` - 新增/上架物品 (Upload)
*   `PUT /api/items/{id}` - 修改物品資訊
*   `DELETE /api/items/{id}` - 下架/刪除物品
*   `POST /api/items/{id}/favorite` - 收藏/取消收藏物品
*   `POST /api/items/upload-image` - 上傳物品圖片

### 2.4 租賃 (Rentals)
*   `POST /api/rentals` - 建立租賃訂單 (Rent Now)
*   `GET /api/rentals/{id}` - 取得訂單詳情
*   `PUT /api/rentals/{id}/status` - 更新訂單狀態 (例如: 確認出租、確認歸還)

### 2.5 系統與統計 (System & Stats)
*   `GET /api/stats/platform` - 取得平台公開統計數據 (首頁 Stats Section: 廢棄物減量, 流通次數, 碳排放)
*   `POST /api/support/ticket` - 提交客服工單 (Contact Form)
