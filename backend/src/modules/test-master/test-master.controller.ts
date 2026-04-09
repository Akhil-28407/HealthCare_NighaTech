import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TestMasterService } from './test-master.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Test Master')
@Controller('test-master')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TestMasterController {
  constructor(private readonly testMasterService: TestMasterService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.LAB)
  @ApiOperation({ summary: 'Create test' })
  create(@Body() dto: any) { return this.testMasterService.create(dto); }

  @Get()
  @ApiOperation({ summary: 'Get all tests' })
  findAll(@Query() query: any) { return this.testMasterService.findAll(query); }

  @Get(':id')
  @ApiOperation({ summary: 'Get test by ID' })
  findById(@Param('id') id: string) { return this.testMasterService.findById(id); }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.LAB)
  @ApiOperation({ summary: 'Update test' })
  update(@Param('id') id: string, @Body() dto: any) { return this.testMasterService.update(id, dto); }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Delete test' })
  delete(@Param('id') id: string) { return this.testMasterService.delete(id); }
}
