import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { DeskClientEntity } from './desk-client.entity';

@Entity({ name: 'desk_message_assignments' })
@Index('UQ_desk_message_identity', ['mailboxResourceId', 'folder', 'messageUid'], { unique: true })
@Index('IDX_desk_message_client', ['clientId'])
export class DeskMessageAssignmentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'mailbox_resource_id', length: 160 })
  mailboxResourceId: string;

  @Column({ length: 255 })
  folder: string;

  @Column({ name: 'message_uid', length: 160 })
  messageUid: string;

  @Column({ name: 'client_id', type: 'int' })
  clientId: number;

  @ManyToOne(() => DeskClientEntity, (client) => client.assignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: DeskClientEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
