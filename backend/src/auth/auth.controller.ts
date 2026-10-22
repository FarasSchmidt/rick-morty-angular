import { Body, Controller, Get, HttpCode, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, UpdateProfileDto } from './auth.dto';
import { AuthRequest, JwtGuard } from './jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() input: RegisterDto) { return this.auth.register(input); }

  @Post('login')
  @HttpCode(200)
  login(@Body() input: LoginDto) { return this.auth.login(input); }

  @Get('profile')
  @UseGuards(JwtGuard)
  profile(@Req() request: AuthRequest) { return this.auth.profile(request.userId); }

  @Put('profile')
  @UseGuards(JwtGuard)
  updateProfile(@Req() request: AuthRequest, @Body() input: UpdateProfileDto) {
    return this.auth.updateProfile(request.userId, input);
  }
}
