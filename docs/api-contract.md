# 安全業績 API Contract（草案）

所有端點必須同源、使用 `application/json`，並透過 Secure + HttpOnly Session Cookie 驗證。前端不持有 DOS MCP Token。

## `GET /api/session`

成功回應：

```json
{
  "authenticated": true,
  "user": {
    "display_name": "目前使用者",
    "role": "manager",
    "role_label": "課長",
    "scope_label": "所屬業務課"
  }
}
```

未登入：`401`。後端依公司目錄建立角色與範圍，不能接受前端傳入角色。

## `POST /api/logout`

撤銷伺服器 Session 並清除 Cookie。成功：`204`。

## `GET /api/dashboard/summary`

後端先由 Session 取得資料範圍，再向 DOS MCP／安全資料庫查詢。回傳範例：

```json
{
  "snapshot": "YYYY/MM/DD",
  "kpis": [
    {
      "id": "performance",
      "label": "期間業績",
      "value": "已授權彙總",
      "trend": "與同口徑目標比較",
      "status": "warning"
    }
  ],
  "priorities": [
    {
      "title": "需要追蹤的行動",
      "owner": "責任角色",
      "due": "期限",
      "severity": "high",
      "severity_label": "高優先"
    }
  ],
  "alerts": [
    {
      "title": "主管介入事項",
      "detail": "不包含未授權明細"
    }
  ],
  "trends": [
    {
      "label": "月份",
      "value": 0,
      "display_value": "彙總顯示值"
    }
  ],
  "product_mix": [
    {
      "label": "產品類別",
      "value": 0,
      "display_value": "占比"
    }
  ]
}
```

## 後端資料來源建議

- `mcp__dos__get_performance_raw_rows`：業績與月份彙總。
- `mcp__dos__get_performance_targets`：實績／目標。
- `mcp__dos__get_performance_dimensions`：合法維度與代碼。
- `mcp__dos__get_sales_users`：伺服器端組織與範圍映射。

後端必須先套用授權範圍，再彙總與回傳；禁止把完整 rows 交給瀏覽器後再由前端過濾。

## 維度資料治理

DOS 維度目前可能包含重複的廣告類型、同名不同代碼、停售區域、空白或測試型區域值。後端不可直接把維度清單原樣顯示，應建立版本化的 canonical mapping：

- 廣告類型依 `ad_type` 去重。
- 區域以正式縣市／行政區代碼映射，停售與測試值預設排除。
- 組織與頻道保留原始代碼，同時提供正式顯示名稱。
- 每次同步記錄維度版本，避免歷史報表因名稱變更而漂移。
