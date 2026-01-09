import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Unique, OneToMany,
} from "typeorm";
import {Professional} from "./Professional";
import {Transaction} from "./Transaction";

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
    @Column("decimal", {precision: 24, scale: 2})
    balance: number;

    /**
     * Funds on hold / in escrow (kobo)
     */
    @Column("decimal", {precision: 12, scale: 2})
    pendingAmount: number;

    /**
     * balance + pendingAmount (derived, stored for fast reads)
     */
    @Column("decimal", {precision: 12, scale: 2})
    totalBalance: number;

    // ✅ ONE escrow → MANY transactions
    @OneToMany(() => Transaction, (transaction) => transaction.wallet)
    transactions: Transaction[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
