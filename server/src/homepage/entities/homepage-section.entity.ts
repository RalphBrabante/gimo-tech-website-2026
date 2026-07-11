import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Entity({ name: 'homepage_sections' })
export class HomepageSectionEntity {
  @PrimaryColumn({ name: 'section_key', type: 'varchar', length: 40 })
  sectionKey: string;

  @Column({ type: 'json' })
  content: Record<string, unknown>;

  @Column({ name: 'updated_by_user_id', type: 'int', nullable: true })
  updatedByUserId: number | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'updated_by_user_id' })
  updatedBy: UserEntity | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
