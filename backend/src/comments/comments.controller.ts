import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthRequest, JwtGuard } from '../auth/jwt.guard';
import { CommentsService } from './comments.service';
import { CommentVisibilityDto, CreateCommentDto } from './comment.dto';

@Controller()
@UseGuards(JwtGuard)
export class CommentsController {
  constructor(private readonly comments: CommentsService) {}

  @Get('characters/:characterId/comments')
  list(@Param('characterId', ParseIntPipe) id: number, @Req() request: AuthRequest, @Query('page') page?: string) {
    return this.comments.list(id, request.userId, page === undefined ? 1 : Number(page));
  }

  @Post('characters/:characterId/comments')
  create(@Param('characterId', ParseIntPipe) id: number, @Req() request: AuthRequest, @Body() input: CreateCommentDto) {
    return this.comments.create(id, request.userId, input.text);
  }

  @Patch('comments/:id/visibility')
  visibility(@Param('id') id: string, @Req() request: AuthRequest, @Body() input: CommentVisibilityDto) {
    return this.comments.setVisibility(id, request.userId, input.hidden);
  }

  @Delete('comments/:id')
  remove(@Param('id') id: string, @Req() request: AuthRequest) { return this.comments.remove(id, request.userId); }
}
