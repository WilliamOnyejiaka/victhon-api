import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn, OneToOne,
    Index
} from "typeorm";
import MessageEntity from "./MessageEntity";

@Entity("message_attachments")
export default class MessageAttachment {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => MessageEntity, m => m.attachments, { onDelete: "CASCADE" })
    message: MessageEntity;

    @Column("text")
    url: string;

    @Column("text",{nullable: true})
    thumbnail: string | null;

    @Column("text",{nullable:true})
    duration: string | null;

    @Column("varchar")
    @Index()
    publicId: string;

    @Column("text")
    type: string;

    @Column("int")
    size: number;

    @CreateDateColumn()
    createdAt: Date;
}
