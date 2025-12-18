import "reflect-metadata"
import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
    Index,
    Unique,
    JoinColumn,
    PrimaryGeneratedColumn
} from 'typeorm';
import { Review } from "./Review";

export interface PhotoField {
    url: string;
    publicId: string;
}

export interface Geometry {
    type: "Point"
    coordinates: [Number, Number]
}

export enum AuthProvider {
    LOCAL = "local",
    GOOGLE = "google"
}


@Entity('users')
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: 'varchar', length: 50, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
    phone: string;

    @Column({ type: 'text', nullable: true })
    password: string;

    @Column({ type: 'varchar', length: 50 })
    firstName: string;

    @Column({ type: 'varchar', length: 50 })
    lastName: string;

    @Column({ type: 'json', nullable: true })
    profilePicture?: PhotoField;

    @Column({
        type: "enum",
        enum: AuthProvider,
        default: AuthProvider.LOCAL,
    })
    authProvider: string;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'boolean', default: false })
    isVerified: boolean;

    @OneToMany(() => Review, review => review.user, { cascade: true })
    reviews: Review[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
