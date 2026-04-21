-- ============================================================
-- MariaDB Schema — Doctors Directory (Hybrid Approach)
-- Normalized: entities, relationships, queried fields
-- JSON columns: display-only arrays and analytical blobs
-- Requires: MariaDB 10.5+
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'STRICT_ALL_TABLES';

-- ============================================================
-- CITIES
-- ============================================================

CREATE TABLE IF NOT EXISTS cities (
  id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(120) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,

  -- Overview
  population_estimate             VARCHAR(255),
  lifestyle_characteristics       TEXT,
  medical_infrastructure_presence TEXT,

  -- Market Size
  num_clinics               INT UNSIGNED DEFAULT 0,
  review_volume_total       INT UNSIGNED DEFAULT 0,
  average_rating_citywide   DECIMAL(3,2),
  estimated_market_strength TEXT,

  -- Competitor Landscape
  nhs_presence TEXT,

  -- Regulatory Environment
  primary_regulator         TEXT,
  prescribing_requirements  TEXT,
  inspection_framework      TEXT,

  -- Insurance & Financing
  private_insurance_usage       TEXT,
  cosmetic_finance_availability TEXT,

  -- Referral Networks
  teaching_hospital_links TEXT,

  -- Accessibility
  public_transport_proximity    TEXT,
  parking_availability          TEXT,
  city_vs_suburban_distribution TEXT,

  -- Medical Tourism
  tourism_volume_indicator  TEXT,
  hotel_density_near_clinics TEXT,
  airport_proximity         TEXT,
  medical_tourism_viability TEXT,

  -- Beauty Spend
  market_maturity_level TEXT,

  -- JSON: display-only arrays
  specializations     JSON, -- string[]
  peak_booking_periods JSON, -- string[]
  social_media_trends  JSON, -- string[]

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- CLINICS
-- ============================================================

CREATE TABLE IF NOT EXISTS clinics (
  id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug     VARCHAR(255) NOT NULL UNIQUE,
  city_id  INT UNSIGNED,

  -- Identity
  name          VARCHAR(255),
  image         TEXT,
  gmaps_url     TEXT,
  gmaps_address VARCHAR(500),
  gmaps_phone   VARCHAR(200),
  category      VARCHAR(100),

  -- Reputation
  rating       DECIMAL(3,2),
  review_count INT UNSIGNED DEFAULT 0,

  -- About
  about_section  TEXT,
  accreditations TEXT,
  awards         TEXT,
  affiliations   TEXT,

  -- Contact / Social
  website   VARCHAR(500),
  email     VARCHAR(255),
  facebook  VARCHAR(500),
  twitter   VARCHAR(500),
  x_twitter VARCHAR(500),
  instagram VARCHAR(500),
  youtube   VARCHAR(500),
  linkedin  VARCHAR(500),

  -- Regulatory Flags (boolean + optional verification URL)
  is_save_face TINYINT(1) DEFAULT 0,
  is_doctor    TINYINT(1) DEFAULT 0,

  is_jccp  TINYINT(1) DEFAULT 0,
  jccp_url VARCHAR(500),

  is_cqc   TINYINT(1) DEFAULT 0,
  cqc_url  VARCHAR(500),

  is_hiw   TINYINT(1) DEFAULT 0,
  hiw_url  VARCHAR(500),

  is_his   TINYINT(1) DEFAULT 0,
  his_url  VARCHAR(500),

  is_rqia  TINYINT(1) DEFAULT 0,
  rqia_url VARCHAR(500),

  -- JSON: display-only, never used as SQL filters
  insurance_info     JSON, -- string[]
  payment_methods    JSON, -- string[]
  review_analysis    JSON, -- ReviewAnalysis object
  weighted_analysis  JSON, -- { [category]: ItemMeta }
  criteria_breakdown JSON, -- { [category]: CriteriaItem[] }
  advice             JSON, -- { strengths, gaps, priority_30d, priority_90d }

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL,
  INDEX idx_city_id  (city_id),
  INDEX idx_rating   (rating),
  INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- Opening Hours ----------------------------------------

CREATE TABLE IF NOT EXISTS clinic_hours (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  clinic_id  INT UNSIGNED NOT NULL,
  day_of_week ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  hours      VARCHAR(100),

  FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
  UNIQUE KEY uq_clinic_day (clinic_id, day_of_week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- Fee List ---------------------------------------------

CREATE TABLE IF NOT EXISTS clinic_fees (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  clinic_id      INT UNSIGNED NOT NULL,
  treatment_name VARCHAR(255) NOT NULL,
  price          VARCHAR(500),

  FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
  INDEX idx_clinic_id (clinic_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- Google Maps Reviews ----------------------------------

CREATE TABLE IF NOT EXISTS clinic_reviews (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  clinic_id      INT UNSIGNED NOT NULL,
  reviewer_name  VARCHAR(255),
  rating         DECIMAL(2,1),
  review_date    VARCHAR(100),
  review_text    TEXT,
  owner_response TEXT,

  FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
  INDEX idx_clinic_id (clinic_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- Rankings ---------------------------------------------

CREATE TABLE IF NOT EXISTS clinic_rankings (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  clinic_id       INT UNSIGNED NOT NULL UNIQUE,
  city_rank       SMALLINT UNSIGNED,
  city_total      SMALLINT UNSIGNED,
  score_out_of_100 TINYINT UNSIGNED,
  subtitle_text   VARCHAR(255),

  FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- Clinic Staff (inline Practitioners[] per clinic) ----

CREATE TABLE IF NOT EXISTS clinic_staff (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  clinic_id       INT UNSIGNED NOT NULL,
  full_name       VARCHAR(255),
  title           TEXT,
  specialty       TEXT,
  linkedin_url    VARCHAR(500),
  profile_url     TEXT,
  practitioner_id INT UNSIGNED NULL, -- FK set when resolved to a practitioners row

  FOREIGN KEY (clinic_id)       REFERENCES clinics(id)       ON DELETE CASCADE,
  FOREIGN KEY (practitioner_id) REFERENCES practitioners(id) ON DELETE SET NULL,
  INDEX idx_clinic_id (clinic_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TREATMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS treatments (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug        VARCHAR(255) NOT NULL UNIQUE,
  name        VARCHAR(255) NOT NULL,
  description TEXT,

  -- JSON: display-only goal list
  goals JSON, -- string[]

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- Clinic ↔ Treatment (many-to-many) -------------------

CREATE TABLE IF NOT EXISTS clinic_treatments (
  clinic_id    INT UNSIGNED NOT NULL,
  treatment_id INT UNSIGNED NOT NULL,

  PRIMARY KEY (clinic_id, treatment_id),
  FOREIGN KEY (clinic_id)    REFERENCES clinics(id)    ON DELETE CASCADE,
  FOREIGN KEY (treatment_id) REFERENCES treatments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- PRACTITIONERS
-- ============================================================

CREATE TABLE IF NOT EXISTS practitioners (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug         VARCHAR(255) NOT NULL UNIQUE,
  display_name TEXT,
  title        TEXT,
  specialty    VARCHAR(255),
  image_url    TEXT,

  -- JSON: profile display arrays, never used as SQL filters
  qualifications   JSON, -- string[]
  roles            JSON, -- string[]
  awards           JSON, -- string[]
  media            JSON, -- string[]
  experience       JSON, -- string[]
  weighted_analysis JSON, -- { [category]: ItemMeta }

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_display_name (display_name),
  INDEX idx_specialty    (specialty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- Practitioner Rankings --------------------------------

CREATE TABLE IF NOT EXISTS practitioner_rankings (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  practitioner_id  INT UNSIGNED NOT NULL UNIQUE,
  city_rank        SMALLINT UNSIGNED,
  city_total       SMALLINT UNSIGNED,
  score_out_of_100 TINYINT UNSIGNED,
  subtitle_text    VARCHAR(255),

  FOREIGN KEY (practitioner_id) REFERENCES practitioners(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- Practitioner ↔ Clinic (from Associated_Clinics) -----

CREATE TABLE IF NOT EXISTS practitioner_clinic_associations (
  practitioner_id INT UNSIGNED NOT NULL,
  clinic_id       INT UNSIGNED NOT NULL,

  PRIMARY KEY (practitioner_id, clinic_id),
  FOREIGN KEY (practitioner_id) REFERENCES practitioners(id) ON DELETE CASCADE,
  FOREIGN KEY (clinic_id)       REFERENCES clinics(id)       ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- Practitioner ↔ Treatment (many-to-many) -------------

CREATE TABLE IF NOT EXISTS practitioner_treatments (
  practitioner_id INT UNSIGNED NOT NULL,
  treatment_id    INT UNSIGNED NOT NULL,

  PRIMARY KEY (practitioner_id, treatment_id),
  FOREIGN KEY (practitioner_id) REFERENCES practitioners(id) ON DELETE CASCADE,
  FOREIGN KEY (treatment_id)    REFERENCES treatments(id)    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- PRODUCTS
-- ============================================================

CREATE TABLE IF NOT EXISTS products (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug                VARCHAR(255) NOT NULL UNIQUE,
  product_name        VARCHAR(255) NOT NULL,
  product_category    VARCHAR(255),
  product_subcategory VARCHAR(255),
  category            VARCHAR(100),

  -- Commercial
  brand               VARCHAR(255),
  manufacturer        TEXT,
  distributor         VARCHAR(500),
  distributor_cleaned VARCHAR(255),
  sku                 VARCHAR(255),

  -- Media
  image_url        TEXT,
  document_pdf_url TEXT,

  -- Content
  description       TEXT,
  treatment_duration TEXT,
  onset_of_effect    TEXT,

  -- Compliance
  mhra_approved VARCHAR(255),
  ce_marked     VARCHAR(255),
  mhra_link     VARCHAR(500),

  -- About
  brand_about  TEXT,
  seller_about TEXT,

  -- Verification
  source_verified_on                DATE,
  data_confidence_score             DECIMAL(5,2),
  is_aesthetics_dermatology_related TINYINT(1),

  -- JSON: product detail page arrays, never used as SQL filters
  key_benefits          JSON, -- string[]
  indications           JSON, -- string[]
  composition           JSON, -- string[]
  formulation           JSON, -- string[]
  packaging             JSON, -- string[]
  usage_instructions    JSON, -- string[]
  contraindications     JSON, -- string[]
  adverse_effects       JSON, -- string[]
  storage_conditions    JSON, -- string[]
  certifications        JSON, -- string[]
  verification_sources  JSON, -- string[]
  all_prices            JSON, -- price map / array

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_brand    (brand),
  INDEX idx_category (product_category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- ACCREDITATION BODIES
-- ============================================================

CREATE TABLE IF NOT EXISTS accreditation_bodies (
  id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug  VARCHAR(255) NOT NULL UNIQUE,
  image MEDIUMTEXT, -- base64 string or image URL

  -- Overview
  overview_description TEXT,
  founded_year         VARCHAR(255),
  founder              VARCHAR(255),
  purpose              TEXT,

  -- Governing Body
  governing_org_name VARCHAR(255),
  company_status     TEXT,
  regulatory_status  TEXT,
  industry_standing  TEXT,

  -- Eligibility
  eligibility_who_can_apply TEXT,

  -- Accreditation Requirements
  inspection_required TEXT,

  -- Verification Process
  public_register               VARCHAR(255),
  certificate_validation_method TEXT,

  -- Renewal & Compliance
  renewal_frequency TEXT,
  cpd_requirements  TEXT,
  audit_process     TEXT,

  -- Benefits
  reputation          TEXT,
  patient_trust_impact TEXT,

  -- Government Regulation
  statutory_backing TEXT,
  regulated_by      VARCHAR(255),
  legal_status      TEXT,

  -- JSON: static reference arrays, rendered on detail page only
  eligibility_requirements JSON, -- string[]
  eligibility_restrictions JSON, -- string[]
  evaluation_factors       JSON, -- string[]
  available_categories     JSON, -- string[]
  documentation_required   JSON, -- string[]
  compliance_standards     JSON, -- string[]
  protection_mechanisms    JSON, -- string[]
  limitations              JSON, -- string[]
  comparable_entities      JSON, -- string[]
  key_differences          JSON, -- string[]
  media_mentions           JSON, -- string[]
  endorsements             JSON, -- string[]
  credibility_signals      JSON, -- string[]
  faqs                     JSON, -- { question: string, answer: string }[]

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- ADMIN — PENDING SUBMISSIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS pending_clinics (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  submitted_data LONGTEXT NOT NULL, -- raw JSON string until reviewed
  status         ENUM('pending','approved','rejected') DEFAULT 'pending',
  submitted_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at    TIMESTAMP NULL,
  reviewer_notes TEXT,

  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pending_practitioners (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  submitted_data LONGTEXT NOT NULL, -- raw JSON string until reviewed
  status         ENUM('pending','approved','rejected') DEFAULT 'pending',
  submitted_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at    TIMESTAMP NULL,
  reviewer_notes TEXT,

  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
