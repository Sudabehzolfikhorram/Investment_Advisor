# Product

<!-- impeccable:product-schema 1 -->

> Written from the person's briefs across twenty feedback rounds and the project memory, not from a fresh interview. Every fact below was stated or approved by the person in those rounds; nothing here is a new assumption.

## Platform

web (desktop only; mobile is out of scope by the person's decision)

## Users

Iranian individuals and organisations who have something to bring to a development project: cash to invest (from a few million toman in a fund to hundreds of billions in a partnership), execution capacity (contractors, operators), a need for property (buyers, lessees), a wish to restore heritage or fund a social project, or a plan of their own that needs finance. They arrive unsure which of many routes fits them, and they want to see matching projects quickly without filling a long form or registering.

## Product Purpose

سرمایه‌گزین is an investment advisor. The visitor states a goal, a budget and a few conditions, and the site shows matching projects with a match percentage, explains mismatches and unknowns, and shows the next step (contract model, money source, how returns are received). Success is a visitor who reaches a short, explained list of projects that fit them and knows how to enter one.

## Positioning

One starting point for many routes of value creation: investment and partnership, funds, contracting, buying, leasing, heritage restoration, social and charity projects, operation, plus land preparation, foreign investment and plan introduction as standalone flows. Matching is explained, never a black box: an unknown number is never turned into zero.

## Operating Context

Visitors compare several projects before deciding; they save projects and conditions and come back later. Project details are read like a dossier (شناسنامه فرصت). An expert's name and mobile are shown openly, or a downloadable guide when there is no expert. The site will later connect to Bazafarini (شرکت بازآفرینی شهری ایران).

## Capabilities and Constraints

- Pages: landing, projects (results with filters beside them), project detail, compare, assistant, saved, guide/tools.
- Flow: basic info first, then suggested projects; optional fields live in an advanced filter beside results.
- Open site; simple login only when saving a project or saved conditions.
- Assistant is a prompt-based demo on sample data, up to ten projects per answer, each with a match percentage.
- The reference HTML («ALGONET_Investment_Advisor_Demo 13.html») is the source of information architecture, fields, processes and flows. No field, process or data may be dropped and none may be invented; they may be shortened, merged or improved.
- Stack: Next.js (static export to GitHub Pages), Tailwind, shadcn components only, Iconsax icons, Vazirmatn.

## Brand Commitments

- Name «سرمایه‌گزین». Persian, right to left. Light mode.
- Primary #0F766E for main actions. A cobalt secondary carries selection, focus, data and accent.
- The Algonet identity pattern (nodes, lines, dots; faint, fragmented, masked) and the NodeMark (dot, wave, A, line, ring) before section titles.
- Real photographs with one consistent dark grey treatment. No gold. Orange only for warnings.
- Text charcoal #2F3533.

## Evidence on Hand

- Sample projects in `src/data/opportunities.ts` (sample data, labelled as such; not real offers).
- Photos in `public/images` (hero, provinces, project types) with credits in `src/data/photo-credits.ts`.
- No real customers, testimonials, returns or partner logos exist; none may be shown.

## Product Principles

1. Start from the visitor's goal, not from a catalogue.
2. Explain every match: what fits, what does not, what is unknown.
3. Fewest clicks: short choices and ranges before any typing.
4. Keep every route visible; a visitor who is not an investor still finds their way.
5. Honest by default: sample data is labelled, nothing is promised.
