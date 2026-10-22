import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../auth/user.schema';

@Schema({ timestamps: true, collection: 'comments' })
export class Comment {
  @Prop({ required: true, min: 1 })
  characterId!: number;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  author!: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 2000 })
  text!: string;

  @Prop({ default: false })
  hidden!: boolean;

  createdAt!: Date;
}

export type CommentDocument = HydratedDocument<Comment>;
export const CommentSchema = SchemaFactory.createForClass(Comment);
CommentSchema.index({ characterId: 1, createdAt: -1, _id: -1 });
