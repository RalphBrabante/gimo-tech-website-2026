import { MigrationInterface, QueryRunner } from 'typeorm';

const seedRows: {
  location: string;
  label: string;
  linkType: 'url' | 'anchor';
  href: string;
  sortOrder: number;
}[] = [
  { location: 'header', label: 'Home', linkType: 'url', href: '/', sortOrder: 0 },
  { location: 'header', label: 'Syringe Filters', linkType: 'anchor', href: '#syringe-filters', sortOrder: 1 },
  { location: 'header', label: 'Biohazard Bags', linkType: 'anchor', href: '#biohazard-bags', sortOrder: 2 },
  { location: 'header', label: 'Catalog', linkType: 'anchor', href: '#shop', sortOrder: 3 },
  { location: 'header', label: 'Contact', linkType: 'anchor', href: '#contact', sortOrder: 4 },

  { location: 'footer_products', label: 'Syringe filters', linkType: 'anchor', href: '#syringe-filters', sortOrder: 0 },
  { location: 'footer_products', label: 'QR biohazard bags', linkType: 'anchor', href: '#biohazard-bags', sortOrder: 1 },
  { location: 'footer_products', label: 'Product catalog', linkType: 'anchor', href: '#shop', sortOrder: 2 },

  { location: 'footer_services', label: 'Custom printing', linkType: 'anchor', href: '#contact', sortOrder: 0 },
  { location: 'footer_services', label: 'QR code attachments', linkType: 'anchor', href: '#contact', sortOrder: 1 },
  { location: 'footer_services', label: 'Repeat supply orders', linkType: 'anchor', href: '#contact', sortOrder: 2 },

  { location: 'footer_purchasing', label: 'Request a quote', linkType: 'anchor', href: '#contact', sortOrder: 0 },
  { location: 'footer_purchasing', label: 'Product matching', linkType: 'anchor', href: '#contact', sortOrder: 1 },
  { location: 'footer_purchasing', label: 'Shipping support', linkType: 'anchor', href: '#contact', sortOrder: 2 }
];

export class SeedMenuItems1783770000000 implements MigrationInterface {
  name = 'SeedMenuItems1783770000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('menu_items'))) return;
    const [{ count }] = await queryRunner.query('SELECT COUNT(*) as count FROM menu_items');
    if (Number(count) > 0) return;

    for (const row of seedRows) {
      await queryRunner.query(
        'INSERT INTO menu_items (location, label, link_type, href, sort_order) VALUES (?, ?, ?, ?, ?)',
        [row.location, row.label, row.linkType, row.href, row.sortOrder]
      );
    }
  }

  async down(): Promise<void> {
    // Intentionally a no-op: this migration only backfills rows a prior migration should
    // have seeded. Reverting it should not delete admin-managed menu items.
  }
}
