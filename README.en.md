<p align="center"><img src="docs/img/cover.png" alt="Biznes-navyki — AI skills for Russian business" width="100%"></p>

<p align="center">
<a href="https://github.com/kozhevnikovai/biznes-navyki/releases"><img src="https://img.shields.io/github/v/release/kozhevnikovai/biznes-navyki?color=161616" alt="Release"></a>
<a href="https://github.com/kozhevnikovai/biznes-navyki/actions/workflows/validate.yml"><img src="https://img.shields.io/github/actions/workflow/status/kozhevnikovai/biznes-navyki/validate.yml?label=validate&color=161616" alt="Validate"></a>
<a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-161616" alt="MIT"></a>
<a href="README.md"><img src="https://img.shields.io/badge/lang-Русский-FF5A1F" alt="Русский"></a>
</p>

# Biznes-navyki — AI skills for business in Russia

**No. 001** · Ready-made Agent Skills for Claude, Codex and other AI agents that handle the everyday work of Russian-speaking businesses: sales proposals, replies to reviews, Ozon and Wildberries product cards, hh.ru job postings, sales call scripts and SOPs.

- **Free and open source** — MIT license.
- **Built for the Russian market** — Yandex Maps, 2GIS, Ozon, Wildberries, hh.ru; respects Russian advertising (38-FZ), personal data (152-FZ) and labor law.
- **Tested** — 30 eval cases for quality, rule compliance and prompt-injection resistance, run in GitHub Actions.
- **No made-up facts** — prices, case studies and specs are never invented; gaps are marked `[уточнить]` ("to clarify").

The skills work in Russian: instructions, triggers and outputs are in Russian, because that is where they are used.

## Skills

| Skill | What it does | Example |
|---|---|---|
| [commercial-proposal](skills/commercial-proposal/SKILL.md) | Sales proposal from a short brief | [view](skills/commercial-proposal/references/example.md) |
| [review-reply](skills/review-reply/SKILL.md) | Replies to reviews on Yandex Maps, 2GIS, Ozon, WB | [view](skills/review-reply/references/example.md) |
| [marketplace-card](skills/marketplace-card/SKILL.md) | Product card for Ozon, WB, Yandex Market | [view](skills/marketplace-card/references/example.md) |
| [hh-vacancy](skills/hh-vacancy/SKILL.md) | Job posting for hh.ru plus interview questions | [view](skills/hh-vacancy/references/example.md) |
| [cold-outreach](skills/cold-outreach/SKILL.md) | Personalized first message and follow-ups | [view](skills/cold-outreach/references/example.md) |
| [meeting-to-tasks](skills/meeting-to-tasks/SKILL.md) | Meeting transcript → minutes and tasks | [view](skills/meeting-to-tasks/references/example.md) |
| [sop-builder](skills/sop-builder/SKILL.md) | Standard operating procedure for staff | [view](skills/sop-builder/references/example.md) |
| [call-script](skills/call-script/SKILL.md) | Call script with objection handling | [view](skills/call-script/references/example.md) |
| [social-post](skills/social-post/SKILL.md) | Posts for Telegram, VK, Dzen and a content plan | [view](skills/social-post/references/example.md) |
| [deal-next-step](skills/deal-next-step/SKILL.md) | Client chat analysis → next best step | [view](skills/deal-next-step/references/example.md) |

## Install

**Claude Code:**

```bash
git clone https://github.com/kozhevnikovai/biznes-navyki.git && bash biznes-navyki/scripts/install.sh
```

**Claude apps** — download a skill ZIP from [Releases](https://github.com/kozhevnikovai/biznes-navyki/releases) and upload it in the Skills section of Claude settings.

**Other agents** — the skills follow the open Agent Skills format (a folder with `SKILL.md`); copy the folders from `skills/` into your agent's skills directory.

## Quality

- `scripts/validate.py` checks every skill's structure in CI.
- `evals/` — 20 [promptfoo](https://www.promptfoo.dev/) test cases: `npx promptfoo@latest eval -c evals/promptfooconfig.yaml` (in GitHub Actions they run on GitHub Models with the built-in `GITHUB_TOKEN`, no API key needed).

References to laws are guidance, **not legal advice**. Always review the output before sending it to a client.

## Author

**Egor Kozhevnikov** — AI implementation for business and open-source tools for it. GitHub: [@kozhevnikovai](https://github.com/kozhevnikovai)

License: [MIT](LICENSE).
