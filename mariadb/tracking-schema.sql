CREATE TABLE IF NOT EXISTS directory_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  timestamp DATETIME(3) NOT NULL,
  page_url TEXT NOT NULL,
  page_type VARCHAR(64) NOT NULL,
  referrer TEXT NOT NULL,
  country VARCHAR(8) NOT NULL DEFAULT 'unknown',
  device_type VARCHAR(16) NOT NULL DEFAULT 'desktop',
  cta_label VARCHAR(255) NOT NULL,
  cta_target_url TEXT NULL,
  INDEX idx_directory_events_page_type (page_type),
  INDEX idx_directory_events_timestamp (timestamp)
);

CREATE TABLE IF NOT EXISTS directory_leads (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  timestamp DATETIME(3) NOT NULL,
  page_url TEXT NOT NULL,
  page_type VARCHAR(64) NOT NULL,
  referrer TEXT NOT NULL,
  country VARCHAR(8) NOT NULL DEFAULT 'unknown',
  device_type VARCHAR(16) NOT NULL DEFAULT 'desktop',
  name VARCHAR(255) NOT NULL,
  contact VARCHAR(255) NOT NULL,
  treatment VARCHAR(255) NULL,
  location VARCHAR(255) NULL,
  budget VARCHAR(255) NULL,
  INDEX idx_directory_leads_page_type (page_type),
  INDEX idx_directory_leads_timestamp (timestamp)
);
