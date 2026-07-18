import { MigrationInterface, QueryRunner } from 'typeorm';

const NYLON_PATH = '/products/nylon-syringe-filter-25mm-045um';
const GUIDE_PATH = '/guides/nylon-vs-ptfe-vs-pvdf-vs-mce-syringe-filters';

export class LinkNylonSeoPages1784347200000 implements MigrationInterface {
  name = 'LinkNylonSeoPages1784347200000';

  async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('page_blocks')) {
      await this.addButtonToPage(queryRunner, 'syringe-filters', 'View the 25mm Nylon Syringe Filter', NYLON_PATH);
      await this.addButtonToPage(queryRunner, 'syringe-filters', 'Compare syringe filter membranes', GUIDE_PATH);
      await this.addButtonToPage(queryRunner, 'lazada-shop', 'View Nylon syringe filter details', NYLON_PATH);
    }

    if (await queryRunner.hasTable('menu_items')) {
      const existing: Array<{ id: number }> = await queryRunner.query(
        'SELECT id FROM menu_items WHERE location = ? AND href = ? LIMIT 1',
        ['footer_products', NYLON_PATH]
      );
      if (!existing.length) {
        await queryRunner.query(
          `INSERT INTO menu_items (location, label, link_type, href, sort_order, open_in_new_tab, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          ['footer_products', 'Nylon syringe filters', 'url', NYLON_PATH, 3, false, true]
        );
      }
    }
  }

  async down(): Promise<void> {
    // Preserve administrator-managed page blocks and navigation after publication.
  }

  private async addButtonToPage(
    queryRunner: QueryRunner,
    slug: string,
    label: string,
    href: string
  ): Promise<void> {
    const pages: Array<{ id: number }> = await queryRunner.query(
      'SELECT id FROM pages WHERE slug = ? AND status = ? LIMIT 1',
      [slug, 'published']
    );
    if (!pages.length) return;

    const existing: Array<{ id: number }> = await queryRunner.query(
      'SELECT id FROM page_blocks WHERE page_id = ? AND button_href = ? LIMIT 1',
      [pages[0].id, href]
    );
    if (existing.length) return;

    const rows: Array<{ next_sort_order: number }> = await queryRunner.query(
      'SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_sort_order FROM page_blocks WHERE page_id = ?',
      [pages[0].id]
    );
    await queryRunner.query(
      `INSERT INTO page_blocks (page_id, block_type, sort_order, button_label, button_href)
       VALUES (?, ?, ?, ?, ?)`,
      [pages[0].id, 'button', Number(rows[0]?.next_sort_order ?? 0), label, href]
    );
  }
}
