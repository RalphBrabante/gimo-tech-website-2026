import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PageEntity } from './page.entity';

export type PageBlockType = 'heading' | 'paragraph' | 'image' | 'button';

@Entity({ name: 'page_blocks' })
@Index('IDX_page_blocks_page_sort', ['pageId', 'sortOrder'])
export class PageBlockEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'page_id', type: 'int' })
  pageId: number;

  @ManyToOne(() => PageEntity, (page) => page.blocks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'page_id' })
  page: PageEntity;

  @Column({ name: 'block_type', type: 'enum', enum: ['heading', 'paragraph', 'image', 'button'] })
  blockType: PageBlockType;

  @Column({ name: 'sort_order', type: 'smallint', unsigned: true, default: 0 })
  sortOrder: number;

  @Column({ name: 'heading_text', type: 'varchar', length: 200, nullable: true })
  headingText: string | null;

  @Column({ name: 'heading_level', type: 'tinyint', nullable: true })
  headingLevel: number | null;

  @Column({ name: 'paragraph_text', type: 'text', nullable: true })
  paragraphText: string | null;

  @Column({ name: 'image_url', type: 'varchar', length: 2048, nullable: true })
  imageUrl: string | null;

  @Column({ name: 'image_alt', type: 'varchar', length: 300, nullable: true })
  imageAlt: string | null;

  @Column({ name: 'button_label', type: 'varchar', length: 100, nullable: true })
  buttonLabel: string | null;

  @Column({ name: 'button_href', type: 'varchar', length: 2048, nullable: true })
  buttonHref: string | null;
}
