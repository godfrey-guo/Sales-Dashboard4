import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
APP = ROOT / "assets" / "app.js"


class PublicDashboardSecurityTests(unittest.TestCase):
    def test_sensitive_static_exports_are_not_public(self):
        forbidden = {
            "data.json",
            "proj_rows.json",
            "yoy.json",
            "ins_detail.json",
            "regions.json",
        }
        present = {path.name for path in ROOT.iterdir() if path.is_file()}
        self.assertFalse(
            forbidden & present,
            f"Sensitive static exports must not be deployed: {sorted(forbidden & present)}",
        )

    def test_index_contains_no_embedded_identity_or_demo_credentials(self):
        html = INDEX.read_text(encoding="utf-8")
        forbidden_markers = (
            "DEMO_USERS",
            "EMAIL_USERS",
            "密碼皆 1234",
            "@digitm.com.tw",
            "ins_detail.json",
            "proj_rows.json",
            "yoy.json",
            "data.json",
        )
        for marker in forbidden_markers:
            self.assertNotIn(marker, html)

    def test_frontend_uses_authenticated_backend_endpoints(self):
        js = APP.read_text(encoding="utf-8")
        self.assertIn("/api/session", js)
        self.assertIn("/api/dashboard/summary", js)
        self.assertIn('credentials: "include"', js)
        self.assertNotIn("localStorage", js)

    def test_frontend_does_not_decode_or_trust_identity_tokens(self):
        js = APP.read_text(encoding="utf-8")
        forbidden_markers = (
            "atob(",
            "resp.credential",
            "EMAIL_USERS",
            "ADMIN_EMAILS",
        )
        for marker in forbidden_markers:
            self.assertNotIn(marker, js)

    def test_page_declares_restrictive_content_security_policy(self):
        html = INDEX.read_text(encoding="utf-8")
        self.assertIn("Content-Security-Policy", html)
        self.assertIn("default-src 'self'", html)
        self.assertNotIn("'unsafe-inline'", html)


if __name__ == "__main__":
    unittest.main()
