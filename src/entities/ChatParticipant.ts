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

    @CreateDateColumn()
    joinedAt: Date;
}
