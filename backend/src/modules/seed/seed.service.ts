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
    this.logger.log('Starting one-time database cleanup of empty string IDs...');
    
    // Clean LabReports
    const reportResults = await this.userModel.db.collection('labreports').updateMany(
      { branchId: "" },
      { $unset: { branchId: "" } }
    );
    if (reportResults.modifiedCount > 0) {
      this.logger.log(`Cleaned ${reportResults.modifiedCount} malformed LabReports.`);
    }

    // Clean TestOrders
    const orderResults = await this.userModel.db.collection('testorders').updateMany(
      { branchId: "" },
      { $unset: { branchId: "" } }
    );
    if (orderResults.modifiedCount > 0) {
      this.logger.log(`Cleaned ${orderResults.modifiedCount} malformed TestOrders.`);
    }

    // Clean empty clientId refs that break populate (Client._id $in [""])
    const reportClientResults = await this.userModel.db.collection('labreports').updateMany(
      { clientId: "" },
      { $unset: { clientId: "" } }
    );
    if (reportClientResults.modifiedCount > 0) {
      this.logger.log(`Cleaned ${reportClientResults.modifiedCount} malformed LabReports clientId refs.`);
    }

    const orderClientResults = await this.userModel.db.collection('testorders').updateMany(
      { clientId: "" },
      { $unset: { clientId: "" } }
    );
    if (orderClientResults.modifiedCount > 0) {
      this.logger.log(`Cleaned ${orderClientResults.modifiedCount} malformed TestOrders clientId refs.`);
    }

    const invoiceClientResults = await this.userModel.db.collection('invoices').updateMany(
      { clientId: "" },
      { $unset: { clientId: "" } }
    );
    if (invoiceClientResults.modifiedCount > 0) {
      this.logger.log(`Cleaned ${invoiceClientResults.modifiedCount} malformed Invoices clientId refs.`);
    }

    const quotationClientResults = await this.userModel.db.collection('quotations').updateMany(
      { clientId: "" },
      { $unset: { clientId: "" } }
    );
    if (quotationClientResults.modifiedCount > 0) {
      this.logger.log(`Cleaned ${quotationClientResults.modifiedCount} malformed Quotations clientId refs.`);
    }

  }

  private async seedSuperAdmin() {
    // Check for the specific recovery account
    const recoveryEmail = 'admin@nighatech.com';
    const existingUser = await this.userModel.findOne({ email: recoveryEmail });

    const hashedPassword = await bcrypt.hash('admin@123', 12);

    if (!existingUser) {
      this.logger.log(`No user found with email ${recoveryEmail}. Creating emergency Super Admin...`);
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
      // Ensure the existing account is active, has the correct role, and the recovery password
      this.logger.log(`User ${recoveryEmail} exists. Ensuring it is active and has Super Admin role...`);
      let changed = false;
      
      if (!existingUser.isActive) {
        existingUser.isActive = true;
        changed = true;
      }
      
      if (existingUser.role !== Role.SUPER_ADMIN) {
        existingUser.role = Role.SUPER_ADMIN;
        changed = true;
      }

      // Always reset password for recovery purposes if it's currently failing
      existingUser.password = hashedPassword;
      changed = true;

      if (changed) {
        await existingUser.save();
        this.logger.log(`Emergency Super Admin ${recoveryEmail} updated and reactivated.`);
      } else {
        this.logger.log(`Emergency Super Admin ${recoveryEmail} is already active and healthy.`);
      }
    }
  }
}
