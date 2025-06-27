### **任務目標**

在現有的 VS Code 擴充功能專案中，為 `webview-ui` 目錄下的 Vite React-TS 專案進行配置，並實現以下功能：

1.  創建兩個 VS Code 命令：`openPanel1` 和 `openPanel2`。
2.  每個命令將開啟一個**獨立**的 Webview Panel。
3.  `openPanel1` 開啟的 Panel 顯示 "這是 Panel 1 的內容"。
4.  `openPanel2` 開啟的 Panel 顯示 "這是 Panel 2 的內容"。
5.  確保 Webview 能夠正確載入 React 應用程式。

### **詳細計畫**

我將把任務分解為以下幾個步驟：

#### **階段一：環境準備與 Webview UI 專案配置**

1.  **確認 `webview-ui` 專案狀態**：
    *   檢查 `webview-ui/package.json` 以確認 React 和 Vite 的依賴。
    *   檢查 `webview-ui/vite.config.ts` (如果存在) 或創建一個基本的 Vite 配置，確保它能正確打包 React 應用程式。
    *   確保 `webview-ui/src/main.tsx` (或 `index.tsx`) 是 React 應用的入口點。

2.  **修改 `webview-ui` 專案以支持多頁面內容**：
    *   在 `webview-ui/src` 下創建兩個新的 React 組件，例如 `Panel1Content.tsx` 和 `Panel2Content.tsx`，分別包含 "這是 Panel 1 的內容" 和 "這是 Panel 2 的內容"。
    *   修改 `webview-ui/src/App.tsx` (或創建一個新的根組件)，使其能夠根據傳入的屬性或環境變數來渲染不同的內容組件。由於是獨立的 Panel，每個 Panel 會載入一個獨立的 React 應用，所以 `App.tsx` 將會是每個 Panel 的入口。

#### **階段二：VS Code 擴充功能邏輯實現**

1.  **修改 `package.json` (擴充功能根目錄)**：
    *   在 `contributes.commands` 中註冊 `openPanel1` 和 `openPanel2` 命令。
    *   在 `contributes.views` 中定義 Webview Panel 的視圖類型 (如果需要)。

2.  **修改 `src/extension.ts`**：
    *   **創建 `getWebviewContent` 輔助函數**：這個函數將負責生成 Webview 的 HTML 內容。它將接收一個參數，用於指定要顯示的內容類型（例如 'panel1' 或 'panel2'）。
        *   此函數將讀取 `webview-ui` 打包後的 `index.html` 模板。
        *   它將替換模板中的佔位符，例如 `{{content}}`，以插入不同的 React 應用入口點或直接的 HTML 內容。
        *   它還需要處理 `scriptUri` 和 `nonce`，以確保 CSP (Content Security Policy) 正確。
    *   **註冊 `openPanel1` 命令**：
        *   當命令被執行時，創建一個新的 `vscode.WebviewPanel`。
        *   調用 `getWebviewContent('panel1')` 來獲取 Panel 1 的 HTML 內容並設置給 `panel.webview.html`。
        *   處理 Panel 關閉時的資源釋放。
    *   **註冊 `openPanel2` 命令**：
        *   當命令被執行時，創建一個新的 `vscode.WebviewPanel`。
        *   調用 `getWebviewContent('panel2')` 來獲取 Panel 2 的 HTML 內容並設置給 `panel.webview.html`。
        *   處理 Panel 關閉時的資源釋放。

#### **階段三：構建與測試**

1.  **配置 `esbuild.js` 或其他構建工具**：
    *   確保 `webview-ui` 專案能夠被正確打包，並將打包後的檔案輸出到擴充功能可以訪問的目錄，例如 `dist/webview-ui`。
    *   由於是兩個獨立的 Panel，可能需要為每個 Panel 生成一個獨立的入口點或通過查詢參數來控制內容。
    *   考慮使用 Vite 的 `build.rollupOptions.input` 來定義多個入口點，或者在 `extension.ts` 中動態生成不同的 HTML。

2.  **測試**：
    *   運行擴充功能並測試 `openPanel1` 和 `openPanel2` 命令，確保它們能正確開啟獨立的 Webview Panel 並顯示預期的內容。

---

### **Mermaid 流程圖**

```mermaid
graph TD
    A[使用者執行命令] -->|openPanel1 或 openPanel2| B{extension.ts 接收命令};
    B --> C{創建新的 WebviewPanel};
    C --> D{根據命令類型生成 Webview HTML};
    D --> E[Webview Panel 顯示內容];

    subgraph Webview UI (Vite React-TS)
        F[Panel1Content.tsx]
        G[Panel2Content.tsx]
        H[App.tsx (或通用入口)]
        I[main.tsx (或 index.tsx)]
    end

    subgraph Extension (src/extension.ts)
        J[註冊 openPanel1 命令]
        K[註冊 openPanel2 命令]
        L[getWebviewContent 輔助函數]
    end

    J --> C;
    K --> C;
    D --> L;
    L --> F;
    L --> G;
    L --> H;
    L --> I;