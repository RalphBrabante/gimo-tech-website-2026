import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreatePages1783759200000 implements MigrationInterface {
  name = 'CreatePages1783759200000';

  async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('pages'))) {
      await queryRunner.createTable(new Table({
        name: 'pages',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'slug', type: 'varchar', length: '160' },
          { name: 'title', type: 'varchar', length: '200' },
          { name: 'meta_description', type: 'varchar', length: '300', isNullable: true },
          { name: 'status', type: 'enum', enum: ['draft', 'published'], default: "'draft'" },
          { name: 'og_image_url', type: 'varchar', length: '2048', isNullable: true },
          { name: 'created_by_user_id', type: 'int', isNullable: true },
          { name: 'updated_by_user_id', type: 'int', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' }
        ]
      }), true);

      await queryRunner.createIndex('pages', new TableIndex({ name: 'UQ_pages_slug', columnNames: ['slug'], isUnique: true }));
      await queryRunner.createForeignKey('pages', new TableForeignKey({
        name: 'FK_pages_created_by_user',
        columnNames: ['created_by_user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL'
      }));
      await queryRunner.createForeignKey('pages', new TableForeignKey({
        name: 'FK_pages_updated_by_user',
        columnNames: ['updated_by_user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL'
      }));
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('pages')) {
      await queryRunner.dropTable('pages', true);
    }
  }
}
