import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { Roles } from './role.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Roles])],
  // controllers: [RolesController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
