"use strict";

const $ = (selector) => document.querySelector(selector);

const elements = {
  accessPanel: $("#access-panel"),
  accessTitle: $("#access-title"),
  accessMessage: $("#access-message"),
  loginLink: $("#login-link"),
  dashboard: $("#dashboard"),
  sessionLabel: $("#session-label"),
  sessionDot: $(".status-dot"),
  logoutButton: $("#logout-button"),
  scopeLabel: $("#scope-label"),
  snapshot: $("#snapshot"),
  kpiGrid: $("#kpi-grid"),
  priorityList: $("#priority-list"),
  alertList: $("#alert-list"),
  trendChart: $("#trend-chart"),
  mixList: $("#mix-list"),
};

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(options.headers || {}),
    },
  });

  if (response.status === 401 || response.status === 403) {
    const error = new Error("AUTH_REQUIRED");
    error.status = response.status;
    throw error;
  }

  if (!response.ok) {
    throw new Error(`HTTP_${response.status}`);
  }

  return response.json();
}

function textElement(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = String(text ?? "—");
  return node;
}

function setAccessState(kind, title, message) {
  elements.accessTitle.textContent = title;
  elements.accessMessage.textContent = message;
  elements.sessionDot.classList.remove("is-ready", "is-error");
  if (kind === "ready") elements.sessionDot.classList.add("is-ready");
  if (kind === "error") elements.sessionDot.classList.add("is-error");
}

function renderKpis(items = []) {
  elements.kpiGrid.replaceChildren();
  for (const item of items) {
    const card = document.createElement("article");
    card.className = "kpi-card";
    card.dataset.status = item.status || "neutral";
    card.append(
      textElement("span", "kpi-label", item.label),
      textElement("strong", "kpi-value", item.value),
      textElement("span", "kpi-trend", item.trend || ""),
    );
    elements.kpiGrid.append(card);
  }
}

function renderPriorities(items = []) {
  elements.priorityList.replaceChildren();
  if (!items.length) {
    elements.priorityList.append(textElement("li", "empty-state", "目前沒有待處理事項"));
    return;
  }
  items.forEach((item, index) => {
    const row = document.createElement("li");
    row.className = "priority-item";
    const body = document.createElement("div");
    body.append(
      textElement("div", "item-title", item.title),
      textElement("div", "item-meta", [item.owner, item.due].filter(Boolean).join(" · ")),
    );
    const severity = textElement("span", "severity", item.severity_label || "追蹤");
    severity.dataset.level = item.severity || "medium";
    row.append(textElement("span", "priority-rank", String(index + 1).padStart(2, "0")), body, severity);
    elements.priorityList.append(row);
  });
}

function renderAlerts(items = []) {
  elements.alertList.replaceChildren();
  if (!items.length) {
    elements.alertList.append(textElement("li", "empty-state", "目前沒有主管警示"));
    return;
  }
  for (const item of items) {
    const row = document.createElement("li");
    row.className = "alert-item";
    row.append(
      textElement("div", "item-title", item.title),
      textElement("div", "item-meta", item.detail),
    );
    elements.alertList.append(row);
  }
}

function renderBars(container, items = [], variant = "trend") {
  container.replaceChildren();
  const max = Math.max(1, ...items.map((item) => Number(item.value) || 0));
  if (!items.length) {
    container.append(textElement("div", "empty-state", "目前沒有可顯示的資料"));
    return;
  }

  for (const item of items) {
    const value = Math.max(0, Number(item.value) || 0);
    const percent = Math.min(100, (value / max) * 100);
    if (variant === "mix") {
      const row = document.createElement("div");
      row.className = "mix-row";
      const label = document.createElement("div");
      label.className = "mix-label";
      label.append(textElement("span", "", item.label), textElement("span", "", item.display_value || value));
      const track = document.createElement("div");
      track.className = "mix-track";
      const bar = document.createElement("div");
      bar.className = "mix-value";
      bar.style.width = `${percent}%`;
      track.append(bar);
      row.append(label, track);
      container.append(row);
    } else {
      const row = document.createElement("div");
      row.className = "bar-row";
      const track = document.createElement("div");
      track.className = "bar-track";
      const bar = document.createElement("div");
      bar.className = "bar-value";
      bar.style.width = `${percent}%`;
      track.append(bar);
      row.append(
        textElement("span", "", item.label),
        track,
        textElement("span", "bar-number", item.display_value || value),
      );
      container.append(row);
    }
  }
}

function renderDashboard(session, summary) {
  elements.sessionLabel.textContent = `${session.user.display_name}｜${session.user.role_label}`;
  elements.scopeLabel.textContent = `資料範圍：${session.user.scope_label}`;
  elements.snapshot.textContent = summary.snapshot || "—";
  elements.logoutButton.hidden = false;
  elements.sessionDot.classList.add("is-ready");
  renderKpis(summary.kpis);
  renderPriorities(summary.priorities);
  renderAlerts(summary.alerts);
  renderBars(elements.trendChart, summary.trends, "trend");
  renderBars(elements.mixList, summary.product_mix, "mix");
  elements.accessPanel.hidden = true;
  elements.dashboard.hidden = false;
}

async function logout() {
  try {
    await fetchJson("/api/logout", { method: "POST" });
  } finally {
    window.location.assign("/auth/login");
  }
}

async function start() {
  try {
    const session = await fetchJson("/api/session");
    const summary = await fetchJson("/api/dashboard/summary");
    renderDashboard(session, summary);
  } catch (error) {
    elements.dashboard.hidden = true;
    elements.accessPanel.hidden = false;
    elements.logoutButton.hidden = true;
    if (error.message === "AUTH_REQUIRED") {
      elements.sessionLabel.textContent = "尚未登入";
      elements.loginLink.hidden = false;
      setAccessState("error", "需要公司帳號授權", "請登入後再載入你有權查看的業績彙總。");
      return;
    }
    elements.sessionLabel.textContent = "安全服務未連線";
    elements.loginLink.hidden = true;
    setAccessState("error", "安全後端尚未完成部署", "公開頁面已停止載入內部資料。待受保護 API 上線後，這裡才會顯示儀表板。");
  }
}

elements.logoutButton.addEventListener("click", logout);
start();
