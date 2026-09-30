import { MigrationInterface, QueryRunner } from 'typeorm';

// Compare-and-set only the exact historical defaults. Administrator edits survive.
const replacements = [
  ['hero', 'eyebrow', 'Fast shipping laboratory supplies', 'Laboratory supplies · Philippines'],
  ['hero', 'body', 'Gimo Tech Supplies provides multiple syringe filter membrane types for chromatographic workflows, including Nylon, PTFE, PVDF, and MCE options in common laboratory formats such as 25mm and 0.45um.', 'Gimo Tech Supplies provides nylon syringe filters for laboratory sample preparation, customized biohazard bags, and sequential QR code labels in the Philippines. Ask us to confirm the configuration and quantity for your method.'],
  ['location', 'tagline', 'Visit GIMO Laboratory Supplies', 'GIMO Laboratory Supplies location'],
  ['location', 'description', 'B2 L26 Diamond St., South 1 Camella Homes Annex, Brgy., San Pedro, Laguna 4023', 'B2 L26 Diamond St., South 1 Camella Homes Annex, San Pedro, Laguna 4023']
] as const;
export class RefinePublicHomepageCopy1790812800000 implements MigrationInterface {
  name = 'RefinePublicHomepageCopy1790812800000';
  async up(q: QueryRunner): Promise<void> {
    for (const [section, key, oldValue, newValue] of replacements) await q.query('UPDATE homepage_sections SET content = JSON_SET(content, ?, ?) WHERE section_key = ? AND JSON_UNQUOTE(JSON_EXTRACT(content, ?)) = ?', [`$.${key}`, newValue, section, `$.${key}`, oldValue]);
  }
  async down(): Promise<void> {
    // Content may have been edited to the same replacement value before this migration.
    // Without a per-row journal, reversing by text would overwrite legitimate owner edits.
    // Restore only reviewed rows from the pre-rollout backup; keep public copy by default.
  }
}
