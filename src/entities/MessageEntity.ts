import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    OneToMany, OneToOne
} from "typeorm";
import MessageAttachment from "./MessageAttachment";
import {UserType} from "../types/constants";
import ChatEntity from "./ChatEntity";
import Inbox from "./InboxEntity";

export enum MessageType {
    TEXT = "text",
    FILE = "file",
}

export enum MessageStatus {
    FAILED = "failed",
    DELIVERED = "delivered",
    PENDING = "pending",
    READ = "read"
}

@Entity("messages")
export default class Message {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    @Index()
    chatId: string;

    @ManyToOne(() => ChatEntity, {onDelete: "CASCADE"})
    chat: ChatEntity;

    @Column("uuid")
    @Index()
    senderId: string;

    @Column({
        type: "enum",
        enum: UserType,
    })
    @Index()
    senderType: UserType;

    @Column("uuid")
    @Index()
    receiverId: string;

    @Column({
        type: "enum",
        enum: UserType,
    })
    @Index()
    receiverType: UserType;

    @Column("text", {nullable: true})
    content: string | null;

    @Column({
        type: "enum",
        enum: MessageType,
        default: MessageType.TEXT,
    })
    type: MessageType;

    @Column({
        type: "enum",
        enum: MessageStatus,
        default: MessageStatus.PENDING,
    })
    status: MessageStatus;

    @OneToMany(() => MessageAttachment, a => a.message, {cascade: true})
    attachments: MessageAttachment[];

    @ManyToOne(() => Inbox, i => i.message, {nullable: true, onDelete: "CASCADE"})
    inbox: Inbox;

    @CreateDateColumn()
    @Index()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
