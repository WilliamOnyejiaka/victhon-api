import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany, OneToOne
} from "typeorm";
import ChatParticipant from "./ChatParticipant";
import Message from "./MessageEntity";


@Entity("chats")
export default class ChatEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @OneToMany(() => ChatParticipant, p => p.chat)
    participants: ChatParticipant[];

    @OneToMany(() => Message, m => m.chat)
    messages: Message[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
