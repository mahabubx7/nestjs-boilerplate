import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/users/user.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local', '.env.development'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configSrv: ConfigService) => ({
        type: 'postgres',
        host: configSrv.get<string>('DB_HOST'),
        port: +configSrv.get<number>('DB_PORT'),
        username: configSrv.get<string>('DB_USER'),
        password: configSrv.get<string>('DB_PASS'),
        database:
          configSrv.get<string>('NODE_ENV') === 'test'
            ? configSrv.get<string>('TEST_DB_NAME')
            : configSrv.get<string>('DB_NAME'),
        synchronize: configSrv.get<boolean>('DB_SYNC'),
        autoLoadEntities: true,
        logging: configSrv.get<boolean>('DB_LOGS'),
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
