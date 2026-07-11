import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { PageEntity } from '../../pages/entities/page.entity';

export type MenuLocation = 'header' | 'footer_products' | 'footer_services' | 'footer_purchasing';
export type MenuLinkType = 'page' | 'url' | 'anchor';

@Entity({ name: 'menu_items' })
@Index('IDX_menu_items_location_sort', ['location', 'sortOrder'])
export class MenuItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ['header', 'footer_products', 'footer_services', 'footer_purchasing'] })
  location: MenuLocation;

  @Column({ length: 120 })
  label: string;

  @Column({ name: 'link_type', type: 'enum', enum: ['page', 'url', 'anchor'] })
  linkType: MenuLinkType;

  @Column({ name: 'page_id', type: 'int', nullable: true })
  pageId: number | null;

  @ManyToOne(() => PageEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'page_id' })
  page: PageEntity | null;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  href: string | null;

  @Column({ name: 'open_in_new_tab', default: false })
  openInNewTab: boolean;

  @Column({ name: 'sort_order', type: 'smallint', unsigned: true, default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
