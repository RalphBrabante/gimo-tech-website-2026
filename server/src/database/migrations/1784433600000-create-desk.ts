import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateDesk1784433600000 implements MigrationInterface {
  name = 'CreateDesk1784433600000';

  async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('desk_clients'))) {
      await queryRunner.createTable(new Table({ name: 'desk_clients', columns: [
        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'name', type: 'varchar', length: '160' },
        { name: 'email_address', type: 'varchar', length: '254', isNullable: true },
        { name: 'email_domain', type: 'varchar', length: '253', isNullable: true },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' }
      ] }));
      await queryRunner.createIndex('desk_clients', new TableIndex({ name: 'UQ_desk_clients_name', columnNames: ['name'], isUnique: true }));
    }

    if (!(await queryRunner.hasTable('desk_message_assignments'))) {
      await queryRunner.createTable(new Table({ name: 'desk_message_assignments', columns: [
        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'mailbox_resource_id', type: 'varchar', length: '160' },
        { name: 'folder', type: 'varchar', length: '255' },
        { name: 'message_uid', type: 'varchar', length: '160' },
        { name: 'client_id', type: 'int' },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' }
      ] }));
      await queryRunner.createIndices('desk_message_assignments', [
        new TableIndex({ name: 'UQ_desk_message_identity', columnNames: ['mailbox_resource_id', 'folder', 'message_uid'], isUnique: true }),
        new TableIndex({ name: 'IDX_desk_message_client', columnNames: ['client_id'] })
      ]);
      await queryRunner.createForeignKey('desk_message_assignments', new TableForeignKey({
        name: 'FK_desk_message_client',
        columnNames: ['client_id'],
        referencedTableName: 'desk_clients',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE'
      }));
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('desk_message_assignments')) await queryRunner.dropTable('desk_message_assignments', true);
    if (await queryRunner.hasTable('desk_clients')) await queryRunner.dropTable('desk_clients', true);
  }
}
