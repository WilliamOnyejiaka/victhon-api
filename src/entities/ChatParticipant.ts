import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    Index
} from "typeorm";
import { User } from "./User";
import Chat  from "./ChatEntity";
import {Professional} from "./Professional";

@Entity("chat_participants")
export default class ChatParticipant {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => Chat, c => c.participants, { onDelete: "CASCADE" })
    chat: Chat;

    @ManyToOne(() => User, u => u.chatParticipants, { onDelete: "SET NULL" })
    user: User;

    @ManyToOne(() => Professional, p => p.chatParticipants, { onDelete: "SET NULL" })
    professional: Professional;

    @Column({ nullable: true })
    professionalId?: string;

    @Column({ nullable: true })
    userId?: string;

    @Column({ type: 'int', default: 0 })
    unreadCount: number;

    @Column({ type: 'timestamp', nullable: true })
    lastReadAt?: Date;

    @CreateDateColumn()
    joinedAt: Date;
}
