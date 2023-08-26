import { Exclude } from 'class-transformer';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Permission } from '../permissions/permission.entity';

@Entity({ name: 'Objects' })
export class Objects {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Exclude()
  @OneToMany(() => Permission, (permission: Permission) => permission.object)
  permissions: Permission[];
}
