# DigitM 安全業績戰情室 v2

這個分支是安全改版草案，目標是停止在公開 GitHub Pages 發布公司業績、建案、客戶、員工或 Pipeline 明細。

## 目前狀態

- 前端已改成安全殼層，不再載入公開 JSON。
- 前端只接受同源、帶 HttpOnly Session Cookie 的 API。
- 登入、角色與資料範圍必須由後端驗證；瀏覽器不再自行判定角色。
- 目前尚未實作後端，因此直接開啟靜態頁面會顯示「安全後端尚未完成部署」。這是預期行為，避免在保護措施完成前繼續暴露資料。

## 本機驗證

```bash
python3 -m unittest tests/test_public_security.py -v
```

## 上線前必要條件

1. 將前後端部署到可執行伺服器，不使用 GitHub Pages 承載內部資料。
2. 後端完成公司 Google OIDC 驗證與伺服器端 Token 驗章。
3. 後端建立 `admin`、`manager`、`team_leader`、`sales` 角色及資料列級權限。
4. DOS MCP Token 只存在伺服器環境變數，絕不下傳瀏覽器。
5. 實作 `docs/api-contract.md` 的同源 API。
6. 先完成權限越權測試，再切換正式流量。

## 重要提醒

刪除目前分支中的 JSON 只會阻止新版部署繼續提供檔案，**不會移除 Git 歷史中的舊資料**。正式處理方式見 `SECURITY.md`。
