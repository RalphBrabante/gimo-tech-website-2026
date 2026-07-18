import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class AddAuthSecurity1784520000000 implements MigrationInterface {
  name = 'AddAuthSecurity1784520000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('users', [
      new TableColumn({ name: 'email', type: 'varchar', length: '254', isNullable: true }),
      new TableColumn({ name: 'failed_login_attempts', type: 'int', default: 0 }),
      new TableColumn({ name: 'password_reset_required', type: 'boolean', default: false }),
      new TableColumn({ name: 'password_reset_token_hash', type: 'varchar', length: '64', isNullable: true }),
      new TableColumn({ name: 'password_reset_expires_at', type: 'timestamp', isNullable: true }),
      new TableColumn({ name: 'password_changed_at', type: 'timestamp', isNullable: true })
    ]);
    await queryRunner.createIndex('users', new TableIndex({ name: 'UQ_users_email', columnNames: ['email'], isUnique: true }));
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('users', 'UQ_users_email');
    for (const column of ['password_changed_at', 'password_reset_expires_at', 'password_reset_token_hash', 'password_reset_required', 'failed_login_attempts', 'email']) {
      await queryRunner.dropColumn('users', column);
    }
  }
}
