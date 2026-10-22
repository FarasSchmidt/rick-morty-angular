import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface AuthRequest {
  headers: { authorization?: string };
  userId: string;
}

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const match = /^Bearer ([^\s]+)$/i.exec(request.headers.authorization ?? '');
    if (!match) throw new UnauthorizedException('Iniciá sesión para continuar.');
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(match[1], { algorithms: ['HS256'] });
      if (typeof payload.sub !== 'string') throw new Error();
      request.userId = payload.sub;
      return true;
    } catch {
      throw new UnauthorizedException('Sesión inválida o vencida.');
    }
  }
}
