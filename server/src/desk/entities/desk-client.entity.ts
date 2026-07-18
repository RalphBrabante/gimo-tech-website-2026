import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { DeskMessageAssignmentEntity } from './desk-message-assignment.entity';

@Entity({ name: 'desk_clients' })
@Index('UQ_desk_clients_name', ['name'], { unique: true })
export class DeskClientEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 160 })
  name: string;

  @Column({ name: 'email_address', type: 'varchar', length: 254, nullable: true })
  emailAddress: string | null;

  @Column({ name: 'email_domain', type: 'varchar', length: 253, nullable: true })
  emailDomain: string | null;

  @OneToMany(() => DeskMessageAssignmentEntity, (assignment) => assignment.client)
  assignments: DeskMessageAssignmentEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
