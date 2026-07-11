import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

const seedRows: {
  location: string;
  label: string;
  linkType: 'url' | 'anchor';
  href: string;
  sortOrder: number;
}[] = [
  { location: 'header', label: 'Home', linkType: 'url', href: '/', sortOrder: 0 },
  { location: 'header', label: 'Syringe Filters', linkType: 'anchor', href: '#syringe-filters', sortOrder: 1 },
  { location: 'header', label: 'Biohazard Bags', linkType: 'anchor', href: '#biohazard-bags', sortOrder: 2 },
  { location: 'header', label: 'Catalog', linkType: 'anchor', href: '#shop', sortOrder: 3 },
  { location: 'header', label: 'Contact', linkType: 'anchor', href: '#contact', sortOrder: 4 },

  { location: 'footer_products', label: 'Syringe filters', linkType: 'anchor', href: '#syringe-filters', sortOrder: 0 },
  { location: 'footer_products', label: 'QR biohazard bags', linkType: 'anchor', href: '#biohazard-bags', sortOrder: 1 },
  { location: 'footer_products', label: 'Product catalog', linkType: 'anchor', href: '#shop', sortOrder: 2 },

  { location: 'footer_services', label: 'Custom printing', linkType: 'anchor', href: '#contact', sortOrder: 0 },
  { location: 'footer_services', label: 'QR code attachments', linkType: 'anchor', href: '#contact', sortOrder: 1 },
  { location: 'footer_services', label: 'Repeat supply orders', linkType: 'anchor', href: '#contact', sortOrder: 2 },

  { location: 'footer_purchasing', label: 'Request a quote', linkType: 'anchor', href: '#contact', sortOrder: 0 },
  { location: 'footer_purchasing', label: 'Product matching', linkType: 'anchor', href: '#contact', sortOrder: 1 },
  { location: 'footer_purchasing', label: 'Shipping support', linkType: 'anchor', href: '#contact', sortOrder: 2 }
];

export class CreateMenuItems1783766400000 implements MigrationInterface {
  name = 'CreateMenuItems1783766400000';

  async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('menu_items'))) {
      await queryRunner.createTable(new Table({
        name: 'menu_items',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'location', type: 'enum', enum: ['header', 'footer_products', 'footer_services', 'footer_purchasing'] },
          { name: 'label', type: 'varchar', length: '120' },
          { name: 'link_type', type: 'enum', enum: ['page', 'url', 'anchor'] },
          { name: 'page_id', type: 'int', isNullable: true },
          { name: 'href', type: 'varchar', length: '2048', isNullable: true },
          { name: 'open_in_new_tab', type: 'boolean', default: false },
          { name: 'sort_order', type: 'smallint', unsigned: true, default: 0 },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' }
        ]
      }), true);

      await queryRunner.createIndex('menu_items', new TableIndex({ name: 'IDX_menu_items_location_sort', columnNames: ['location', 'sort_order'] }));
      await queryRunner.createForeignKey('menu_items', new TableForeignKey({
        name: 'FK_menu_items_page',
        columnNames: ['page_id'],
        referencedTableName: 'pages',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL'
      }));

      for (const row of seedRows) {
        await queryRunner.query(
          'INSERT INTO menu_items (location, label, link_type, href, sort_order) VALUES (?, ?, ?, ?, ?)',
          [row.location, row.label, row.linkType, row.href, row.sortOrder]
        );
      }
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('menu_items')) {
      await queryRunner.dropTable('menu_items', true);
    }
  }
}
