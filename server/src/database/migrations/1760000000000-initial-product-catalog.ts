import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class InitialProductCatalog1760000000000 implements MigrationInterface {
  name = 'InitialProductCatalog1760000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'products',
      columns: [
        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'name', type: 'varchar', length: '160' },
        { name: 'category', type: 'varchar', length: '80' },
        { name: 'price_cents', type: 'int', unsigned: true },
        { name: 'rating', type: 'decimal', precision: 2, scale: 1, default: '0.0' },
        { name: 'accent', type: 'varchar', length: '7' },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' }
      ]
    }), true);

    await queryRunner.createIndex('products', new TableIndex({
      name: 'IDX_products_category',
      columnNames: ['category']
    }));

    await queryRunner.manager.createQueryBuilder().insert().into('products').values([
      { name: 'Aero Pro Headphones', category: 'Audio', price_cents: 12999, rating: 4.8, accent: '#d9f99d' },
      { name: 'Orbit Smart Watch', category: 'Wearables', price_cents: 18999, rating: 4.7, accent: '#bae6fd' },
      { name: 'Arc Mechanical Keyboard', category: 'Accessories', price_cents: 9499, rating: 4.9, accent: '#ddd6fe' },
      { name: 'Flux Wireless Mouse', category: 'Accessories', price_cents: 5999, rating: 4.6, accent: '#fed7aa' },
      { name: 'Nova Portable Speaker', category: 'Audio', price_cents: 7999, rating: 4.5, accent: '#fecdd3' },
      { name: 'Pulse USB-C Hub', category: 'Accessories', price_cents: 4999, rating: 4.7, accent: '#a7f3d0' }
    ]).execute();
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('products', true);
  }
}
