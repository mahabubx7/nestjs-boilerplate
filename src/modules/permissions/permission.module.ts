import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './permission.entity';
import { RoleModule } from '../roles/role.module';

@Module({
  imports: [TypeOrmModule.forFeature([Permission]), RoleModule],
  providers: [PermissionService],
  exports: [PermissionService],
})
export class PermissionModule {}
