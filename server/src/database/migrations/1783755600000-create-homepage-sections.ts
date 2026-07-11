import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

const seedRows: { sectionKey: string; content: Record<string, unknown> }[] = [
  {
    sectionKey: 'hero',
    content: {
      eyebrow: 'Fast shipping laboratory supplies',
      heading: 'Syringe filters for reliable HPLC sample preparation.',
      body: 'Gimo Tech Supplies provides multiple syringe filter membrane types for chromatographic workflows, including Nylon, PTFE, PVDF, and MCE options in common laboratory formats such as 25mm and 0.45um.',
      ticks: [
        'HPLC sample prep and laboratory filtration',
        'Bulk canister packs and routine-use supply options',
        'Authentic lab supplies with responsive purchasing support'
      ],
      ctaLabel: 'View syringe filters',
      ctaHref: '#shop'
    }
  },
  {
    sectionKey: 'filter_types',
    content: {
      eyebrow: 'Syringe filter types',
      heading: 'Choose the membrane for your method',
      items: [
        {
          name: 'Nylon Syringe Filter',
          tag: 'General HPLC prep',
          description: 'A common choice for aqueous and mixed sample preparation workflows that need dependable filtration.',
          format: '25mm / 0.45um options',
          pack: 'Canister and bulk pack support',
          color: '#f0b21a'
        },
        {
          name: 'PTFE Syringe Filter',
          tag: 'Solvent-compatible',
          description: 'Used for stronger solvent workflows where chemical resistance and low extractables matter.',
          format: 'Hydrophobic and method-fit options',
          pack: 'Bulk canister pack availability',
          color: '#e92f38'
        },
        {
          name: 'PVDF Syringe Filter',
          tag: 'Low binding',
          description: 'A useful option for methods that benefit from low protein binding and consistent filtration.',
          format: '25mm / 0.45um options',
          pack: 'Routine laboratory pack sizes',
          color: '#4630a3'
        },
        {
          name: 'MCE Syringe Filter',
          tag: 'Clarification',
          description: 'Suited for general sample clarification and laboratory preparation workflows.',
          format: 'Single-piece and pack options',
          pack: 'Flexible ordering support',
          color: '#07945f'
        }
      ]
    }
  },
  {
    sectionKey: 'benefits',
    content: {
      eyebrow: 'Laboratory supplier focus',
      heading: 'Supplies built around real lab workflows.',
      body: 'Our catalog is centered on practical consumables that laboratories reorder often: syringe filters for HPLC preparation and customized biohazard bags for controlled disposal and tracking.',
      bullets: [
        'Nylon, PTFE, PVDF, and MCE syringe filter options',
        'Bulk pack support for procurement and recurring laboratory use',
        'Biohazard bag printing with QR code attachment workflows',
        'Clear product descriptions, SKU tracking, and purchasing support'
      ],
      ctaLabel: 'Request a quote',
      ctaHref: '#contact',
      cards: [
        { icon: 'HPLC', title: 'Chromatography ready', body: 'Filters suited for routine HPLC sample preparation.', linkLabel: 'Browse filters', linkHref: '#shop' },
        { icon: '4x', title: 'Multiple membranes', body: 'Nylon, PTFE, PVDF, and MCE options for different methods.', linkLabel: 'See details', linkHref: '#filter-types-title' },
        { icon: 'QR', title: 'Traceable waste bags', body: 'Customized biohazard bags with printed QR code series.', linkLabel: 'Review options', linkHref: '#biohazard-bags' },
        { icon: 'QA', title: 'Supplier assistance', body: 'Responsive support for product matching and repeat orders.', linkLabel: 'Get support', linkHref: '#contact' }
      ]
    }
  },
  {
    sectionKey: 'impact_banner',
    content: {
      eyebrow: 'Customized biohazard bags',
      heading: 'Printed QR code series for traceable laboratory waste handling.',
      body: 'Order customized biohazard bags with series-based printing and QR code attachments for internal tracking, receiving, or disposal documentation workflows.',
      ctaLabel: 'Discuss custom printing',
      ctaHref: '#contact'
    }
  },
  {
    sectionKey: 'split_1',
    content: {
      eyebrow: 'Syringe filter selection',
      heading: 'Match membrane, diameter, and pore size to your method.',
      body: 'Tell us your sample type, solvent system, and instrument workflow. We can help identify the syringe filter type and pack size that fits your laboratory process.',
      checklist: [
        'Nylon, PTFE, PVDF, and MCE filters',
        'HPLC sample preparation',
        '25mm filter formats',
        '0.45um pore size options',
        'Bulk canister packs',
        'Repeat-order support'
      ],
      ctaLabel: 'Ask for recommendations',
      ctaHref: '#contact'
    }
  },
  {
    sectionKey: 'split_2',
    content: {
      eyebrow: 'Custom labeling workflow',
      heading: 'Biohazard bag printing with QR code attachments.',
      body: 'We support laboratories that need customized bag series, printed identifiers, QR code attachments, and purchasing coordination for repeat batches.',
      stats: [
        { value: 'QR', label: 'Code attachments' },
        { value: 'ID', label: 'Series printing' },
        { value: 'PO', label: 'Procurement support' }
      ],
      ctaLabel: 'Start a custom order',
      ctaHref: '#contact'
    }
  },
  {
    sectionKey: 'consult_intro',
    content: {
      eyebrow: 'Laboratory purchasing support',
      heading: 'Request product details or a custom quotation.',
      body: 'Send your syringe filter requirements or biohazard bag printing details and we will help prepare the right product options.'
    }
  },
  {
    sectionKey: 'plans',
    content: {
      eyebrow: 'Purchasing paths',
      heading: 'Supply options for laboratories',
      cards: [
        {
          eyebrow: 'FILTERS',
          title: 'HPLC',
          subtitle: 'Syringe Filter Supply',
          bullets: ['Nylon, PTFE, PVDF, and MCE options', 'Common diameter and pore sizes', 'Bulk canister packs', 'Repeat procurement support'],
          ctaLabel: 'Request filter quote',
          ctaHref: '#contact',
          featured: false
        },
        {
          eyebrow: 'CANISTER',
          title: '100',
          subtitle: 'Routine Lab Packs',
          bullets: ['Canister pack availability', 'Non-sterile lab-use options', 'SKU-based reordering', 'Fast shipping coordination'],
          ctaLabel: 'View catalog',
          ctaHref: '#shop',
          featured: true
        },
        {
          eyebrow: 'CUSTOM',
          title: 'QR',
          subtitle: 'Biohazard Bag Printing',
          bullets: ['Customized print layout', 'QR code attachments', 'Series-based identifiers', 'Batch order coordination'],
          ctaLabel: 'Discuss printing',
          ctaHref: '#contact',
          featured: false
        }
      ]
    }
  },
  {
    sectionKey: 'location',
    content: {
      tagline: 'Laboratory supply coordination',
      description: 'Syringe filters, custom biohazard bags, and QR code printing support',
      ctaLabel: 'Send requirements',
      ctaHref: '#contact'
    }
  },
  {
    sectionKey: 'cta_banner',
    content: {
      heading: 'Need syringe filters or custom QR biohazard bags?',
      ctaLabel: 'Request a quote',
      ctaHref: '#contact'
    }
  },
  {
    sectionKey: 'footer_brand',
    content: {
      blurb: 'Laboratory supplies for HPLC sample preparation and custom biohazard bag workflows.',
      copyrightLine: '© 2026 Gimo Tech Supplies. All rights reserved.'
    }
  }
];

export class CreateHomepageSections1783755600000 implements MigrationInterface {
  name = 'CreateHomepageSections1783755600000';

  async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('homepage_sections'))) {
      await queryRunner.createTable(new Table({
        name: 'homepage_sections',
        columns: [
          { name: 'section_key', type: 'varchar', length: '40', isPrimary: true },
          { name: 'content', type: 'json' },
          { name: 'updated_by_user_id', type: 'int', isNullable: true },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' }
        ]
      }), true);

      await queryRunner.createForeignKey('homepage_sections', new TableForeignKey({
        name: 'FK_homepage_sections_updated_by_user',
        columnNames: ['updated_by_user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL'
      }));

      for (const row of seedRows) {
        await queryRunner.query('INSERT INTO homepage_sections (section_key, content) VALUES (?, ?)', [row.sectionKey, JSON.stringify(row.content)]);
      }
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('homepage_sections')) {
      await queryRunner.dropTable('homepage_sections', true);
    }
  }
}
