import { MigrationInterface, QueryRunner } from 'typeorm';

const SHOPEE_SHOP = 'https://shopee.ph/shop/229076897';

/** Additive: adds the official Shopee shop to the footer once. Administrator edits are preserved. */
export class AddShopeeShopLink1795392000000 implements MigrationInterface {
  name = 'AddShopeeShopLink1795392000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('menu_items'))) return;
    const existing: Array<{ id: number }> = await queryRunner.query('SELECT id FROM menu_items WHERE href LIKE ? LIMIT 1', ['https://shopee.ph/%']);
    if (existing.length) return;
    const rows: Array<{ next_sort_order: number }> = await queryRunner.query('SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_sort_order FROM menu_items WHERE location = ?', ['footer_products']);
    await queryRunner.query(
      'INSERT INTO menu_items (location, label, link_type, href, sort_order, open_in_new_tab, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['footer_products', 'Shopee shop', 'url', SHOPEE_SHOP, Number(rows[0]?.next_sort_order ?? 0), true, true]
    );
  }

  async down(): Promise<void> {
    // Preserve administrator-managed navigation after publication.
  }
}
