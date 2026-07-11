import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreatePageBlocks1783762800000 implements MigrationInterface {
  name = 'CreatePageBlocks1783762800000';

  async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('page_blocks'))) {
      await queryRunner.createTable(new Table({
        name: 'page_blocks',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'page_id', type: 'int' },
          { name: 'block_type', type: 'enum', enum: ['heading', 'paragraph', 'image', 'button'] },
          { name: 'sort_order', type: 'smallint', unsigned: true, default: 0 },
          { name: 'heading_text', type: 'varchar', length: '200', isNullable: true },
          { name: 'heading_level', type: 'tinyint', isNullable: true },
          { name: 'paragraph_text', type: 'text', isNullable: true },
          { name: 'image_url', type: 'varchar', length: '2048', isNullable: true },
          { name: 'image_alt', type: 'varchar', length: '300', isNullable: true },
          { name: 'button_label', type: 'varchar', length: '100', isNullable: true },
          { name: 'button_href', type: 'varchar', length: '2048', isNullable: true }
        ]
      }), true);

      await queryRunner.createIndex('page_blocks', new TableIndex({ name: 'IDX_page_blocks_page_sort', columnNames: ['page_id', 'sort_order'] }));
      await queryRunner.createForeignKey('page_blocks', new TableForeignKey({
        name: 'FK_page_blocks_page',
        columnNames: ['page_id'],
        referencedTableName: 'pages',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE'
      }));
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('page_blocks')) {
      await queryRunner.dropTable('page_blocks', true);
    }
  }
}
