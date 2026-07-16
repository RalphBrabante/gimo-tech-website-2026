import { MigrationInterface, QueryRunner } from 'typeorm';

const googleMapsUrl = 'https://www.google.com/maps/place/GIMO+Laboratory+Supplies/@14.3808892,121.0679065,15z/data=!4m6!3m5!1s0x3397d1d871eba07b:0x8ca7e1b4bd2d5c7a!8m2!3d14.3723706!4d121.0582515!16s%2Fg%2F11jgc0gmss?entry=ttu';

const newLocationContent = {
  tagline: 'Visit GIMO Laboratory Supplies',
  description: 'B2 L26 Diamond St., South 1 Camella Homes Annex, Brgy., San Pedro, Laguna 4023',
  ctaLabel: 'View on Google Maps',
  ctaHref: googleMapsUrl
};

const previousLocationContent = {
  tagline: 'Laboratory supply coordination',
  description: 'Syringe filters, custom biohazard bags, and QR code printing support',
  ctaLabel: 'Send requirements',
  ctaHref: '#contact'
};

export class IntegrateBusinessLocation1783773600000 implements MigrationInterface {
  name = 'IntegrateBusinessLocation1783773600000';

  async up(queryRunner: QueryRunner): Promise<void> {
    const rows: Array<{ content: string | Record<string, unknown> }> = await queryRunner.query(
      'SELECT content FROM homepage_sections WHERE section_key = ? LIMIT 1',
      ['location']
    );
    if (!rows.length) return;

    const current = typeof rows[0].content === 'string' ? JSON.parse(rows[0].content) : rows[0].content;
    await queryRunner.query(
      'UPDATE homepage_sections SET content = ? WHERE section_key = ?',
      [JSON.stringify({ ...current, ...newLocationContent }), 'location']
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const rows: Array<{ content: string | Record<string, unknown> }> = await queryRunner.query(
      'SELECT content FROM homepage_sections WHERE section_key = ? LIMIT 1',
      ['location']
    );
    if (!rows.length) return;

    const current = typeof rows[0].content === 'string' ? JSON.parse(rows[0].content) : rows[0].content;
    if (current.ctaHref !== googleMapsUrl) return;

    await queryRunner.query(
      'UPDATE homepage_sections SET content = ? WHERE section_key = ?',
      [JSON.stringify({ ...current, ...previousLocationContent }), 'location']
    );
  }
}
