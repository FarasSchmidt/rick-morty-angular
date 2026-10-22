import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { validateEnvironment } from './config/environment';
import { HealthController } from './health.controller';
import { setServers } from 'node:dns';
import { AuthModule } from './auth/auth.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [
    AuthModule,
    CommentsModule,
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const servers = config.get<string>('DNS_SERVERS');
        if (servers) setServers(servers.split(',').map(server => server.trim()));
        return {
        uri: config.getOrThrow<string>('MONGODB_URI'),
        dbName: config.getOrThrow<string>('MONGODB_DB'),
        serverSelectionTimeoutMS: 10000,
        retryAttempts: 1,
        };
      },
    }),
  ],
  controllers: [HealthController],
})
export class AppModule {}
