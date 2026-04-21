## Plan: Replace Right-Side Ranking Bars

Replace the 4 right-side bars on clinic/practitioner pages by introducing new ranking pillars (Clinic Visibility, Pricing Transparency, Safety and Trust, Overall Aggregation), fed by a new structured dataset generated from clinic evidence and mapped to existing `weighted_analysis` plumbing. Keep UI changes minimal in `Stats` while moving most logic into data-generation and label mapping to avoid regressions.

**Steps**
1. Define scoring contract and label mapping for the new pillars: `Clinic Visibility`, `Pricing Transparency`, `Safety and Trust`, `Overall Aggregation`; plus separate `Ranking` display (`x/100 in CityName`) below bars. This blocks all other steps.
2. Add/update dataset schema for source evidence per clinic and city-comparative metrics (presence/absence + numeric where possible), including the 5 sub-pillars for A/B/C and explicit weight rules. Depends on 1.
3. Build an offline dataset generation workflow (LLM-assisted + deterministic post-processing) that outputs normalized JSON for each clinic and practitioner profile entry, with confidence fields and provenance snippets. Depends on 2.
4. Update base labels in `boxplotDatas_clinic` to the new pillar names so existing `mergeBoxplotDataFromDict` continues to work by label lookup. Depends on 1 and can run in parallel with 3 once labels are frozen.
5. Update `src/components/visx-donut.tsx` category colors and filter list (currently named `skip`) to use the new 4 labels; keep percentage calculation unchanged unless score scale changes. Depends on 4.
6. Add `Ranking` line rendering near `Stats` in both page templates (`clinic` and `practitioner`) using city-aware value from the new dataset. Depends on 3.
7. Backfill data for initial clinics (including 152 Harley Street Clinic as pilot), validate key matches with existing `weighted_analysis` merge behavior, and handle missing data fallback. Depends on 3, 5, 6.
8. Verify with lint/tests and manual spot checks across clinic and practitioner pages in at least 2 cities; confirm bars render with new labels and ranking text appears correctly. Depends on 5, 6, 7.

**Relevant files**
- `/home/jasmin/Documents/work/website/doctors_directory/src/components/visx-donut.tsx` — replace old hardcoded labels/colors/filter list for the 4 displayed bars.
- `/home/jasmin/Documents/work/website/doctors_directory/src/lib/data.ts` — update `boxplotDatas_clinic` label names used by merge lookup.
- `/home/jasmin/Documents/work/website/doctors_directory/src/app/clinics/[cityslug]/clinic/[slug]/page.tsx` — currently merges `weighted_analysis` by label and renders `Stats`; add ranking text.
- `/home/jasmin/Documents/work/website/doctors_directory/src/app/practitioners/[cityslug]/profile/[slug]/page.tsx` — same pattern as clinic page; add ranking text.
- `/home/jasmin/Documents/work/website/doctors_directory/public/clinics_processed_new_data.json` — target place for clinic-level generated scoring fields (or source from a new derived file).
- `/home/jasmin/Documents/work/website/doctors_directory/public/derms_processed_new_5403.json` — practitioner entries currently supply `weighted_analysis`; extend/align with new pillars.

**Verification**
1. Run `npm run lint` and fix any type/ESLint issues.
2. Run targeted page tests that cover clinic/practitioner profile rendering; if no direct tests exist, run `npm run test` and capture any regressions.
3. Manually open one clinic and one practitioner page: verify four bars show new pillar labels and percentages.
4. Validate ranking subtitle format as `x/100 in {CityName}` and confirm city value is correct for each profile.
5. Spot-check at least 5 records for key alignment: dataset keys must exactly match `label` strings used in base boxplot data.

**Decisions**
- Included scope: rename/replace right-side 4 bars, wire new ranking text, and define data model required to support new pillars.
- Included scope: preserve current visual style and percentage math for minimum UI risk.
- Excluded scope: redesigning the entire profile layout or changing unrelated review-analysis components.
- Assumption: `weighted_analysis` remains the bridge object keyed by label; changing this would require broader refactor.

**Further Considerations**
1. Additional ranking inputs to make analysis comprehensive: review velocity/recency trend, cancellation/refund policy clarity, response-to-negative-review quality, complaint-resolution evidence, before/after evidence quality, practitioner tenure stability, treatment risk disclosure quality.
2. City normalization strategy: Option A percentile rank within city, Option B z-score normalized by city sample size, Option C hybrid percentile + confidence penalty for low evidence volume.
3. Confidence scoring: include evidence count and source reliability so low-data clinics are not over-ranked.

**Dataset Template (for generation)**
- Top-level object per clinic should include: `clinic_id`, `clinic_name`, `city`, `analysis_date`, `sources`, `weighted_analysis`, `ranking`, `criteria_breakdown`, `advice`.
- `weighted_analysis` must keep existing app contract keys exactly:
- `Clinic Visibility`, `Pricing Transparency`, `Safety and Trust`, `Overall Aggregation`.
- Each weighted item should include existing item meta shape: `weighted_score`, `confidence`, `num_mentions`, `top_sentence`.
- `ranking` should include: `city_rank`, `city_total`, `score_out_of_100`, `subtitle_text` (format: `Rank {city_rank}/{city_total} in {city}`).
- `criteria_breakdown` should include per pillar 5 checks with boolean, score contribution, evidence snippets, and source URL.
- `advice` should include: `strengths`, `gaps`, `priority_actions_30d`, `priority_actions_90d`.

**Seed Example (single clinic record)**
- `clinic_id`: `152-harley-street-clinic`
- `clinic_name`: `152 Harley Street Clinic`
- `city`: `London`
- `analysis_date`: `2026-03-10`
- `weighted_analysis`:
- `Clinic Visibility`: `weighted_score` 82, `confidence` 0.86, `num_mentions` 14, `top_sentence` includes social presence and map listing evidence.
- `Pricing Transparency`: `weighted_score` 74, `confidence` 0.79, `num_mentions` 12, `top_sentence` includes price list and consultation policy evidence.
- `Safety and Trust`: `weighted_score` 88, `confidence` 0.84, `num_mentions` 16, `top_sentence` includes accreditation and adverse review handling evidence.
- `Overall Aggregation`: `weighted_score` 81, `confidence` 0.83, `num_mentions` 42, `top_sentence` includes combined summary rationale.
- `ranking`: `city_rank` 12, `city_total` 97, `score_out_of_100` 81, `subtitle_text` `81/100 in London`.
- `criteria_breakdown.Clinic Visibility`: include 5 checks for social presence, online booking/payment, practitioner credentials transparency, GBP with directions, multiple branches.
- `criteria_breakdown.Pricing Transparency`: include 5 checks for transparent pricing, treatment variety, aftercare, free consultation/telehealth, competitive pricing.
- `criteria_breakdown.Safety and Trust`: include 5 checks for accreditations/awards, location aesthetics, adverse reviews, plus your chosen extra checks (complaint resolution and risk disclosure).
- `advice`: 3 strengths + 3 gaps + 30/90 day actions tied to failed or weak checks.
