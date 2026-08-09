// The memo library: publicly available VC investment memos, investment
// notes, and theses, aggregated from firm sites, archives, and collections.

export type MemoKind = "memo" | "notes" | "thesis" | "classic";

export interface Memo {
  company: string;
  firm: string;
  stage?: string;
  year?: number;
  kind: MemoKind;
  href: string;
  note?: string;
  featured?: boolean;
}

export const kindLabels: Record<MemoKind, string> = {
  memo: "Internal memo",
  notes: "Investment notes",
  thesis: "Thesis",
  classic: "Classic",
};

export const kindDescriptions: Record<MemoKind, string> = {
  memo: "Real internal memos written at the moment of decision, later made public.",
  notes: "Essays the firm published explaining why they invested.",
  thesis: "Public theses on a specific protocol or company.",
  classic: "Adjacent classics — legendary memos from outside venture.",
};

export const memos: Memo[] = [
  // ── Bessemer Venture Partners — official memo library ──
  { company: "Shopify", firm: "Bessemer Venture Partners", stage: "Series A", year: 2010, kind: "memo", href: "https://www.bvp.com/memos/shopify", note: "The memo behind one of the greatest returns in SaaS history.", featured: true },
  { company: "LinkedIn", firm: "Bessemer Venture Partners", stage: "Series C", year: 2007, kind: "memo", href: "https://www.bvp.com/memos/linkedin", featured: true },
  { company: "Pinterest", firm: "Bessemer Venture Partners", stage: "Series A", year: 2011, kind: "memo", href: "https://www.bvp.com/memos/pinterest", featured: true },
  { company: "Twilio", firm: "Bessemer Venture Partners", stage: "Seed", year: 2009, kind: "memo", href: "https://www.bvp.com/memos/twilio" },
  { company: "Twitch", firm: "Bessemer Venture Partners", stage: "Series B", kind: "memo", href: "https://www.bvp.com/memos/twitch", featured: true },
  { company: "Auth0", firm: "Bessemer Venture Partners", stage: "Seed", year: 2014, kind: "memo", href: "https://www.bvp.com/memos/auth0" },
  { company: "Wix", firm: "Bessemer Venture Partners", stage: "Seed", kind: "memo", href: "https://www.bvp.com/memos/wix" },
  { company: "Yelp", firm: "Bessemer Venture Partners", stage: "Series B", year: 2005, kind: "memo", href: "https://www.bvp.com/memos/yelp" },
  { company: "Dropcam", firm: "Bessemer Venture Partners", stage: "Series A", kind: "memo", href: "https://www.bvp.com/memos/dropcam" },
  { company: "Rocket Lab", firm: "Bessemer Venture Partners", stage: "Series B", kind: "memo", href: "https://www.bvp.com/memos/rocket-lab" },
  { company: "Fiverr", firm: "Bessemer Venture Partners", stage: "Series A", kind: "memo", href: "https://www.bvp.com/memos/fiverr" },
  { company: "PagerDuty", firm: "Bessemer Venture Partners", stage: "Series B", kind: "memo", href: "https://www.bvp.com/memos/pagerduty" },
  { company: "SendGrid", firm: "Bessemer Venture Partners", stage: "Series B", kind: "memo", href: "https://www.bvp.com/memos/sendgrid" },
  { company: "Velo3D", firm: "Bessemer Venture Partners", stage: "Series A", kind: "memo", href: "https://www.bvp.com/memos/velo3d" },
  { company: "LifeLock", firm: "Bessemer Venture Partners", stage: "Series A", kind: "memo", href: "https://www.bvp.com/memos/lifelock" },
  { company: "Mindbody", firm: "Bessemer Venture Partners", stage: "Series B", kind: "memo", href: "https://www.bvp.com/memos/mindbody" },
  { company: "Toast", firm: "Bessemer Venture Partners", kind: "memo", href: "https://www.bvp.com/memos/toast" },
  { company: "ServiceTitan", firm: "Bessemer Venture Partners", kind: "memo", href: "https://www.bvp.com/memos/servicetitan" },
  { company: "Medi Assist", firm: "Bessemer Venture Partners", kind: "memo", href: "https://www.bvp.com/memos/medi-assist" },
  { company: "Periscope Data", firm: "Bessemer Venture Partners", stage: "Seed", kind: "memo", href: "https://www.alexanderjarvis.com/periscope-venture-capital-investment-memo-from-bessemer/" },
  { company: "Spire", firm: "Bessemer Venture Partners", stage: "Series B", kind: "memo", href: "https://www.alexanderjarvis.com/spire-investment-memo-from-bessemer-venture-partners/" },
  { company: "Bright Health", firm: "Bessemer Venture Partners", stage: "Series A", year: 2016, kind: "memo", href: "https://www.alexanderjarvis.com/bright-health-venture-capital-investment-memo-from-bessemer-venture-partners/" },

  // ── Legendary one-offs ──
  { company: "YouTube", firm: "Sequoia Capital", stage: "Seed", year: 2005, kind: "memo", href: "https://www.alexanderjarvis.com/the-confidential-youtube-investment-memo-by-sequoia-you-were-never-meant-to-see/", note: "Roelof Botha's memo, surfaced in the Viacom v. Google lawsuit.", featured: true },
  { company: "DoorDash", firm: "Sequoia Capital", stage: "Series A", year: 2014, kind: "memo", href: "https://www.alexanderjarvis.com/doordash-venture-capital-investment-memo/", featured: true },
  { company: "Snap", firm: "Lightspeed", stage: "Seed", year: 2012, kind: "memo", href: "https://www.alexanderjarvis.com/snapchat-venture-capital-investment-memo/", note: "Jeremy Liew's seed memo on a disappearing-photos app.", featured: true },
  { company: "Roblox", firm: "Greylock", stage: "Growth", kind: "memo", href: "https://www.alexanderjarvis.com/roblox-venture-capital-investment-memo-by-greylock/" },
  { company: "Ramp", firm: "Redpoint", stage: "Series C", kind: "memo", href: "https://www.alexanderjarvis.com/ramp-venture-capital-investment-memo/" },
  { company: "FTX", firm: "Race Capital", stage: "Seed", year: 2019, kind: "memo", href: "https://www.alexanderjarvis.com/ftx-venture-capital-investment-memo/", note: "A memo that reads very differently in hindsight." },
  { company: "Zoox", firm: "Blackbird", stage: "Seed", year: 2014, kind: "memo", href: "https://www.blackbird.vc/blog/zoox-memory-lane", featured: true },
  { company: "LinkedIn", firm: "Intel Capital", stage: "Series D", year: 2007, kind: "memo", href: "https://www.alexanderjarvis.com/intel-capital-venture-capital-investment-memo-for-linkedin/" },
  { company: "DogVacay", firm: "Benchmark", stage: "Series A", kind: "memo", href: "https://www.alexanderjarvis.com/dogvacay-venture-capital-investment-comments-by-benchmark/" },
  { company: "ON24", firm: "Canaan", stage: "Series A", year: 1999, kind: "memo", href: "https://www.alexanderjarvis.com/on24-venture-capital-investment-memo-by-canaan/" },
  { company: "OpenSea", firm: "1confirmation", stage: "Seed", kind: "memo", href: "https://www.alexanderjarvis.com/opensea-venture-capital-investment-memo-by-1confirmation/" },
  { company: "dYdX", firm: "1confirmation", stage: "Seed", kind: "memo", href: "https://www.alexanderjarvis.com/dydx-venture-capital-investment-memo/" },
  { company: "Nexus Mutual", firm: "1confirmation", stage: "Seed", kind: "memo", href: "https://www.alexanderjarvis.com/nexus-mutual-venture-capital-investment-memo/" },
  { company: "SuperRare", firm: "1confirmation", stage: "Seed", kind: "memo", href: "https://www.alexanderjarvis.com/superrare-venture-capital-investment-memo/" },
  { company: "Dukaan", firm: "Weekend Fund", stage: "Seed", year: 2020, kind: "memo", href: "https://www.weekend.fund/how-we-write-lp-updates-at-weekend-fund", note: "Weekend Fund's actual LP memo, shared with the founder's permission." },

  // ── Root Ventures — memos published on GitHub ──
  { company: "Zed", firm: "Root Ventures", stage: "Seed", kind: "memo", href: "https://github.com/rootvc/investment-memos/blob/main/zed.md", note: "Root publishes real deal memos in a public GitHub repo.", featured: true },
  { company: "Esper", firm: "Root Ventures", stage: "Seed", kind: "memo", href: "https://github.com/rootvc/investment-memos/blob/main/esper.md" },
  { company: "Meroxa", firm: "Root Ventures", stage: "Seed", year: 2020, kind: "memo", href: "https://github.com/rootvc/investment-memos/blob/main/meroxa.md" },
  { company: "Okteto", firm: "Root Ventures", stage: "Seed", kind: "memo", href: "https://github.com/rootvc/investment-memos/blob/main/okteto.md" },
  { company: "Privacy Dynamics", firm: "Root Ventures", stage: "Seed", kind: "memo", href: "https://github.com/rootvc/investment-memos/blob/main/privacy_dynamics.md" },
  { company: "Superconductive (Great Expectations)", firm: "Root Ventures", stage: "Seed", year: 2019, kind: "memo", href: "https://github.com/rootvc/investment-memos/blob/main/superconductive.md" },
  { company: "Daily", firm: "Root Ventures", stage: "Seed", kind: "memo", href: "https://github.com/rootvc/investment-memos/blob/main/daily.md" },

  // ── Union Square Ventures — investment announcements ──
  { company: "Coinbase", firm: "Union Square Ventures", stage: "Series A", year: 2013, kind: "notes", href: "https://www.usv.com/writing/2013/05/coinbase/", note: "Fred Wilson's write-up of USV's Series A in Coinbase.", featured: true },
  { company: "Twitter", firm: "Union Square Ventures", stage: "Series A", year: 2007, kind: "notes", href: "https://www.usv.com/writing/2007/07/twitter/", featured: true },
  { company: "Foursquare", firm: "Union Square Ventures", stage: "Series A", year: 2009, kind: "notes", href: "https://www.usv.com/writing/2009/09/foursquare/" },

  // ── Andreessen Horowitz ──
  { company: "GitHub", firm: "Andreessen Horowitz", stage: "Series A", year: 2012, kind: "notes", href: "https://a16z.com/announcement/github/", note: "Peter Levine on a16z's $100M Series A — then their largest check ever.", featured: true },

  // ── Greylock — "Our Investment in ..." ──
  { company: "Discord", firm: "Greylock", stage: "Series A", kind: "notes", href: "https://greylock.com/portfolio-news/our-investment-in-discord/", featured: true },
  { company: "Abnormal AI", firm: "Greylock", stage: "Series A", kind: "notes", href: "https://greylock.com/portfolio-news/our-investment-in-abnormal-security/" },
  { company: "Cato Networks", firm: "Greylock", kind: "notes", href: "https://greylock.com/portfolio-news/our-investment-in-cato-networks/" },
  { company: "Innovium", firm: "Greylock", stage: "Series B", kind: "notes", href: "https://greylock.com/portfolio-news/our-investment-in-innovium-next-generation-cloud-data-center-networks/" },

  // ── Sequoia — "Partnering with ..." ──
  { company: "Zed", firm: "Sequoia Capital", stage: "Series B", year: 2025, kind: "notes", href: "https://sequoiacap.com/article/partnering-with-zed-the-ai-powered-code-editor-built-from-scratch/" },
  { company: "Traversal", firm: "Sequoia Capital", stage: "Seed", year: 2025, kind: "notes", href: "https://sequoiacap.com/article/partnering-with-traversal-because-every-engineer-remembers-their-first-time-troubleshooting/" },
  { company: "Serval", firm: "Sequoia Capital", stage: "Series B", year: 2026, kind: "notes", href: "https://sequoiacap.com/article/partnering-with-serval-empowering-it-for-ai-enterprise-automation/" },
  { company: "Eon", firm: "Sequoia Capital", stage: "Seed", year: 2024, kind: "notes", href: "https://sequoiacap.com/article/partnering-with-eon-cloud-backup-reinvented/" },
  { company: "Listen Labs", firm: "Sequoia Capital", year: 2025, kind: "notes", href: "https://sequoiacap.com/article/partnering-with-listen-labs-next-level-customer-obsession/" },
  { company: "nsave", firm: "Sequoia Capital", stage: "Seed", year: 2024, kind: "notes", href: "https://sequoiacap.com/article/partnering-with-nsave-trusted-accounts-for-everyone/" },
  { company: "Probook", firm: "Sequoia Capital", stage: "Series A", year: 2026, kind: "notes", href: "https://sequoiacap.com/article/partnering-with-probook-ai-for-the-trades/" },

  // ── Blackbird — "Investment Notes" ──
  { company: "Baseten", firm: "Blackbird", stage: "Series E", kind: "notes", href: "https://www.blackbird.vc/blog/investment-notes-baseten-series-e" },
  { company: "Halter", firm: "Blackbird", stage: "Series C", kind: "notes", href: "https://www.blackbird.vc/blog/investment-notes-halters-series-c" },
  { company: "Halter", firm: "Blackbird", stage: "Series D", kind: "notes", href: "https://www.blackbird.vc/blog/investment-notes-halter-series-d" },
  { company: "Halter", firm: "Blackbird", stage: "Series E", kind: "notes", href: "https://www.blackbird.vc/blog/investment-notes-halter-series-e" },
  { company: "Gilmour Space", firm: "Blackbird", stage: "Series E", kind: "notes", href: "https://www.blackbird.vc/blog/investment-notes-gilmour-space-series-e" },
  { company: "Heidi Health", firm: "Blackbird", stage: "Series B", kind: "notes", href: "https://www.blackbird.vc/blog/investment-notes-heidi-health-series-b" },
  { company: "Tracksuit", firm: "Blackbird", kind: "notes", href: "https://www.blackbird.vc/blog/title-investment-notes-tracksuit" },
  { company: "Ivo", firm: "Blackbird", stage: "Series B", kind: "notes", href: "https://www.blackbird.vc/blog/investment-notes-ivo-series-b" },
  { company: "Lorikeet", firm: "Blackbird", kind: "notes", href: "https://www.blackbird.vc/blog/investment-notes-lorikeet" },
  { company: "Marqo", firm: "Blackbird", kind: "notes", href: "https://www.blackbird.vc/blog/investment-notes-marqo-2" },
  { company: "Kinde", firm: "Blackbird", kind: "notes", href: "https://www.blackbird.vc/blog/spotlight-on-ross-chaldecott-kinde" },
  { company: "Superstat", firm: "Blackbird", kind: "notes", href: "https://www.blackbird.vc/blog/why-we-fell-for-the-founders-building-sports-data-layer-our-investment-in-superstat" },
  { company: "NextWork", firm: "Blackbird", kind: "notes", href: "https://www.blackbird.vc/blog/investment-notes-nextwork" },
  { company: "Adora", firm: "Blackbird", stage: "Seed", kind: "notes", href: "https://www.blackbird.vc/blog/investment-notes-adora-seed" },
  { company: "Elyos Energy", firm: "Blackbird", kind: "notes", href: "https://www.blackbird.vc/blog/investment-notes-elyos" },
  { company: "Coherence Neuro", firm: "Blackbird", kind: "notes", href: "https://www.blackbird.vc/blog/investment-notes-coherence-neuro" },
  { company: "Wonder Studios", firm: "Blackbird", kind: "notes", href: "https://www.blackbird.vc/blog/investment-notes-wonder-studios" },
  { company: "Remedy Robotics", firm: "Blackbird", kind: "notes", href: "https://www.blackbird.vc/blog/investment-notes-remedy-robotics" },
  { company: "Enhance Labs", firm: "Blackbird", stage: "Pre-seed", kind: "notes", href: "https://www.blackbird.vc/blog/investment-notes-enhance-labs-pre-seed" },
  { company: "Alloy", firm: "Blackbird", kind: "notes", href: "https://www.blackbird.vc/blog/investment-notes-alloy" },
  { company: "Marloo", firm: "Blackbird", stage: "Day 0", kind: "notes", href: "https://www.blackbird.vc/blog/investing-at-day-0-of-marloo" },
  { company: "Springboards", firm: "Blackbird", kind: "notes", href: "https://www.blackbird.vc/blog/investment-notes-springboards" },
  { company: "Factor House", firm: "Blackbird", kind: "notes", href: "https://www.blackbird.vc/blog/investment-notes-factor-house" },
  { company: "Index (app)", firm: "Blackbird", kind: "notes", href: "https://www.blackbird.vc/blog/investment-notes-index" },
  { company: "Clutch", firm: "Blackbird", kind: "notes", href: "https://www.blackbird.vc/blog/investment-notes-clutch" },
  { company: "Atticus", firm: "Blackbird", kind: "notes", href: "https://www.blackbird.vc/blog/investment-notes-atticus" },
  { company: "Nomad Atomics", firm: "Blackbird", kind: "notes", href: "https://www.blackbird.vc/blog/investment-notes-nomad-atomics" },
  { company: "Aquila", firm: "Blackbird", kind: "notes", href: "https://www.blackbird.vc/blog/investment-notes-aquila" },
  { company: "One Future Football", firm: "Blackbird", kind: "notes", href: "https://www.blackbird.vc/blog/investment-notes-one-future-football" },
  { company: "Cotiss", firm: "Blackbird", kind: "notes", href: "https://www.blackbird.vc/blog/investment-notes-cotiss" },
  { company: "Sumday", firm: "Blackbird", kind: "notes", href: "https://www.blackbird.vc/blog/investment-notes-sumday" },
  { company: "MoreGoodDays", firm: "Blackbird", kind: "notes", href: "https://www.blackbird.vc/blog/investment-notes-moregooddays" },
  { company: "Syenta", firm: "Blackbird", kind: "notes", href: "https://www.blackbird.vc/blog/investment-notes-syenta" },
  { company: "Kiki", firm: "Blackbird", kind: "notes", href: "https://www.blackbird.vc/blog/investment-notes-kiki" },
  { company: "Carepatron", firm: "Blackbird", kind: "notes", href: "https://www.blackbird.vc/blog/investment-notes-carepatron-2" },
  { company: "Clove", firm: "Blackbird", kind: "notes", href: "https://www.blackbird.vc/blog/investment-notes-clove" },
  { company: "Wonder", firm: "Blackbird", kind: "notes", href: "https://www.blackbird.vc/blog/investment-notes-wonder" },

  // ── Theses ──
  { company: "Solana", firm: "Multicoin Capital", year: 2025, kind: "thesis", href: "https://multicoin.capital/2025/01/22/the-solana-thesis-internet-capital-markets/", note: "Multicoin has backed Solana since its 2018 seed round.", featured: true },
  { company: "Helium", firm: "Multicoin Capital", stage: "Series C", year: 2019, kind: "thesis", href: "https://multicoin.capital/2019/06/12/helium-series-c/" },
  { company: "Hyperliquid", firm: "Multicoin Capital", year: 2026, kind: "thesis", href: "https://multicoin.capital/2026/06/25/hyperliquid-hype-analysis-and-valuation/" },
  { company: "USV Thesis 3.0", firm: "Union Square Ventures", year: 2018, kind: "thesis", href: "https://www.usv.com/writing/2018/04/usv-thesis-3-0/", note: "Not a single company — the fund-level thesis behind USV's portfolio." },

  // ── Adjacent classics ──
  { company: "GEICO", firm: "Warren Buffett", year: 1976, kind: "classic", href: "https://greatmemos.com/memos/buffett-geico.pdf", note: "“The Security I Like Best” lineage — Buffett's GEICO memo." },
  { company: "See's Candies", firm: "Warren Buffett", kind: "classic", href: "https://greatmemos.com/memos/buffett-sees.pdf" },
  { company: "The Superinvestors of Graham-and-Doddsville", firm: "Warren Buffett", year: 1984, kind: "classic", href: "https://greatmemos.com/memos/buffett-superinvestors.pdf" },
  { company: "Madoff: The World's Largest Hedge Fund is a Fraud", firm: "Harry Markopolos", year: 2005, kind: "classic", href: "https://greatmemos.com/memos/markopolos-madoff-fraud.pdf", note: "The memo the SEC ignored." },
  { company: "Washington Post Pension Fund", firm: "Warren Buffett", kind: "classic", href: "https://greatmemos.com/memos/buffett-pensions.pdf" },
];
