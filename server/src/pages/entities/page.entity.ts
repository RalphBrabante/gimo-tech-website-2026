import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { PageBlockEntity } from './page-block.entity';

export type PageStatus = 'draft' | 'published';

@Entity({ name: 'pages' })
@Index('UQ_pages_slug', ['slug'], { unique: true })
export class PageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 160 })
  slug: string;

  @Column({ length: 200 })
  title: string;

  @Column({ name: 'meta_description', type: 'varchar', length: 300, nullable: true })
  metaDescription: string | null;

  @Column({ type: 'enum', enum: ['draft', 'published'], default: 'draft' })
  status: PageStatus;

  @Column({ name: 'og_image_url', type: 'varchar', length: 2048, nullable: true })
  ogImageUrl: string | null;

  @OneToMany(() => PageBlockEntity, (block) => block.page)
  blocks: PageBlockEntity[];

  @Column({ name: 'created_by_user_id', type: 'int', nullable: true })
  createdByUserId: number | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by_user_id' })
  createdBy: UserEntity | null;

  @Column({ name: 'updated_by_user_id', type: 'int', nullable: true })
  updatedByUserId: number | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'updated_by_user_id' })
  updatedBy: UserEntity | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
