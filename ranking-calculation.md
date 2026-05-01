# Ranking Calculation

Source of truth: `src/lib/scripts/generate-ranking-dataset.js`

## How the Consentz Score Is Calculated

This section explains the score in plain language without exposing internal
weights.

### What the score is

The Consentz score is a criteria-based quality signal that helps patients
compare clinics and practitioners using the same evidence model.

### What the score is not

It is not paid placement, not an ad ranking, and not a pure sentiment average.

### Inputs we use

We evaluate profile and evidence data from structured records, including:

- Pricing and treatment information
- Reviews and safety/professionalism signals
- Credentials and accreditation evidence
- Profile completeness and discoverability signals

### Scoring framework

The model has three pillars:

- Clinic Visibility
- Pricing Transparency
- Safety and Trust

Each pillar is scored on a normalized `0..100` scale. Overall Aggregation is
the combined score across these pillars.

### How scores are produced

We run deterministic checks (presence checks, count checks, text-pattern checks,
and normalized market-context checks), then:

- Convert check outputs into pillar component scores
- Normalize each pillar to a common `0..100` scale
- Combine pillars into an Overall Aggregation score
- Rank entities within city for local comparison context

### Why this method

The approach is designed for explainability: score direction should map to
observable signals such as pricing clarity, review quality, safety evidence,
and credential transparency.

User-facing summary:
"Consentz Score: based on pricing transparency, patient reviews, clinic or
practitioner credibility, profile completeness, and safety signals."

## Inputs

- Clinics source: `public/clinics_processed_new_data.json`
- Practitioners source: `public/derms_processed_new_5403.json`

## Pillars

- `Clinic Visibility`
- `Pricing Transparency`
- `Safety and Trust`
- `Overall Aggregation`

Each of the first 3 pillars is built from 5 checks.
Each check contributes `0..20` (rounded and clamped).
So each pillar is `0..100`.

## Helper Rules

- `clamp(x, min, max)` means cap value to bounds.
- `hasText(value)` checks non-empty string/array/object.
- `asArray(value)` parses arrays, JSON strings, or object values.
- City fee baseline is the median of per-clinic average fee values in each city.

## Clinic Visibility (0..100)

`visibility = social + onlineBookingPayment + credentials + googleProfile + multipleBranches`

1. `social = min(20, socialsCount * 4)`
- `socialsCount` comes from non-empty:
`facebook, instagram, twitter, youtube, Linkedin, x_twitter`

2. `onlineBookingPayment = (hasOnlineBooking ? 10 : 0) + (hasOnlinePayment ? 10 : 0)`
- `hasOnlineBooking` if website exists OR about text matches `book|appointment|bookings`
- `hasOnlinePayment` if payments text matches `online|card|klarna|clearpay|plim|payment link|apple pay|google pay`

3. `credentials = hasCredentialTransparency ? 20 : 0`
- true if any of:
`isDoctor`, `Practitioners`, `accreditations`, `awards`

4. `googleProfile = hasGoogleProfile ? 20 : 0`
- true if both `url` and `gmapsAddress` exist

5. `multipleBranches = hasMultipleBranches ? 20 : 0`
- true if about text matches:
`multi-location|multiple locations|multiple branch|locations|branches| and also |across`

## Pricing Transparency (0..100)

`pricing = transparentPricing + treatmentVariety + aftercare + consultTelehealth + competitivePricing`

1. `transparentPricing = hasFees ? 20 : 0`
- `hasFees = hasText(Fees)`

2. `treatmentVariety = min(20, treatmentCount * 2)`
- `treatmentCount = asArray(Treatments).length`
- full score when `treatmentCount >= 10`

3. `aftercare = hasAftercare ? 20 : 0`
- true if about text has `aftercare|follow-up|review`
- OR legacy signal exists: `weighted_analysis["Post-Care"].weighted_score > 0`

4. `consultTelehealth = hasFreeConsult ? 20 : 0`
- true if about/fees text matches:
`free consultation|consultation|telehealth|video consultation|virtual`

5. `competitivePricing`
- Compute `feeValue = average numeric price extracted from Fees`
- Compare against `cityFeeMedian`
- Score:
`20` if `feeValue <= cityFeeMedian * 1.1`
`5` if `feeValue` or `cityFeeMedian` missing
`0` otherwise

## Safety and Trust (0..100)

`safety = accreditations + locationAesthetics + adverseReviews + governance + safetyLanguage`

1. `accreditations = hasAccred ? 20 : 0`
- true if any:
`isCQC, isJCCP, isHIW, isHIS, isRQIA, isSaveFace, accreditations, awards`

2. `locationAesthetics = hasAestheticSignal ? 20 : 0`
- true if clinic environment signals exist
- OR about text contains `clean|modern|welcoming|comfortable|luxurious`

3. `adverseReviews = clamp(round((rating / 5) * 12 + max(0, 8 - negativeKeywordsCount)), 0, 20)`
- `negativeKeywordsCount = asArray(reviewAnalysis.negative_keywords).length`

4. `governance = hasGovernanceSignal ? 20 : 0`
- true if `Practitioners` present OR `isDoctor` true

5. `safetyLanguage = hasSafetyLanguage ? 20 : 0`
- true if `reviewAnalysis.professionalism_safety` has at least one item

## Overall Aggregation (0..100)

`overall = round((visibility + pricing + safety) / 3)`

Stored as:
- `weighted_analysis["Overall Aggregation"].weighted_score`

## Confidence

`mentionCount = len(professionalism_safety) + len(treatment_outcomes) + len(clinic_environment) + len(referrals_recommendations)`

`confidence = clamp(0.4 + mentionCount / 200, 0.35, 0.97)`

Stored in each pillar item as `confidence`.

## Clinic Ranking in City

Within each city:
1. Sort clinics by `overall` descending.
2. Assign:
- `city_rank = position + 1`
- `city_total = number of clinics in city`
- `score_out_of_100 = overall`
- `subtitle_text = "{score}/100 in {City}"`

## Practitioner Calculation

Practitioners are derived from associated clinic scores with profile boosts.

1. Resolve associated clinic from `Associated_Clinics[0]`.
2. `baseOverall = clinic.overall || practitioner.overall || 50`
3. `qualificationBoost = has practitioner_qualifications ? 3 : 0`
4. `experienceBoost = has practitioner_experience ? 2 : 0`

Then:
- `overall = clamp(round(baseOverall + qualificationBoost + experienceBoost - 2), 0, 100)`
- `visibility = clamp(round((clinic.visibility || 50) + qualificationBoost - 1), 0, 100)`
- `pricing = clamp(round((clinic.pricing || 50) - 1), 0, 100)`
- `safety = clamp(round((clinic.safety || 50) + experienceBoost), 0, 100)`

Practitioner confidence values are fixed constants in current script:
- Visibility: `0.65`
- Pricing: `0.62`
- Safety: `0.67`
- Overall: `0.66`

Practitioner city ranking is then computed the same way as clinics.

## Outputs

Also written back into source files:
- `public/clinics_processed_new_data.json`
- `public/derms_processed_new_5403.json`
