# Rentaloop Implementation Blueprint (完整實作藍圖)

本文件詳述 Rentaloop 平台的技術架構、核心流程、會員制度與 UI/UX 設計規範。

## 1. 專案願景與核心價值 (Vision)
*   **名稱**: Rentaloop
*   **Slogan**: "擁抱體驗，何必佔有"
*   **核心價值**: Trust (信任), Safety (安全), Transparency (透明)
*   **定位**: 高質感 C2C 租賃平台 (攝影/露營/生活家電)

---

## 2. 技術與設計架構 (Tech & Design Stack)
*   **Framework**: Next.js 14+ (App Router)
*   **Language**: TypeScript
*   **Styling (Visuals)**:
    *   **Tailwind CSS**: 用於排版與響應式設計。
    *   **Shadcn UI**: 提供高品質的基礎元件 (Dialog, Select, Calendar, Tabs)。
    *   **Framer Motion**: 使用於頁面轉場與微互動 (Micro-animations)，提升高級感。
*   **Backend / DB**: Supabase (PostgreSQL, Auth, Storage, Realtime)
*   **Icons**: Lucide React

---

## 3. 會員分級與權限體系 (Member System)

我們採用 **"信任階梯" (Trust Ladder)** 設計，鼓勵用戶完成認證。

| 等級 | 身份 (Role) | 條件 (Requirement) | 權限 (Permissions) | UI 顯示特徵 |
| :--- | :--- | :--- | :--- | :--- |
| **Lv0** | **訪客 (Guest)** | 無需登入 | 僅瀏覽商品、搜尋 | 頂部顯示「登入/註冊」按鈕 |
| **Lv1** | **一般會員 (Basic)** | Email 或 Social Login | 收藏商品、公開提問 (Q&A) | 頭像旁無標章 |
| **Lv2** | **認證會員 (Verified)** | 完成手機驗證 + **KYC 證件上傳** | **上架商品**、**申請租賃**、私訊 | 頭像旁顯示 **藍勾勾 (Verified)** |

### 實名認證流程 (KYC Flow)
1.  **用戶發起**: 在「個人中心」點擊「成為認證會員」。
2.  **上傳證件**: 使用 Drag & Drop 介面，上傳身分證/駕照 (存入私有 Bucket)。
3.  **狀態顯示**: 前端顯示 `Pending Review` (審核中)。
4.  **管理員審核**: 後台人工核對後，變更狀態為 `Approved`。

---

## 4. 核心功能流程與 UI 設計 (Core Flows & UI)

### 4.1 C2C 商品上架流程 (Item Listing)
採用 **單頁式長表單 (Single Page Form)** 設計，利用錨點或滾動偵測提供流暢體驗，同時保有手機版友善度。

*   **表單結構**:
    *   **基本資訊**: 標題、描述、**動態多層級分類 (L1 > L2 > L3)**。
    *   **圖片上傳**: 支援 Drag & Drop 與封面圖設定。
    *   **價格與規則**: 日租金、押金、面交地點。
    *   **檔期設定**: 互動式月曆設定不可租日期。
    *   *技術實作*: 使用 React Hook Form + Zod 進行即時驗證。

### 4.2 租賃預約流程 (Rental Booking Flow)
*   **瀏覽**: 商品詳情頁 (Product Detail Page) 包含大圖輪播、規格表、**可用日曆**。
*   **預約**:
    1.  租客選擇 `Start Date` 與 `End Date` (Range Picker)。
    2.  系統計算總價 (Total = Days * Rate)。
    3.  若為 Lv1，彈出 Modal 引導至認證頁面。
    4.  若為 Lv2，進入「確認訂單頁」 (Checkout Review)。
*   **狀態**: 訂單建立，狀態為 `Pending Approval`。

### 4.3 訂單狀態機 (Rental State Machine)
清楚定義訂單的生命週期，雙方需在平台上操作以推進狀態。

1.  `Pending Approval` (待審核): 租客送出請求 -> 業主收到通知。
2.  `Approved` (已核准): 業主同意 -> 開放「付款/押金」介面 (MVP 可模擬)。
3.  `Paid` (已付款): 租客付款 -> 開放「私訊」與「聯絡電話」。
4.  `Picked Up` (已取件): 面交當下，租客點擊「確認取件」。
5.  `Returned` (已歸還): 歸還當下，業主點擊「確認物品無誤」。
6.  `Completed` (完成): 系統退回押金 -> 雙方互評。
    *   *(例外狀態: Cancelled, Overdue)*

---
## 5. 管理員後台系統 (Admin System)
為確保平台營運品質與安全，建立完整的管理員 (Admin) 權限體系。
**架構**: 採用 **獨立 Layout (`/admin/layout.tsx`)**，擁有獨立的側邊導航與風格，不與前台共用 Header/Footer。

### 5.1 會員管理 (User Management)
*   **權限**: 管理所有 Google Auth 註冊的會員。
*   **功能**:
    *   **會員列表**: 檢視所有會員的基本資料 (UUID, Email, Display Name, 註冊時間)。
    *   **詳細資料**: 查看會員註冊詳細資訊。
    *   **KYC 審核**: 審核會員上傳的身分證/駕照，執行 `Approve` 或 `Reject` 操作。

### 5.2 商品管理 (Item Moderation)
*   **權限**: 管理所有已上架的商品。
*   **功能**:
    *   **商品全局列表**: 依分類、上架時間篩選。
    *   **違規處理**: 針對違規商品執行 `Ban` (下架/禁止顯示) 操作。
    *   **刪除商品**: 強制刪除惡意或錯誤商品。
    *   **分類調整**: 若會員選錯分類，管理員可強制修改商品的 `category_id`。

### 5.3 分類管理 (Category Management)
*   **架構**: 採用 **多層級關聯式分類 (L1 > L2 > L3)**。
*   **介面**: 樹狀結構編輯器 (Tree Editor)。
*   **功能**:
    *   **CRUD**: 新增、編輯、刪除分類節點。
    *   **層級移動**: 調整分類的父子關係 (Parent ID)。

### 5.4 內容管理 (Content Management)
*   **權限**: 自行管理前台關鍵版位的圖片。
*   **範圍**:
    *   **Index Hero**: 首頁主視覺輪播圖。
    *   **Products Hero**: 商品列表頁頂部 Banner。
*   **功能**: 上傳圖片、設定連結、啟用/停用。

---

## 6. 資料庫架構 (Database Schema)

依據上述流程優化資料庫欄位。

### Tables
1.  **profiles**
    *   `id` (PK, ref auth.users)
    *   `role`: 'basic' | 'verified' | 'admin'
    *   `kyc_status`: 'none' | 'pending' | 'approved' | 'rejected'
    *   `email`: string (Synced from Auth)
2.  **categories** (新增: 關聯式分類)
    *   `id`: UUID
    *   `name`: String (e.g., "戶外露營")
    *   `parent_id`: UUID (Self-ref, Nullable for L1)
    *   `level`: Integer (1, 2, 3)
    *   `slug`: String
3.  **items**
    *   `id`
    *   `owner_id` (ref profiles)
    *   `category_id`: UUID (ref categories)
    *   `title`, `description`
    *   `price_per_day`, `deposit`
    *   `images`: text[]
    *   `is_archived`: boolean
    *   `status`: 'active' | 'banned' | 'deleted'
4.  **site_content** (新增: 內容管理)
    *   `id`: UUID
    *   `location`: 'index_hero' | 'products_hero'
    *   `image_url`: String
    *   `link_url`: String
    *   `is_active`: Boolean
    *   `order`: Integer
5.  **rentals**
    *   `status`: 'pending', 'approved', 'paid', 'active', 'returned', 'completed', 'cancelled'
    *   `start_date`, `end_date`
    *   `total_amount`
6.  **messages**
    *   `rental_id`
    *   `content`

---

## 7. 實作優先順序 (Roadmap)

### Phase 1: 基礎建設 (Foundation)
1.  [ ] 初始化 Next.js + Tailwind + Shadcn UI。
2.  [ ] 設定 Supabase Auth & Database (含 Admin Role 設定)。
3.  [ ] 建立 `categories` 種子資料 (Seeding)。

### Phase 2: 核心業務 (Core Business)
1.  [ ] **個人中心**: Lv2 KYC 流程。
2.  [ ] **分類系統**: 實作 L1/L2 選單邏輯。
3.  [ ] **商品上架**: Wizard 表單 (結合分類選擇)。

### Phase 3: 租賃互動 (Interaction)
1.  [ ] **詳情頁**: 日曆與價格。
2.  [ ] **訂單管理**: 狀態流轉。

### Phase 4: 後台系統 (Admin System)
1.  [ ] **會員管理**: 列表與 KYC 審核介面。
2.  [ ] **分類管理**: 樹狀結構編輯器。
3.  [ ] **內容管理**: Hero Banner 上傳與排序。

此計畫表已重新設計，涵蓋了管理員權限與進階系統架構。
