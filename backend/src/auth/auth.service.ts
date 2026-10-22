import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { isValidObjectId, Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { LoginDto, RegisterDto, UpdateProfileDto } from './auth.dto';
import { hashPassword, verifyPassword } from './password';

@Injectable()
export class AuthService {
  private readonly dummyHash = hashPassword('dummy-password-for-login-timing');

  constructor(@InjectModel(User.name) private readonly users: Model<User>, private readonly jwt: JwtService) {}

  async register(input: RegisterDto) {
    try {
      const user = await this.users.create({
        name: input.name, email: input.email, passwordHash: await hashPassword(input.password), role: 'user',
      });
      return { user: this.publicUser(user) };
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
        throw new ConflictException('Ese correo ya está registrado.');
      }
      throw error;
    }
  }

  async login(input: LoginDto) {
    const user = await this.users.findOne({ email: input.email }).select('+passwordHash').exec();
    const valid = await verifyPassword(input.password, user?.passwordHash ?? await this.dummyHash);
    if (!user || !valid) throw new UnauthorizedException('Correo o contraseña incorrectos.');
    const token = await this.jwt.signAsync({ sub: user.id });
    return { user: this.publicUser(user), token };
  }

  async profile(id: string) {
    if (!isValidObjectId(id)) throw new UnauthorizedException('Sesión inválida.');
    const user = await this.users.findById(id).exec();
    if (!user) throw new UnauthorizedException('Sesión inválida.');
    return { user: this.publicUser(user) };
  }

  async updateProfile(id: string, input: UpdateProfileDto) {
    if (!isValidObjectId(id)) throw new UnauthorizedException('Sesión inválida.');
    const user = await this.users.findById(id).select('+passwordHash').exec();
    if (!user) throw new UnauthorizedException('Sesión inválida.');
    if (input.newPassword !== undefined) {
      if (!input.currentPassword || !await verifyPassword(input.currentPassword, user.passwordHash)) {
        throw new UnauthorizedException('La contraseña actual es incorrecta.');
      }
      user.passwordHash = await hashPassword(input.newPassword);
    }
    user.name = input.name;
    if (input.profilePhoto !== undefined) {
      if (input.profilePhoto) {
        const image = Buffer.from(input.profilePhoto.split(',')[1], 'base64');
        if (image.length < 4 || image[0] !== 0xff || image[1] !== 0xd8 || image[2] !== 0xff) {
          throw new BadRequestException('La foto debe ser una imagen JPEG válida.');
        }
      }
      user.profilePhoto = input.profilePhoto;
    }
    await user.save();
    return { user: this.publicUser(user) };
  }

  private publicUser(user: UserDocument) {
    return { id: user.id as string, name: user.name, email: user.email, role: user.role, profilePhoto: user.profilePhoto ?? '' };
  }
}
