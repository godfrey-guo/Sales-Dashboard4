# 安全遷移說明

## 已確認的風險

舊版為純靜態 GitHub Pages。登入與角色判斷發生在瀏覽器，但業績與建案資料在登入前即可由公開 URL 下載。前端登入不能保護同一部署中的靜態檔案。

## P0：立即止血

1. 將目前 GitHub Pages 暫停或切換成不含資料的安全殼層。
2. 撤下公開資料匯出檔，不再將其提交到 Git。
3. 假設過去公開資料已被存取，盤點資料敏感等級與通知流程。
4. 輪替任何曾出現在儲存庫、前端程式或 Git 歷史中的金鑰。
5. 移除 Git 歷史中的敏感檔案後強制更新遠端；執行前必須先備份並通知所有協作者重新 clone。

> 僅在新 commit 刪檔不足以清除歷史。建議由儲存庫管理者使用 `git filter-repo` 進行專案級清理，並依 GitHub 官方流程處理快取與 fork。這是破壞性操作，不包含在本分支中。

## P1：安全後端

- 公司 Google OIDC：Authorization Code + PKCE；後端驗證 issuer、audience、signature、expiry、nonce。
- Session：Secure、HttpOnly、SameSite=Lax/Strict Cookie；短效 Session 與伺服器端撤銷。
- 權限：
  - `admin`：公司彙總。
  - `manager`：所屬課。
  - `team_leader`：所屬組。
  - `sales`：本人。
- 授權必須在每個 API 查詢套用，不能只靠前端隱藏按鈕或篩選結果。
- DOS MCP/API 僅由後端呼叫；Token 存於 Hostinger Environment／Secret Store。
- 回傳最少必要彙總，明細另設具審計紀錄的權限。

## P1：網路與瀏覽器防護

- 強制 HTTPS、HSTS、CSP、`frame-ancestors 'none'`、`Referrer-Policy: no-referrer`。
- API 同源；若不得不同源，使用明確 CORS allowlist，禁止 `*` 搭配 Cookie。
- CSRF 防護、登入速率限制、審計日誌與異常登入警示。
- 禁止在 localStorage 儲存 Session、角色、業績或客戶資料。

## P2：營運治理

- 依角色紀錄資料查詢與匯出事件。
- 每季檢查離職、轉組與主管權限。
- 建立資料快照版本與指標口徑版本。
- 加入依角色的自動化越權測試及 API Contract Test。

## 上線驗收

- 未登入請求所有 `/api/*` 均回傳 401。
- 業務帳號無法取得其他業務資料，即使自行修改 URL、Query 或 Request Body。
- 組長／課長只能查看其組／課；跨範圍請求回傳 403 或空集合。
- 瀏覽器 Network、HTML、JS、Source Map 均不含 Token、全公司原始資料或角色名單。
- 公開路徑與 GitHub Pages 不再提供舊 JSON。
- 主管看到的彙總與 DOS 同截止日、同口徑對帳成功。
