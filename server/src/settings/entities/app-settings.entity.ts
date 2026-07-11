import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Entity({ name: 'app_settings' })
export class AppSettingsEntity {
  @PrimaryColumn({ type: 'tinyint', unsigned: true })
  id: number;

  @Column({ name: 'currency_code', type: 'varchar', length: 3, default: 'USD' })
  currencyCode: string;

  @Column({ name: 'store_name', type: 'varchar', length: 160, default: 'Gimo Tech Supplies' })
  storeName: string;

  @Column({ name: 'support_email', type: 'varchar', length: 254, nullable: true })
  supportEmail: string | null;

  @Column({ name: 'free_shipping_threshold_cents', type: 'int', unsigned: true, nullable: true })
  freeShippingThresholdCents: number | null;

  @Column({ name: 'updated_by_user_id', type: 'int', nullable: true })
  updatedByUserId: number | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'updated_by_user_id' })
  updatedBy: UserEntity | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
