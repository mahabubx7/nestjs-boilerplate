import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Objects } from '../objects/object.entity';
import { Roles } from '../roles/role.entity';
export interface PermissionCondition {}

@Entity({ name: 'Permissions' })
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  action: string;

  @ManyToMany(() => Roles, (roles: Roles) => roles.permissions, {
    cascade: true,
  })
  roles: Roles[];

  @Column({ type: 'json', name: 'conditions', default: null })
  conditions: 'json';

  @ManyToOne(() => Objects, (obj: Objects) => obj.id)
  object: Objects;

  public static parseCondition(condition: PermissionCondition, variables: Record<string, any>): PermissionCondition {
    if (!condition) return null;
    const parsedCondition = {};
    // console.log(Object.entries(condition));
    for (const [key, rawValue] of Object.entries(condition)) {
      if (rawValue !== null && typeof rawValue === 'object') {
        const value = this.parseCondition(rawValue, variables);
        parsedCondition[key] = value;
        continue;
      }
      if (typeof rawValue !== 'string') {
        parsedCondition[key] = rawValue;
        continue;
      }
      // find placeholder "${}""
      const matches = /^\\${([a-zA-Z0-9]+)}$/.exec(rawValue);

      if (!matches) {
        parsedCondition[key] = rawValue;
        //continue;
      }
      //console.log('Log 57 ', parsedCondition);
      //console.log('Log 59 ', { variables });
      //const value = variables[matches[1]];

      // if (typeof value === 'undefined') {
      //   throw new ReferenceError(`Variable ${name} is not defined`);
      // }
      parsedCondition[key] = variables;
    }
    //console.log(parsedCondition);
    return parsedCondition;
  }
}
