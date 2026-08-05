import unittest

from dealdesk.scoring import (ThesisError, score_deal, validate_thesis)


def thesis(**overrides):
    base = {
        "name": "Test thesis",
        "rules": [
            {"label": "Sector", "field": "sector", "weight": 50, "match": ["fintech"]},
            {"label": "Stage", "field": "round", "weight": 30, "match": ["seed"]},
            {"label": "Keywords", "field": "any", "weight": 20, "match": ["api"]},
        ],
        "vetoes": [
            {"label": "Out of scope", "field": "any", "match": ["gambling"]},
        ],
    }
    base.update(overrides)
    return base


def deal(**overrides):
    base = {"name": "Acme", "description": "", "sector": "", "round": "",
            "location": "", "founders": "", "source": "", "extra": {}}
    base.update(overrides)
    return base


class TestScoreDeal(unittest.TestCase):
    def test_full_match(self):
        s, detail = score_deal(deal(sector="Fintech", round="Seed",
                                    description="An API for banks"), thesis())
        self.assertEqual(s, 100.0)
        self.assertTrue(all(r["matched"] for r in detail["rules"]))

    def test_partial_match_is_weighted(self):
        s, _ = score_deal(deal(sector="Fintech"), thesis())  # 50 of 100
        self.assertEqual(s, 50.0)

    def test_no_match(self):
        s, detail = score_deal(deal(sector="Biotech"), thesis())
        self.assertEqual(s, 0.0)
        self.assertIsNone(detail["veto"])

    def test_word_boundary_matching(self):
        # "ai" must not match inside "chain"
        t = thesis(rules=[{"label": "AI", "field": "any", "weight": 10, "match": ["ai"]}],
                   vetoes=[])
        s, _ = score_deal(deal(description="supply chain tooling"), t)
        self.assertEqual(s, 0.0)
        s, _ = score_deal(deal(description="AI infra"), t)
        self.assertEqual(s, 100.0)

    def test_multiword_term(self):
        t = thesis(rules=[{"label": "Model", "field": "any", "weight": 10,
                           "match": ["b2b saas"]}], vetoes=[])
        s, _ = score_deal(deal(description="A B2B SaaS platform"), t)
        self.assertEqual(s, 100.0)

    def test_veto_zeroes_score(self):
        s, detail = score_deal(
            deal(sector="Fintech", description="gambling platform"), thesis())
        self.assertEqual(s, 0.0)
        self.assertEqual(detail["veto"]["term"], "gambling")

    def test_any_field_searches_extra(self):
        s, _ = score_deal(deal(extra={"Notes": "great API"}), thesis())
        self.assertEqual(s, 20.0)

    def test_detail_records_matched_term(self):
        _, detail = score_deal(deal(sector="fintech"), thesis())
        sector_rule = detail["rules"][0]
        self.assertEqual(sector_rule["term"], "fintech")
        self.assertTrue(sector_rule["matched"])


class TestValidateThesis(unittest.TestCase):
    def test_valid_passes(self):
        self.assertEqual(validate_thesis(thesis())["name"], "Test thesis")

    def test_missing_rules(self):
        with self.assertRaises(ThesisError):
            validate_thesis({"name": "x"})

    def test_bad_field(self):
        with self.assertRaises(ThesisError):
            validate_thesis(thesis(rules=[{"label": "x", "field": "bogus",
                                           "weight": 10, "match": ["a"]}]))

    def test_bad_weight(self):
        with self.assertRaises(ThesisError):
            validate_thesis(thesis(rules=[{"label": "x", "field": "any",
                                           "weight": -5, "match": ["a"]}]))

    def test_empty_match(self):
        with self.assertRaises(ThesisError):
            validate_thesis(thesis(rules=[{"label": "x", "field": "any",
                                           "weight": 10, "match": []}]))

    def test_vetoes_validated_without_weight(self):
        t = thesis(vetoes=[{"label": "v", "field": "any", "match": ["x"]}])
        validate_thesis(t)  # should not raise


if __name__ == "__main__":
    unittest.main()
