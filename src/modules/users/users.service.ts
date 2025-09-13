import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../directory/models/user.model';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private users: typeof User) {}

  findByEmail(email: string) {
    return this.users.findOne({ where: { email } });
  }

  create(data: Partial<User>) {
    return this.users.create(data as Optional<User, NullishPropertiesOf<User>>);
  }

  findById(id: string) {
    return this.users.findByPk(id);
  }
}
