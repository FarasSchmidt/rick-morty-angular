require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { JwtService } = require('@nestjs/jwt');
const { ValidationPipe } = require('@nestjs/common');
const { Types } = require('mongoose');
const { hashPassword, verifyPassword } = require('../dist/auth/password');
const { AuthService } = require('../dist/auth/auth.service');
const { JwtGuard } = require('../dist/auth/jwt.guard');
const { RegisterDto, UpdateProfileDto } = require('../dist/auth/auth.dto');

test('password hashes use random salts and reject wrong passwords or malformed hashes', async () => {
  const first = await hashPassword('Test-password-123');
  assert.notEqual(first, await hashPassword('Test-password-123'));
  assert.equal(await verifyPassword('Test-password-123', first), true);
  assert.equal(await verifyPassword('wrong', first), false);
  assert.equal(await verifyPassword('wrong', 'invalid'), false);
});

test('registration normalizes input and rejects role escalation', async () => {
  const pipe = new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true });
  const metadata = { type: 'body', metatype: RegisterDto };
  const input = { name: ' Demo ', email: ' DEMO@EXAMPLE.COM ', password: 'password123' };
  const dto = await pipe.transform(input, metadata);
  assert.equal(dto.email, 'demo@example.com');
  assert.equal(dto.name, 'Demo');
  await assert.rejects(pipe.transform({ ...input, role: 'admin' }, metadata));
  await assert.rejects(pipe.transform({ ...input, name: ' ', password: '123' }, metadata));
});

test('register/login hide password hashes and handle duplicate and invalid credentials', async () => {
  const id = new Types.ObjectId().toString();
  let saved;
  const users = {
    create: async value => { saved = { ...value, id }; return saved; },
    findOne: () => ({ select: () => ({ exec: async () => saved }) }),
    findById: () => ({ exec: async () => saved }),
  };
  const jwt = new JwtService({ secret: 'test-only-secret-of-more-than-32-characters', signOptions: { expiresIn: '1d' } });
  const auth = new AuthService(users, jwt);
  const input = { name: 'Demo', email: 'demo@example.com', password: 'password123' };
  const registered = await auth.register(input);
  assert.equal(registered.user.passwordHash, undefined);
  assert.equal(saved.password, undefined);
  assert.equal(await verifyPassword(input.password, saved.passwordHash), true);
  const session = await auth.login(input);
  assert.equal(jwt.verify(session.token).sub, id);
  assert.equal(session.user.passwordHash, undefined);
  await assert.rejects(auth.login({ ...input, password: 'wrong123' }), { status: 401 });
  assert.equal((await auth.profile(id)).user.email, input.email);
  users.create = async () => { throw { code: 11000 }; };
  await assert.rejects(auth.register(input), { status: 409 });
  saved = null;
  await assert.rejects(auth.login(input), { status: 401 });
  await assert.rejects(auth.profile(id), { status: 401 });
});

test('guard accepts signed tokens and rejects missing, expired and altered tokens', async () => {
  const jwt = new JwtService({ secret: 'test-only-secret-of-more-than-32-characters' });
  const guard = new JwtGuard(jwt);
  const request = { headers: {} };
  const context = { switchToHttp: () => ({ getRequest: () => request }) };
  await assert.rejects(guard.canActivate(context), { status: 401 });
  const token = jwt.sign({ sub: 'test-id' }, { expiresIn: '1d' });
  request.headers.authorization = 'Bearer ' + token;
  assert.equal(await guard.canActivate(context), true);
  assert.equal(request.userId, 'test-id');
  request.headers.authorization = 'Bearer ' + token + 'invalid';
  await assert.rejects(guard.canActivate(context), { status: 401 });
  request.headers.authorization = 'Bearer ' + jwt.sign({ sub: 'test-id' }, { expiresIn: -1 });
  await assert.rejects(guard.canActivate(context), { status: 401 });
});

test('profile requires the current password and persists the replacement hash', async () => {
  const id = new Types.ObjectId().toString();
  const user = { id, name: 'Demo', email: 'demo@example.com', role: 'user',
    passwordHash: await hashPassword('original123'), save: async () => {} };
  const query = { exec: async () => user };
  const users = { findById: () => ({ ...query, select: () => query }) };
  const auth = new AuthService(users, new JwtService());
  const original = user.passwordHash;
  await assert.rejects(auth.updateProfile(id, { name: 'Changed', currentPassword: 'wrong123', newPassword: 'new12345' }), { status: 401 });
  assert.equal(user.name, 'Demo');
  assert.equal(user.passwordHash, original);
  const response = await auth.updateProfile(id, { name: 'Changed', currentPassword: 'original123', newPassword: 'new12345' });
  assert.equal(response.user.name, 'Changed');
  assert.equal(response.user.passwordHash, undefined);
  assert.equal(await verifyPassword('new12345', user.passwordHash), true);
  assert.equal(await verifyPassword('original123', user.passwordHash), false);
  const updated = user.passwordHash;
  await auth.updateProfile(id, { name: 'Renamed' });
  assert.equal(user.passwordHash, updated);
});

test('profile DTO rejects incomplete password changes and client-selected user ids', async () => {
  const pipe = new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true });
  const metadata = { type: 'body', metatype: UpdateProfileDto };
  await pipe.transform({ name: 'Demo' }, metadata);
  await assert.rejects(pipe.transform({ name: 'Demo', newPassword: 'new12345' }, metadata));
  await assert.rejects(pipe.transform({ name: 'Demo', currentPassword: 'old12345' }, metadata));
  await assert.rejects(pipe.transform({ name: 'Demo', id: 'someone-else' }, metadata));
});
