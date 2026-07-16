import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateQuotationRequests1784260800000 implements MigrationInterface {
  name = 'CreateQuotationRequests1784260800000';

  async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('quotation_requests')) return;
    await queryRunner.createTable(new Table({ name: 'quotation_requests', columns: [
      { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
      { name: 'request_number', type: 'varchar', length: '24', isNullable: true },
      { name: 'customer_name', type: 'varchar', length: '160' },
      { name: 'company_name', type: 'varchar', length: '160', isNullable: true },
      { name: 'customer_email', type: 'varchar', length: '254' },
      { name: 'phone_number', type: 'varchar', length: '50', isNullable: true },
      { name: 'notes', type: 'text', isNullable: true },
      { name: 'items', type: 'json' },
      { name: 'status', type: 'varchar', length: '16', default: "'pending'" },
      { name: 'response', type: 'json', isNullable: true },
      { name: 'responded_by_user_id', type: 'int', isNullable: true },
      { name: 'quoted_at', type: 'timestamp', isNullable: true },
      { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
      { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' }
    ] }));
    await queryRunner.createIndex('quotation_requests', new TableIndex({ name: 'UQ_quotation_requests_number', columnNames: ['request_number'], isUnique: true }));
    await queryRunner.createIndex('quotation_requests', new TableIndex({ name: 'IDX_quotation_requests_status_created', columnNames: ['status', 'created_at'] }));
    await queryRunner.createForeignKey('quotation_requests', new TableForeignKey({ name: 'FK_quotation_requests_responded_by', columnNames: ['responded_by_user_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'SET NULL' }));
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('quotation_requests')) await queryRunner.dropTable('quotation_requests', true);
  }
}
