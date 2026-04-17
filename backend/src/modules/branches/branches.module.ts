import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Branch, BranchSchema } from './schemas/branch.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { BranchUpdateRequest, BranchUpdateRequestSchema } from './schemas/branch-update.schema';
import { BranchesService } from './branches.service';
import { BranchesController } from './branches.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Branch.name, schema: BranchSchema },
      { name: User.name, schema: UserSchema },
      { name: BranchUpdateRequest.name, schema: BranchUpdateRequestSchema },
    ]),
    AuthModule,
  ],
  controllers: [BranchesController],
  providers: [BranchesService],
  exports: [BranchesService],
})
export class BranchesModule {}
