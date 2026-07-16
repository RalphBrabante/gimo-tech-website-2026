import { MigrationInterface, QueryRunner } from 'typeorm';

interface LandingPageSeed {
  slug: string;
  title: string;
  metaDescription: string;
  ogImageUrl: string | null;
  blocks: Array<{
    blockType: 'heading' | 'paragraph' | 'button';
    headingText?: string;
    headingLevel?: 2 | 3;
    paragraphText?: string;
    buttonLabel?: string;
    buttonHref?: string;
  }>;
}

const pages: LandingPageSeed[] = [
  {
    slug: 'syringe-filters',
    title: 'Syringe Filters for HPLC Sample Preparation',
    metaDescription: 'Explore Nylon, PTFE, PVDF, and MCE syringe filters for HPLC sample preparation, including 25 mm and 0.45 µm laboratory options.',
    ogImageUrl: '/assets/products/nylon-syringe-filter-hero-1280.jpg',
    blocks: [
      {
        blockType: 'paragraph',
        paragraphText: 'Gimo Tech Supplies provides syringe filters for routine HPLC sample preparation, sample clarification, and laboratory filtration workflows. Available membrane options include Nylon, PTFE, PVDF, and MCE.'
      },
      { blockType: 'heading', headingLevel: 2, headingText: 'Choose the syringe filter membrane for your method' },
      {
        blockType: 'paragraph',
        paragraphText: 'Nylon filters are widely used for general aqueous and mixed sample preparation. PTFE supports solvent-compatible workflows, PVDF offers low-binding options, and MCE is suitable for general clarification. Tell us your sample and solvent system if you need help matching a membrane.'
      },
      { blockType: 'heading', headingLevel: 2, headingText: '25 mm and 0.45 µm syringe filter options' },
      {
        blockType: 'paragraph',
        paragraphText: 'Common laboratory formats include 25 mm diameter filters with 0.45 µm pore sizes, along with bulk and canister pack options for repeat procurement. Product availability depends on the membrane and pack configuration requested.'
      },
      { blockType: 'button', buttonLabel: 'Buy Nylon syringe filters on Lazada', buttonHref: 'https://www.lazada.com.ph/products/i3969520270.html' }
    ]
  },
  {
    slug: 'biohazard-bags',
    title: 'Customized Biohazard Bags with QR Code Printing',
    metaDescription: 'Request customized biohazard bags with printed identifiers, series-based layouts, and QR code attachments for laboratory waste workflows.',
    ogImageUrl: null,
    blocks: [
      {
        blockType: 'paragraph',
        paragraphText: 'Gimo Tech Supplies coordinates customized biohazard bag printing for laboratories that need clear identifiers, series-based layouts, and QR code attachments for internal tracking workflows.'
      },
      { blockType: 'heading', headingLevel: 2, headingText: 'Biohazard bag printing for traceable workflows' },
      {
        blockType: 'paragraph',
        paragraphText: 'Share your required bag size, quantity, printed information, series format, and QR code details. We can review the specification and prepare the appropriate custom-order requirements for your laboratory.'
      },
      { blockType: 'heading', headingLevel: 2, headingText: 'Plan your customized biohazard bag order' },
      {
        blockType: 'paragraph',
        paragraphText: 'Custom production details and lead times depend on the approved layout and order quantity. Email the supply team with your preferred delivery schedule so the quotation can reflect your actual requirements.'
      },
      { blockType: 'button', buttonLabel: 'Request a biohazard bag quotation', buttonHref: 'mailto:gimotechsupplies@gmail.com?subject=Biohazard%20bag%20quotation' }
    ]
  },
  {
    slug: 'lazada-shop',
    title: 'GIMO Laboratory Supplies Lazada Shop',
    metaDescription: 'Visit the official GIMO Laboratory Supplies Lazada shop to browse available laboratory supplies and place an order online.',
    ogImageUrl: null,
    blocks: [
      {
        blockType: 'paragraph',
        paragraphText: 'Browse available GIMO Laboratory Supplies products and order conveniently through our official Lazada shop in the Philippines.'
      },
      { blockType: 'heading', headingLevel: 2, headingText: 'Shop GIMO laboratory supplies on Lazada' },
      {
        blockType: 'paragraph',
        paragraphText: 'The Lazada storefront provides a convenient online purchasing option. For product matching, larger quantities, syringe filter specifications, or customized biohazard bag requirements, contact our supply team directly.'
      },
      { blockType: 'button', buttonLabel: 'Visit the official GIMO Lazada shop', buttonHref: 'https://www.lazada.com.ph/shop/gimo-laboratory-supplies/' }
    ]
  }
];

const menuUpdates = [
  ['header', 'Syringe Filters', '#syringe-filters', '/syringe-filters'],
  ['header', 'Biohazard Bags', '#biohazard-bags', '/biohazard-bags'],
  ['header', 'Catalog', '#shop', '/lazada-shop'],
  ['header', 'Contact', '#contact', '/#contact'],
  ['footer_products', 'Syringe filters', '#syringe-filters', '/syringe-filters'],
  ['footer_products', 'QR biohazard bags', '#biohazard-bags', '/biohazard-bags'],
  ['footer_products', 'Product catalog', '#shop', '/lazada-shop'],
  ['footer_services', 'Custom printing', '#contact', '/biohazard-bags'],
  ['footer_services', 'QR code attachments', '#contact', '/biohazard-bags'],
  ['footer_services', 'Repeat supply orders', '#contact', '/#contact'],
  ['footer_purchasing', 'Request a quote', '#contact', '/#contact'],
  ['footer_purchasing', 'Product matching', '#contact', '/syringe-filters'],
  ['footer_purchasing', 'Shipping support', '#contact', '/#contact']
] as const;

export class AddSeoLandingPages1784257200000 implements MigrationInterface {
  name = 'AddSeoLandingPages1784257200000';

  async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('pages')) || !(await queryRunner.hasTable('page_blocks'))) return;

    for (const page of pages) {
      const existing: Array<{ id: number }> = await queryRunner.query('SELECT id FROM pages WHERE slug = ? LIMIT 1', [page.slug]);
      if (existing.length) continue;

      const result: { insertId: number } = await queryRunner.query(
        'INSERT INTO pages (slug, title, meta_description, status, og_image_url) VALUES (?, ?, ?, ?, ?)',
        [page.slug, page.title, page.metaDescription, 'published', page.ogImageUrl]
      );

      for (const [sortOrder, block] of page.blocks.entries()) {
        await queryRunner.query(
          `INSERT INTO page_blocks
            (page_id, block_type, sort_order, heading_text, heading_level, paragraph_text, button_label, button_href)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            result.insertId,
            block.blockType,
            sortOrder,
            block.headingText ?? null,
            block.headingLevel ?? null,
            block.paragraphText ?? null,
            block.buttonLabel ?? null,
            block.buttonHref ?? null
          ]
        );
      }
    }

    if (!(await queryRunner.hasTable('menu_items'))) return;
    for (const [location, label, previousHref, nextHref] of menuUpdates) {
      await queryRunner.query(
        `UPDATE menu_items
         SET link_type = 'url', page_id = NULL, href = ?
         WHERE location = ? AND label = ? AND href = ?`,
        [nextHref, location, label, previousHref]
      );
    }
  }

  async down(): Promise<void> {
    // Intentionally preserve published content and administrator-managed navigation.
  }
}
