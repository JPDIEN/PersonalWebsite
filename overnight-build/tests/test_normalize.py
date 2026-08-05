import unittest

from dealdesk.normalize import norm_domain, norm_name, norm_text


class TestNormName(unittest.TestCase):
    def test_strips_legal_suffixes(self):
        self.assertEqual(norm_name("Acme, Inc."), "acme")
        self.assertEqual(norm_name("Acme LLC"), "acme")
        self.assertEqual(norm_name("Acme Labs Ltd"), "acme labs")

    def test_multiple_suffixes(self):
        self.assertEqual(norm_name("Acme Co. Inc"), "acme")

    def test_keeps_meaningful_words(self):
        self.assertEqual(norm_name("Stripe"), "stripe")
        self.assertEqual(norm_name("Scale AI"), "scale ai")

    def test_never_empties_a_suffix_only_name(self):
        # A company literally named "Co" should not normalize to "".
        self.assertEqual(norm_name("Co"), "co")

    def test_punctuation_and_case(self):
        self.assertEqual(norm_name("  FoO-Bar!  "), "foo bar")

    def test_empty(self):
        self.assertEqual(norm_name(""), "")


class TestNormDomain(unittest.TestCase):
    def test_full_url(self):
        self.assertEqual(norm_domain("https://www.acme.io/about?x=1"), "acme.io")

    def test_bare_domain(self):
        self.assertEqual(norm_domain("Acme.io"), "acme.io")

    def test_email(self):
        self.assertEqual(norm_domain("jane@acme.io"), "acme.io")

    def test_port_stripped(self):
        self.assertEqual(norm_domain("http://acme.io:8080/x"), "acme.io")

    def test_not_a_domain(self):
        self.assertIsNone(norm_domain("n/a"))
        self.assertIsNone(norm_domain("stealth"))
        self.assertIsNone(norm_domain(""))

    def test_subdomain_kept(self):
        self.assertEqual(norm_domain("https://app.acme.io"), "app.acme.io")


class TestNormText(unittest.TestCase):
    def test_collapses_whitespace(self):
        self.assertEqual(norm_text("  a\n b\tc "), "a b c")

    def test_none(self):
        self.assertEqual(norm_text(None), "")


if __name__ == "__main__":
    unittest.main()
