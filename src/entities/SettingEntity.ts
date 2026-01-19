import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Unique
} from "typeorm";
import { Professional } from "./Professional";

@Entity("settings")
@Unique(["professionalId"])
export class Setting {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ nullable: false })
    professionalId: string;

    @OneToOne(() => Professional, (professional) => professional.setting, {
        onDelete: "CASCADE",
    })
    @JoinColumn()
    professional: Professional;

    @Column("boolean", { default: true })
    bookingRequestsEnabled: boolean;

    @Column("boolean", { default: true })
    newMessagesEnabled: boolean;

    @Column("boolean", { default: true })
    paymentReceivedEnabled: boolean;

    @Column("boolean", { default: true })
    customerReviewsEnabled: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
