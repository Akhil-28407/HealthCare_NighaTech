import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async onModuleInit() {
    await this.seedSuperAdmin();
    await this.cleanUpMalformedData();
  }

  private async cleanUpMalformedData() {
    // Only run if specifically requested or once in a while in prod
    // For Vercel, we should avoid running this on every cold start
    if (process.env.NODE_ENV === 'production' && Math.random() > 0.01) {
      return;
    }

    this.logger.log('Starting database cleanup of empty string IDs...');
    
    const collections = ['labreports', 'testorders', 'invoices', 'quotations'];
    const fields = ['branchId', 'clientId'];

    for (const collection of collections) {
      for (const field of fields) {
        await this.userModel.db.collection(collection).updateMany(
          { [field]: "" },
          { $unset: { [field]: "" } }
        );
      }
    }
  }

  private async seedSuperAdmin() {
    const recoveryEmail = 'admin@nighatech.com';
    const existingUser = await this.userModel.findOne({ email: recoveryEmail });

    if (!existingUser) {
      this.logger.log(`No user found with email ${recoveryEmail}. Creating emergency Super Admin...`);
      const hashedPassword = await bcrypt.hash('admin@123', 12);
      await this.userModel.create({
        name: 'System Super Admin',
        email: recoveryEmail,
        mobile: '0123456789',
        password: hashedPassword,
        role: Role.SUPER_ADMIN,
        isActive: true,
      });
      this.logger.log(`Emergency Super Admin created: ${recoveryEmail} / admin@123`);
    } else {
      // Only update if something actually changed to avoid constant saves and potential hashing
      const needsUpdate = !existingUser.isActive || existingUser.role !== Role.SUPER_ADMIN;
      
      if (needsUpdate) {
        this.logger.log(`Updating Super Admin ${recoveryEmail}...`);
        existingUser.isActive = true;
        existingUser.role = Role.SUPER_ADMIN;
        // Only reset password if explicitly needed, but for now let's just update other flags
        // to avoid expensive hashing on every cold start.
        await existingUser.save();
        this.logger.log(`Emergency Super Admin ${recoveryEmail} updated.`);
      }
    }
  }
}
