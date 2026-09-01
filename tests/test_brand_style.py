import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
CSS = (ROOT / "assets" / "styles.css").read_text(encoding="utf-8")


class BrandStyleTests(unittest.TestCase):
    def test_digitm_corporate_colors_are_declared(self):
        self.assertIn("--digitm-blue: #263e44", CSS.lower())
        self.assertIn("--digitm-green: #e6f31e", CSS.lower())

    def test_godfrey_warm_editorial_palette_is_declared(self):
        expected = (
            "--godfrey-orange: #ff8a1f",
            "--godfrey-orange-text: #c2410c",
            "--godfrey-cocoa: #35150f",
            "--godfrey-cream: #fff4e6",
            "--godfrey-terracotta: #b84a32",
        )
        lowered = CSS.lower()
        for token in expected:
            self.assertIn(token, lowered)

    def test_small_text_is_not_white_on_personal_orange(self):
        self.assertIn("--orange-foreground: #161616", CSS.lower())

    def test_dashboard_has_editorial_texture_and_line_art(self):
        self.assertIn(".page-shell::before", CSS)
        self.assertIn(".page-shell::after", CSS)
        self.assertIn("radial-gradient", CSS)


if __name__ == "__main__":
    unittest.main()
