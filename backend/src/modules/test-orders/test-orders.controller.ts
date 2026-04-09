import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TestOrdersService } from './test-orders.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Test Orders')
@Controller('test-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TestOrdersController {
  constructor(private readonly service: TestOrdersService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EMPLOYEE, Role.LAB, Role.LAB_EMP)
  @ApiOperation({ summary: 'Create test order' })
  create(@Body() dto: any, @CurrentUser('sub') userId: string) {
    return this.service.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all test orders' })
  findAll(@Query() query: any) { return this.service.findAll(query); }

  @Get(':id')
  @ApiOperation({ summary: 'Get test order by ID' })
  findById(@Param('id') id: string) { return this.service.findById(id); }

  @Patch(':id/collect-sample')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EMPLOYEE, Role.LAB, Role.LAB_EMP)
  @ApiOperation({ summary: 'Collect sample for test order' })
  collectSample(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.service.collectSample(id, userId);
  }
}
