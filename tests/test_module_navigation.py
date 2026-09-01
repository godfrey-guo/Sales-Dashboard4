import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
HTML = (ROOT / "index.html").read_text(encoding="utf-8")
JS = (ROOT / "assets" / "app.js").read_text(encoding="utf-8")


class ModuleNavigationTests(unittest.TestCase):
    def test_original_business_modules_remain_available(self):
        labels = (
            "經營總覽",
            "業績總覽",
            "建案分析",
            "課組戰情",
            "業務戰報",
            "週會追蹤",
            "目標中心",
            "區域歷年戰情",
            "OKR 考核",
        )
        for label in labels:
            self.assertIn(label, HTML)

    def test_navigation_is_accessible_and_module_addressable(self):
        self.assertIn('id="module-nav"', HTML)
        self.assertIn('aria-label="功能分頁"', HTML)
        for module in ("overview", "performance", "projects", "teams", "war-room", "weekly", "targets", "regions", "okr"):
            self.assertIn(f'data-module="{module}"', HTML)

    def test_frontend_filters_navigation_from_server_permissions(self):
        self.assertIn("allowed_modules", JS)
        self.assertIn("activateModule", JS)
        self.assertNotIn("localStorage", JS)


if __name__ == "__main__":
    unittest.main()
