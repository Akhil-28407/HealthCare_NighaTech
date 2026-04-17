import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: any, creator?: any) {
    // Role Restrictions
    if (creator) {
      const { role: creatorRole, branchId: creatorBranchId } = creator;
      const targetRole = createUserDto.role;

      // ADMIN cannot create SUPER_ADMIN or ADMIN
      if (creatorRole === 'ADMIN' && (targetRole === 'SUPER_ADMIN' || targetRole === 'ADMIN')) {
        throw new ConflictException('Admin cannot create Super Admin or Admin roles');
      }

      // LAB can only create LAB_EMP for their own branch
      if (creatorRole === 'LAB') {
        if (!creatorBranchId) {
          throw new ConflictException('Your lab profile must be approved before managing employees');
        }
        if (targetRole !== 'LAB_EMP') {
          throw new ConflictException('Lab role can only create Lab Employee accounts');
        }
        createUserDto.branchId = creatorBranchId;
      }
    }

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

  async findAll(query: any = {}, currentUser?: any) {
    const { page = 1, limit = 20, role, branchId, search } = query;
    const filter: any = {};

    if (currentUser?.role === 'LAB') {
      if (!currentUser.branchId) {
        // Return clear state or throw if preferred. Returning empty list but indicating status is better.
        return { users: [], total: 0, page: Number(page), limit: Number(limit), error: 'Branch not approved' };
      }

      filter.branchId = currentUser.branchId;
      filter.role = 'LAB_EMP';
    }

    if (role && currentUser?.role !== 'LAB') filter.role = role;
    if (branchId && currentUser?.role !== 'LAB') filter.branchId = branchId;
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
    const targetUser = await this.userModel
      .findById(id)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .populate('branchId', 'name')
      .lean();

    if (!targetUser) throw new NotFoundException('User not found');
    return targetUser;
  }

  async update(id: string, updateDto: any) {
    if (updateDto.password) {
      updateDto.password = await bcrypt.hash(updateDto.password, 12);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .lean();

    if (!updatedUser) throw new NotFoundException('User not found');
    return updatedUser;
  }

  async delete(id: string) {
    const targetUser = await this.userModel.findByIdAndDelete(id);
    if (!targetUser) throw new NotFoundException('User not found');
    return { success: true, message: 'User deleted successfully' };
  }
}
