import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../models/user.model';

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

  findAll(companyId?: string) {
    return this.users.findAll({
      where: companyId ? { companyId } : undefined,
      order: [['created_at', 'DESC']],
    });
  }

  findOne(id: string) {
    return this.users.findByPk(id);
  }
  update(id: string, data: Partial<User>) {
    return this.users.update(data, { where: { id } });
  }
  async remove(id: string) {
    const user = await this.findById(id);
    await user.update({ active: false } as any);
    return { deactivated: true };
  }
}
