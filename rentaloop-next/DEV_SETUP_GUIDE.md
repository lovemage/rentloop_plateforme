# 開發環境設定指南 (IDE, WSL & Agent Browser)

本指南旨在協助您在 WSL (Windows Subsystem for Linux) 環境下配置 IDE 與瀏覽器，以確保 AI Agent (如 Antigravity) 與開發工具能順利運作。

## 1. WSL 基礎環境檢查

確保您的 WSL 2 環境已更新：

```bash
# 在 WSL 終端機中執行
sudo apt-get update
sudo apt-get upgrade -y
```

## 2. IDE 設定 (Visual Studio Code)

在 WSL 中進行開發，推薦使用 VS Code 搭配 Remote 擴充功能。

1.  **安裝 VS Code (Windows 下)**。
2.  **安裝 "WSL" 擴充功能** (Microsoft 出品)。
3.  **開啟專案**：
    - 在 WSL 終端機進入專案資料夾：`cd ~/projects/rentloop_plateforme`
    - 輸入 `code .`
    - VS Code 將會啟動並連線到 WSL 環境 (左下角會顯示 "WSL: Ubuntu" 或類似名稱)。

## 3. 設定 Agent 瀏覽器支援 (解決連線錯誤)

如果您遇到 Agent 無法啟動瀏覽器 (例如 `ECONNREFUSED 127.0.0.1:9222`)，通常是因為 WSL 環境缺少執行瀏覽器所需的圖形化函式庫或瀏覽器本身未安裝。Agent 通常使用 **Playwright** 或 **Puppeteer** 來控制瀏覽器。

### 步驟 A: 安裝瀏覽器相依套件 (針對 Ubuntu/Debian WSL)

在 WSL 終端機中執行以下指令，安裝 Chrome/Chromium 及其相依套件：

```bash
# 安裝 Chromium 瀏覽器
sudo apt-get install -y chromium-browser

# 如果 Agent 使用 Playwright，通常需要額外的相依套件
# 您可以嘗試安裝 Playwright 推薦的系統相依項目
npx playwright install-deps
```

### 步驟 B: 手動啟動除錯模式瀏覽器 (進階)

如果 Agent 需要連線到特定的 Port (如 9222)，您可以嘗試手動啟動一個 Headless (無介面) 瀏覽器來讓 Agent 連接：

```bash
# 啟動 Chromium 並開啟遠端除錯 Port 9222
chromium-browser --headless --remote-debugging-port=9222 --no-sandbox --disable-gpu &
```

*注意：執行後，Agent 應能透過 `http://127.0.0.1:9222` 連線。*

## 4. 解決 WSL 與 Windows 瀏覽器通訊問題

如果您希望 Agent 控制 **Windows 上的 Chrome** (以此看到畫面)，需要進行網路設定：

1.  **在 Windows 上啟動 Chrome**：
    開啟命令提示字元 (cmd) 或 PowerShell，執行：
    ```powershell
    # 需修改路徑至您的 Chrome 安裝位置
    "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\chrome-dev-profile"
    ```
    *(注意：這會開啟一個全新的 Chrome 設定檔視窗)*

2.  **讓 WSL 連線到 Windows IP**：
    WSL 內的 `localhost` 有時無法直接導向 Windows。您可能需要使用 Windows 的 IP 位址，或者確保 WSL 的 `localhost` 轉發設定正確 (WSL 2 預設通常支援 localhost 轉發)。

---

## 5. Next.js 專案常用指令

在環境設定完成後，您可以透過以下指令管理專案：

```bash
# 啟動開發伺服器
npm run dev

# 資料庫推播 (Drizzle)
npx drizzle-kit push
```
