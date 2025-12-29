import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
    Unique,
    JoinColumn,
    OneToOne,
} from "typeorm";
import { Booking } from "./Booking";
import { Transaction } from "./Transaction";

export enum EscrowStatus {
    PENDING = "pending",
    PAYMENT_INITIATED = "paymentInitiated",
    PAID = "paid",
    RELEASED = "released",
    DISPUTED = "disputed",
    CANCELLED = "cancelled",
}

export enum RefundStatus {
    NONE = "none",          // default – no refund requested
    PENDING = "pending",    // refund initiated, waiting for Paystack
    PROCESSING = "processing", // Paystack acknowledged, still processing
    SUCCESS = "success",    // refund completed
    FAILED = "failed",      // refund failed
}

@Entity("escrows")
export class Escrow {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @OneToOne(() => Booking, booking => booking.escrow, {
        onDelete: "CASCADE",
    })
    booking: Booking;


    @Column("decimal", { precision: 12, scale: 2 })
    amount: number;

    @Column({
        type: "enum",
        enum: EscrowStatus,
        default: EscrowStatus.PENDING,
    })
    status: EscrowStatus;

    @Column({
        type: "enum",
        enum: RefundStatus,
        default: RefundStatus.NONE,
    })
    refundStatus: RefundStatus;

    @Column({ type: "text", nullable: true })
    description?: string;

    // ✅ ONE escrow → MANY transactions
    @OneToMany(() => Transaction, (transaction) => transaction.escrow)
    transactions: Transaction[];

    @CreateDateColumn()
    createdAt: Date;
}
