import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../directory/models/user.model';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private readonly userModel: typeof User) {}

  findAll() {
    return this.userModel.findAll({ order: [['created_at', 'DESC']] });
  }

  async findOne(id: string) {
    const user = await this.userModel.findByPk(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(dto: CreateUserDto) {
    return this.userModel.create({
      companyId: dto.companyId,
      email: dto.email,
      displayName: dto.displayName,
      role: dto.role,
      active: dto.active ?? true,
    } as any);
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findOne(id);
    await user.update(dto as any);
    return user;
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    await user.destroy();
    return { deleted: true };
  }
}
