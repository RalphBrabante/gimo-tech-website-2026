import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'products' })
@Index('IDX_products_category', ['category'])
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 160 })
  name: string;

  @Column({ length: 80 })
  category: string;

  @Column({ name: 'price_cents', type: 'int', unsigned: true })
  priceCents: number;

  @Column({ type: 'decimal', precision: 2, scale: 1, transformer: {
    to: (value: number) => value,
    from: (value: string) => Number(value)
  } })
  rating: number;

  @Column({ length: 7 })
  accent: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
