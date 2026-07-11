import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateUsers1783741200000 implements MigrationInterface {
  name = 'CreateUsers1783741200000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'users',
      columns: [
        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'username', type: 'varchar', length: '80' },
        { name: 'password_hash', type: 'varchar', length: '255' },
        { name: 'is_active', type: 'boolean', default: true },
        { name: 'last_login_at', type: 'timestamp', isNullable: true },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' }
      ]
    }), true);

    await queryRunner.createIndex('users', new TableIndex({
      name: 'UQ_users_username',
      columnNames: ['username'],
      isUnique: true
    }));
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users', true);
  }
}
