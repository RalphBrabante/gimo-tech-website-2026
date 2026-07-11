import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { ProductImageEntity } from './product-image.entity';

@Entity({ name: 'products' })
@Index('IDX_products_category', ['category'])
@Index('UQ_products_sku', ['sku'], { unique: true })
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 160 })
  name: string;

  @Column({ length: 64 })
  sku: string;

  @Column({ length: 80 })
  category: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'price_cents', type: 'int', unsigned: true })
  priceCents: number;

  @Column({ type: 'decimal', precision: 2, scale: 1, transformer: {
    to: (value: number) => value,
    from: (value: string) => Number(value)
  } })
  rating: number;

  @Column({ length: 7 })
  accent: string;

  @Column({ name: 'image_url', type: 'varchar', length: 2048, nullable: true })
  imageUrl: string | null;

  @OneToMany(() => ProductImageEntity, (image) => image.product)
  images: ProductImageEntity[];

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

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
