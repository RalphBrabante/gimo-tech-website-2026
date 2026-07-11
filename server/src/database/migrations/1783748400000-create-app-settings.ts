import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateAppSettings1783748400000 implements MigrationInterface {
  name = 'CreateAppSettings1783748400000';
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({ name: 'app_settings', columns: [
      { name: 'id', type: 'tinyint', unsigned: true, isPrimary: true },
      { name: 'currency_code', type: 'varchar', length: '3', default: "'USD'" },
      { name: 'store_name', type: 'varchar', length: '160', default: "'Gimo Tech Supplies'" },
      { name: 'support_email', type: 'varchar', length: '254', isNullable: true },
      { name: 'free_shipping_threshold_cents', type: 'int', unsigned: true, isNullable: true },
      { name: 'updated_by_user_id', type: 'int', isNullable: true },
      { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' }
    ] }), true);
    await queryRunner.createForeignKey('app_settings', new TableForeignKey({ name: 'FK_app_settings_updated_by_user', columnNames: ['updated_by_user_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'SET NULL' }));
    await queryRunner.query("INSERT INTO app_settings (id, currency_code, store_name) VALUES (1, 'USD', 'Gimo Tech Supplies')");
  }
  async down(queryRunner: QueryRunner): Promise<void> { await queryRunner.dropTable('app_settings', true); }
}
