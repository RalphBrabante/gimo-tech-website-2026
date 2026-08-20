import { MigrationInterface, QueryRunner } from 'typeorm';

const QR_LABELS_PATH = '/sequential-qr-code-labels';

export class AddSequentialQrCodeLabelOffer1784606400000 implements MigrationInterface {
  name = 'AddSequentialQrCodeLabelOffer1784606400000';

  async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('menu_items'))) return;

    await this.insertMenuItem(queryRunner, 'header', 'QR Code Labels', 2, true);
    await this.insertMenuItem(queryRunner, 'footer_services', 'Sequential QR labels', 1, true);
  }

  async down(): Promise<void> {
    // Preserve administrator-managed navigation after publication.
  }

  private async insertMenuItem(
    queryRunner: QueryRunner,
    location: 'header' | 'footer_services',
    label: string,
    sortOrder: number,
    shiftFollowingItems: boolean
  ): Promise<void> {
    const existing: Array<{ id: number }> = await queryRunner.query(
      'SELECT id FROM menu_items WHERE location = ? AND href = ? LIMIT 1',
      [location, QR_LABELS_PATH]
    );
    if (existing.length) return;

    if (shiftFollowingItems) {
      await queryRunner.query(
        'UPDATE menu_items SET sort_order = sort_order + 1 WHERE location = ? AND sort_order >= ?',
        [location, sortOrder]
      );
    }

    await queryRunner.query(
      `INSERT INTO menu_items (location, label, link_type, href, sort_order, open_in_new_tab, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [location, label, 'url', QR_LABELS_PATH, sortOrder, false, true]
    );
  }
}
