import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BranchesService } from './branches.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';
import { BranchStatus } from './schemas/branch.schema';

@ApiTags('Branches')
@Controller('branches')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EMPLOYEE, Role.LAB, Role.LAB_EMP)
  @ApiOperation({ summary: 'Create branch' })
  create(@Body() dto: any, @CurrentUser() user: any) { 
    return this.branchesService.create(dto, user); 
  }

  @Get()
  @ApiOperation({ summary: 'Get all branches' })
  findAll(@Query() query: any) { return this.branchesService.findAll(query); }

  @Get(':id')
  @ApiOperation({ summary: 'Get branch by ID' })
  findById(@Param('id') id: string) { return this.branchesService.findById(id); }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.LAB)
  @ApiOperation({ summary: 'Update branch' })
  update(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any) {
    return this.branchesService.update(id, dto, user);
  }

  @Patch(':id/status')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Update branch status (Approve/Reject)' })
  updateStatus(@Param('id') id: string, @Body('status') status: BranchStatus) {
    return this.branchesService.updateStatus(id, status);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete branch' })
  delete(@Param('id') id: string) { return this.branchesService.delete(id); }
}
