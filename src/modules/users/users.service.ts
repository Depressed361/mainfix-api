import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../directory/models/user.model';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private users: typeof User) {}

  findByEmail(email: string) {
    return this.users.findOne({ where: { email } });
  }

  create(data: Partial<User>) {
    return this.users.create(data as User);
  }

  async findById(id: string) {
    const user = await this.users.findByPk(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  findAll() {
    return this.users.findAll();
  }

  findOne(id: string) {
    return this.users.findByPk(id);
  }
  update(id: string, data: Partial<User>) {
    return this.users.update(data, { where: { id } });
  }
  remove(id: string) {
    return this.users.destroy({ where: { id } });
  }
}
