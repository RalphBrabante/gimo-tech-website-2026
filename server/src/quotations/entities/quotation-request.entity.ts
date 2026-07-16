import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

export type QuotationStatus = 'pending' | 'quoted';

export interface QuotationItemSnapshot {
  productId: number;
  name: string;
  sku: string;
  quantity: number;
  priceCents: number;
}

export interface FormalQuotation {
  lines: Array<{ name: string; sku: string; quantity: number; unitPriceCents: number }>;
  notes: string;
  validUntil: string | null;
}

@Entity({ name: 'quotation_requests' })
@Index('UQ_quotation_requests_number', ['requestNumber'], { unique: true })
@Index('IDX_quotation_requests_status_created', ['status', 'createdAt'])
export class QuotationRequestEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'request_number', type: 'varchar', length: 24, nullable: true })
  requestNumber: string | null;

  @Column({ name: 'customer_name', length: 160 })
  customerName: string;

  @Column({ name: 'company_name', type: 'varchar', length: 160, nullable: true })
  companyName: string | null;

  @Column({ name: 'customer_email', length: 254 })
  customerEmail: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 50, nullable: true })
  phoneNumber: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'json' })
  items: QuotationItemSnapshot[];

  @Column({ type: 'varchar', length: 16, default: 'pending' })
  status: QuotationStatus;

  @Column({ type: 'json', nullable: true })
  response: FormalQuotation | null;

  @Column({ name: 'responded_by_user_id', type: 'int', nullable: true })
  respondedByUserId: number | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'responded_by_user_id' })
  respondedBy: UserEntity | null;

  @Column({ name: 'quoted_at', type: 'timestamp', nullable: true })
  quotedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
