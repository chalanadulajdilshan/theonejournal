-- Languages table & article relation
CREATE TABLE IF NOT EXISTS languages (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    code       VARCHAR(20)  DEFAULT NULL,
    sort_order INT          NOT NULL DEFAULT 0,
    is_visible TINYINT(1)   NOT NULL DEFAULT 1,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_language_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE articles
    ADD COLUMN language_id INT NULL AFTER subcategory_id,
    ADD CONSTRAINT fk_articles_language
        FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE SET NULL;

INSERT IGNORE INTO languages (name, code, sort_order) VALUES
    ('English',   'en', 0),
    ('Arabic',    'ar', 1),
    ('Sinhala',   'si', 2),
    ('Tamil',     'ta', 3);
