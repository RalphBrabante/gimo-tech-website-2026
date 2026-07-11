import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class ExpandProductsAndLinkUsers1783744800000 implements MigrationInterface {
  name = 'ExpandProductsAndLinkUsers1783744800000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('products', [
      new TableColumn({ name: 'sku', type: 'varchar', length: '64', isNullable: true }),
      new TableColumn({ name: 'description', type: 'text', isNullable: true }),
      new TableColumn({ name: 'image_url', type: 'varchar', length: '2048', isNullable: true }),
      new TableColumn({ name: 'is_active', type: 'boolean', default: true }),
      new TableColumn({ name: 'created_by_user_id', type: 'int', isNullable: true }),
      new TableColumn({ name: 'updated_by_user_id', type: 'int', isNullable: true })
    ]);

    await queryRunner.query(`UPDATE products SET sku = CONCAT('LEGACY-', id), description = CONCAT('Legacy catalog product: ', name) WHERE sku IS NULL`);
    await queryRunner.changeColumn('products', 'sku', new TableColumn({ name: 'sku', type: 'varchar', length: '64', isNullable: false }));
    await queryRunner.changeColumn('products', 'description', new TableColumn({ name: 'description', type: 'text', isNullable: false }));
    await queryRunner.createIndex('products', new TableIndex({ name: 'UQ_products_sku', columnNames: ['sku'], isUnique: true }));
    await queryRunner.createForeignKeys('products', [
      new TableForeignKey({ name: 'FK_products_created_by_user', columnNames: ['created_by_user_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'SET NULL' }),
      new TableForeignKey({ name: 'FK_products_updated_by_user', columnNames: ['updated_by_user_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'SET NULL' })
    ]);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('products', 'FK_products_created_by_user');
    await queryRunner.dropForeignKey('products', 'FK_products_updated_by_user');
    await queryRunner.dropIndex('products', 'UQ_products_sku');
    await queryRunner.dropColumns('products', ['sku', 'description', 'image_url', 'is_active', 'created_by_user_id', 'updated_by_user_id']);
  }
}
