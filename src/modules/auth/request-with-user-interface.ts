import { Request } from 'express';
import { User } from 'src/modules/users/entities/user.entity';
interface RequestWithUser extends Request {
  user: User;
}

export default RequestWithUser;
