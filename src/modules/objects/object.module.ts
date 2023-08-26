import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { ObjectsController } from './objects.controller';
import { Objects } from './object.entity';
// import { ObjectsService } from './object.service';

@Module({
  imports: [TypeOrmModule.forFeature([Objects])],
  // controllers: [ObjectsController],
  // providers: [ObjectsService],
})
export class ObjectModule {}
