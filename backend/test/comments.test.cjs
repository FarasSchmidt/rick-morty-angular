require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Types } = require('mongoose');
const { ValidationPipe } = require('@nestjs/common');
const { CommentsService } = require('../dist/comments/comments.service');
const { CreateCommentDto, CommentVisibilityDto } = require('../dist/comments/comment.dto');
const { UpdateProfileDto } = require('../dist/auth/auth.dto');

const ownerId = new Types.ObjectId().toString();
const otherId = new Types.ObjectId().toString();
const adminId = new Types.ObjectId().toString();
const commentId = new Types.ObjectId().toString();

function setup() {
  const comment = { id: commentId, author: new Types.ObjectId(ownerId), hidden: false, text: 'Demo',
    save: async () => {}, deleteOne: async () => { comment.deleted = true; } };
  let observedFilter;
  const users = { findById: id => ({ exec: async () => ({ _id: new Types.ObjectId(id), role: id === adminId ? 'admin' : 'user' }) }) };
  const query = { sort: () => query, skip: () => query, limit: () => query, populate: () => query, exec: async () => [] };
  const comments = {
    findById: () => ({ exec: async () => comment }),
    find: filter => { observedFilter = filter; return query; },
    countDocuments: () => ({ exec: async () => 0 }),
    create: async data => ({ ...data, id: commentId }),
  };
  return { service: new CommentsService(comments, users), comment, filter: () => observedFilter };
}

test('owners may hide, restore and delete their own comment', async () => {
  const { service, comment } = setup();
  await service.setVisibility(commentId, ownerId, true);
  assert.equal(comment.hidden, true);
  await service.setVisibility(commentId, ownerId, false);
  assert.equal(comment.hidden, false);
  await service.remove(commentId, ownerId);
  assert.equal(comment.deleted, true);
});

test('admins may moderate any comment, other users are rejected', async () => {
  const { service, comment } = setup();
  await assert.rejects(service.setVisibility(commentId, otherId, true), { status: 403 });
  await assert.rejects(service.remove(commentId, otherId), { status: 403 });
  assert.equal(comment.hidden, false);
  await service.setVisibility(commentId, adminId, true);
  await service.remove(commentId, adminId);
  assert.equal(comment.deleted, true);
});

test('list filters hidden comments in MongoDB before applying pagination', async () => {
  const { service, filter } = setup();
  await service.list(1, otherId, 1);
  assert.equal(filter().characterId, 1);
  assert.equal(filter().$or[0].hidden, false);
  assert.equal(filter().$or[1].author.toString(), otherId);
  await service.list(1, adminId, 1);
  assert.deepEqual(filter(), { characterId: 1 });
  await assert.rejects(service.list(0, ownerId, 1), { status: 400 });
  await assert.rejects(service.list(1, ownerId, 0), { status: 400 });
});

test('creation uses the authenticated account and cannot accept author or moderation fields', async () => {
  const { service } = setup();
  assert.equal((await service.create(1, ownerId, 'Hello')).id, commentId);
  const pipe = new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true });
  const meta = { type: 'body', metatype: CreateCommentDto };
  assert.equal((await pipe.transform({ text: ' Hello ' }, meta)).text, 'Hello');
  for (const body of [{ text: ' ' }, { text: 'X'.repeat(2001) }, { text: 'Hello', author: adminId }, { text: 'Hello', hidden: true }]) {
    await assert.rejects(pipe.transform(body, meta));
  }
  await assert.rejects(pipe.transform({ hidden: 'true' }, { type: 'body', metatype: CommentVisibilityDto }));
});

test('avatar validation accepts removal and rejects SVG, remote URLs and oversized data', async () => {
  const pipe = new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true });
  const meta = { type: 'body', metatype: UpdateProfileDto };
  await pipe.transform({ name: 'Demo', profilePhoto: '' }, meta);
  for (const photo of ['https://example.com/image.jpg', 'data:image/svg+xml;base64,AAAA', null, 'data:image/jpeg;base64,' + 'A'.repeat(180000)]) {
    await assert.rejects(pipe.transform({ name: 'Demo', profilePhoto: photo }, meta));
  }
});
