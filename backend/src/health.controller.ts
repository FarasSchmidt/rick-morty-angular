import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  async check() {
    try {
      if (!this.connection.db) throw new Error();
      await this.connection.db.command({ ping: 1 });
      return { status: 'ok', database: 'connected' };
    } catch {
      throw new ServiceUnavailableException('La base de datos no está disponible.');
    }
  }
}
