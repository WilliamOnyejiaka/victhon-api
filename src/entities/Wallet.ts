import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
} from "typeorm";
import {Professional} from "./Professional";

@Entity("wallets")
@Unique(["professionalId"])
export class Wallet {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    // ONE wallet per user
    @Column({nullable: false})
    professionalId: string;

    @OneToOne(() => Professional, (professional) => professional.wallet, {
        onDelete: "CASCADE",
    })
    @JoinColumn()
    professional: Professional;

    /**
     * Available balance (kobo)
     */
    @Column("bigint", {default: 0})
    balance: number;

    /**
     * Funds on hold / in escrow (kobo)
     */
    @Column("bigint", {default: 0})
    pendingAmount: number;

    /**
     * balance + pendingAmount (derived, stored for fast reads)
     */
    @Column("bigint", {default: 0})
    totalBalance: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
