# GradBound

> **A decision engine for Master's applicants — not just another ranking list.**

GradBound turns a fragmented grad-school search into one guided flow: build a single academic profile, see which of 265+ Master's programs across 20 countries you realistically match, understand exactly why you got that verdict, and compare the trade-offs (cost, visa runway, career outcomes) before you spend a single application fee.

*Built solo for the GDC RIT Dubai × +TWE DesignAthon 2026.*

---

## 🔗 Project Links

* **Live Demo:** [https://gradbound-lake.vercel.app](https://gradbound-lake.vercel.app)
* **GitHub Repository:** [https://github.com/VihaanGharawala/GradBound.git](https://github.com/VihaanGharawala/GradBound.git)

---

## 🎯 The Problem

Admission requirements live scattered across dozens of university pages. Students end up with a spreadsheet of schools and no consistent way to judge which are realistic **Safety**, **Target**, or **Reach** choices — and GPA, tests, work experience, and research rarely get translated into one understandable signal until it's too late to act on it.

---

## ✨ What It Does

* **Profile Diagnostic:** A 4-step wizard (academics, standardized tests, experience, and target preferences with priority sliders) that builds one reusable profile instead of re-entering information on every portal.
* **Admissions Radar:** An interactive scatter plot plus tiered lists (Safety / Target / Reach / Unlikely) showing only the programs that actually offer your chosen major, ranked by a transparent decision score.
* **Match Explanations:** Every score comes with the specific reasons behind it and the gaps holding it back — no black-box mystery.
* **Improvement Simulator:** Models how a stronger test score, more work experience, a wider budget, or an added certification would shift your matches so you know what's actually worth improving.
* **Visa & ROI Matrix:** Filters and ranks programs by post-study visa runway, living cost, and a 3-year net financial estimate.
* **Compare Tray:** Shortlist up to three finalists and compare tuition, living cost, visa runway, and salary signals side-by-side.
* **University Search & Detail:** Browse the full dataset directly or drill into one program for its full admissions breakdown and 3-year financial outlook.

> *Note: Every score is a directional estimate from the included dataset, not a guarantee — the app is upfront about that on every results page.*

---

## 🛠️ Tech Stack

* **Frontend:** React, Vite, Tailwind CSS, shadcn/ui (Radix primitives), Framer Motion, React Router
* **Backend & Auth Tooling:** Base44 (Deployment, API, and local development CLI)

---

## 💻 Local Development (Base44)

Use this repository to run and edit the app locally, then publish changes back through Base44. Any change pushed to the repo will also be reflected in the Base44 Builder.

### Prerequisites

1. Clone the repository:
   ```bash
   git clone [https://github.com/VihaanGharawala/GradBound.git](https://github.com/VihaanGharawala/GradBound.git)
