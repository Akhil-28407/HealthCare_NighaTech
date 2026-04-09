import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TestMaster, TestMasterSchema } from './schemas/test-master.schema';
import { TestMasterService } from './test-master.service';
import { TestMasterController } from './test-master.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TestMaster.name, schema: TestMasterSchema }]),
    AuthModule,
  ],
  controllers: [TestMasterController],
  providers: [TestMasterService],
  exports: [TestMasterService, MongooseModule],
})
export class TestMasterModule {}
