import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('health_records')
export class HealthRecord {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column({ name: 'pet_id' })
    petId: string;

    @Column()
    type: 'vaccine' | 'consultation' | 'deworming' | 'analysis' | 'other';

    @Column()
    date: Date;

    @Column()
    title: string;

    @Column({nullable: true})
    description?: string;

    @Column({ nullable: true})
    doctor?: string;

    @Column({nullable: true})
    clinic?: string;

    @Column('simple-array', {name: 'media_ids', nullable: true})
    mediaIds?: string[];

    @Column({ name: 'has_next_visit', type: 'boolean', default: false })
    hasNextVisit: boolean;

    @Column({ name: 'next_visit_date', type: 'timestamp', nullable: true })
    nextVisitDate?: Date | null;

    @CreateDateColumn({name: 'created_at'})
    createdAt: Date;

    @UpdateDateColumn({name: 'updated_at'})
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', nullable: true })
    deletedAt?: Date | null;
}
