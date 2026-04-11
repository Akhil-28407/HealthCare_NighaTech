import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Templates')
@Controller('templates')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TemplatesController {
  constructor(private readonly service: TemplatesService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.LAB)
  @ApiOperation({ summary: 'Create template' })
  create(@Body() dto: any, @CurrentUser() user: any) { 
    if (user.role === Role.LAB) dto.branchId = user.branchId;
    return this.service.create(dto); 
  }

  @Get()
  @ApiOperation({ summary: 'Get all templates' })
  findAll(@Query() query: any, @CurrentUser() user: any) { return this.service.findAll(query, user); }

  @Get(':id')
  @ApiOperation({ summary: 'Get template by ID' })
  findById(@Param('id') id: string) { return this.service.findById(id); }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.LAB)
  @ApiOperation({ summary: 'Update template' })
  update(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any) { 
    return this.service.update(id, dto, user); 
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.LAB)
  @ApiOperation({ summary: 'Delete template' })
  delete(@Param('id') id: string, @CurrentUser() user: any) { return this.service.delete(id, user); }

  @Post(':id/preview')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.LAB)
  @ApiOperation({ summary: 'Preview template with sample data' })
  preview(@Param('id') id: string, @Body() data: any) {
    return this.service.preview(id, data);
  }
}
