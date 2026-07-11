import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class CreateProductImages1783752000000 implements MigrationInterface {
  name = 'CreateProductImages1783752000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('product_images'))) {
      await queryRunner.createTable(new Table({ name: 'product_images', columns: [
        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'product_id', type: 'int' },
        { name: 'url', type: 'varchar', length: '2048' },
        { name: 'sort_order', type: 'smallint', unsigned: true, default: 0 },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' }
      ] }));
    }

    let table = await queryRunner.getTable('product_images');
    if (!table) throw new Error('Unable to inspect product_images table.');

    const productIdColumn = table.findColumnByName('product_id');
    if (productIdColumn?.unsigned) {
      await queryRunner.changeColumn('product_images', productIdColumn, new TableColumn({
        name: 'product_id',
        type: 'int',
        isNullable: false
      }));
      table = await queryRunner.getTable('product_images');
      if (!table) throw new Error('Unable to inspect product_images table.');
    }

    if (!table.indices.some((index) => index.name === 'IDX_product_images_product_sort')) {
      await queryRunner.createIndex('product_images', new TableIndex({
        name: 'IDX_product_images_product_sort',
        columnNames: ['product_id', 'sort_order']
      }));
    }

    table = await queryRunner.getTable('product_images');
    if (!table) throw new Error('Unable to inspect product_images table.');

    if (!table.foreignKeys.some((key) => key.name === 'FK_product_images_product')) {
      await queryRunner.createForeignKey('product_images', new TableForeignKey({
        name: 'FK_product_images_product',
        columnNames: ['product_id'],
        referencedTableName: 'products',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE'
      }));
    }

    await queryRunner.query(`
      INSERT INTO product_images (product_id, url, sort_order)
      SELECT product.id, product.image_url, 0
      FROM products product
      WHERE product.image_url IS NOT NULL
        AND product.image_url <> ''
        AND NOT EXISTS (
          SELECT 1
          FROM product_images image
          WHERE image.product_id = product.id
            AND image.url = product.image_url
        )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('product_images')) {
      await queryRunner.dropTable('product_images', true);
    }
  }
}
