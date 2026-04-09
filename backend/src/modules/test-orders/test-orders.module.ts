import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TestOrder, TestOrderSchema } from './schemas/test-order.schema';
import { TestOrdersService } from './test-orders.service';
import { TestOrdersController } from './test-orders.controller';
import { TestMasterModule } from '../test-master/test-master.module';
import { LabReportsModule } from '../lab-reports/lab-reports.module';
import { CounterModule } from '../counter/counter.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TestOrder.name, schema: TestOrderSchema }]),
    TestMasterModule,
    LabReportsModule,
    CounterModule,
    AuthModule,
  ],
  controllers: [TestOrdersController],
  providers: [TestOrdersService],
  exports: [TestOrdersService],
})
export class TestOrdersModule {}
