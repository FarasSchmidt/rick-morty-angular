import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { User } from '../auth/user.schema';
import { Comment, CommentDocument } from './comment.schema';

@Injectable()
export class CommentsService {
  constructor(@InjectModel(Comment.name) private readonly comments: Model<Comment>,
    @InjectModel(User.name) private readonly users: Model<User>) {}

  // Read the role from MongoDB on each request, never from client-provided data.
  private async actor(userId: string) {
    if (!isValidObjectId(userId)) throw new UnauthorizedException();
    const user = await this.users.findById(userId).exec();
    if (!user) throw new UnauthorizedException();
    return user;
  }

  private validateCharacter(id: number): void {
    if (!Number.isSafeInteger(id) || id < 1) throw new BadRequestException('Personaje inválido.');
  }

  async list(characterId: number, userId: string, page: number) {
    this.validateCharacter(characterId);
    if (!Number.isSafeInteger(page) || page < 1 || page > 10000) throw new BadRequestException('Página inválida.');
    const actor = await this.actor(userId);
    const filter = actor.role === 'admin' ? { characterId } : {
      characterId, $or: [{ hidden: false }, { author: actor._id }],
    };
    const [items, total] = await Promise.all([
      this.comments.find(filter).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * 20).limit(20)
        .populate('author', 'name profilePhoto').exec(),
      this.comments.countDocuments(filter).exec(),
    ]);
    return {
      comments: items.map(item => this.present(item, userId, actor.role)),
      hasMore: page * 20 < total, total,
    };
  }

  async create(characterId: number, userId: string, text: string) {
    this.validateCharacter(characterId);
    const actor = await this.actor(userId);
    const comment = await this.comments.create({ characterId, author: actor._id, text, hidden: false });
    return { id: comment.id };
  }

  private async manageable(id: string, userId: string) {
    if (!isValidObjectId(id)) throw new NotFoundException('Comentario no encontrado.');
    const actor = await this.actor(userId);
    const comment = await this.comments.findById(id).exec();
    if (!comment) throw new NotFoundException('Comentario no encontrado.');
    if (actor.role !== 'admin' && comment.author.toString() !== userId) {
      throw new ForbiddenException('No tenés permiso para modificar este comentario.');
    }
    return comment;
  }

  async setVisibility(id: string, userId: string, hidden: boolean) {
    const comment = await this.manageable(id, userId);
    comment.hidden = hidden;
    await comment.save();
    return { success: true };
  }

  async remove(id: string, userId: string) {
    const comment = await this.manageable(id, userId);
    await comment.deleteOne();
    return { success: true };
  }

  private present(comment: CommentDocument, userId: string, role: string) {
    const author = comment.author as unknown as { _id: { toString(): string }; name: string; profilePhoto?: string } | null;
    const authorId = author?._id.toString() ?? '';
    return {
      id: comment.id as string, text: comment.text, hidden: comment.hidden,
      createdAt: comment.createdAt,
      author: { id: authorId, name: author?.name ?? 'Usuario eliminado', profilePhoto: author?.profilePhoto ?? '' },
      canManage: role === 'admin' || authorId === userId,
    };
  }
}
