import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: any) {
    const existing = await this.userModel.findOne({
      $or: [
        ...(createUserDto.email ? [{ email: createUserDto.email }] : []),
        ...(createUserDto.mobile ? [{ mobile: createUserDto.mobile }] : []),
      ],
    });

    if (existing) {
      throw new ConflictException('User with this email or mobile already exists');
    }

    if (createUserDto.password) {
      createUserDto.password = await bcrypt.hash(createUserDto.password, 12);
    }

    return this.userModel.create(createUserDto);
  }

  async findAll(query: any = {}) {
    const { page = 1, limit = 20, role, branchId, search } = query;
    const filter: any = {};

    if (role) filter.role = role;
    if (branchId) filter.branchId = branchId;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select('-password -resetPasswordToken -resetPasswordExpires')
        .populate('branchId', 'name')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      this.userModel.countDocuments(filter),
    ]);

    return { users, total, page: Number(page), limit: Number(limit) };
  }

  async findById(id: string) {
    const user = await this.userModel
      .findById(id)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .populate('branchId', 'name')
      .lean();

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, updateDto: any) {
    if (updateDto.password) {
      updateDto.password = await bcrypt.hash(updateDto.password, 12);
    }

    const user = await this.userModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .lean();

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async delete(id: string) {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );
    if (!user) throw new NotFoundException('User not found');
    return { success: true, message: 'User deactivated' };
  }
}
