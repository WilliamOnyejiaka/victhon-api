import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn, OneToOne, Index, OneToMany, ManyToOne, JoinColumn
} from "typeorm";
import MessageEntity from "./MessageEntity";
import {UserType} from "../types/constants";

@Entity("inboxes")
@Index(["receiverId", "receiverType"])
export default class Inbox {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column("uuid")
    @Index()
    receiverId: string;

    @Column({
        type: "enum",
        enum: UserType,
    })
    @Index()
    receiverType: UserType;

    @ManyToOne(() => MessageEntity, { eager: true, onDelete: "CASCADE" })
    @JoinColumn({ name: "messageId" })
    message: MessageEntity;

    @CreateDateColumn()
    createdAt: Date;
}
