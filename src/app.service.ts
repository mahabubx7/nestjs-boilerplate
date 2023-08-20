import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    return {
      message: 'Hello! from NestJs (v10) boilerplate',
    };
  }
}
