import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Clients')
@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EMPLOYEE, Role.LAB, Role.LAB_EMP)
  @ApiOperation({ summary: 'Create client' })
  create(@Body() dto: any, @CurrentUser() user: any) { 
    return this.clientsService.create(dto, user); 
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EMPLOYEE, Role.LAB, Role.LAB_EMP)
  @ApiOperation({ summary: 'Get all clients' })
  findAll(@Query() query: any, @CurrentUser() user: any) { 
    return this.clientsService.findAll(query, user); 
  }

  @Get('search-by-mobile')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EMPLOYEE, Role.LAB, Role.LAB_EMP)
  @ApiOperation({ summary: 'Search clients by exact mobile number' })
  searchByMobile(@Query('mobile') mobile: string) {
    return this.clientsService.searchByMobile(mobile);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EMPLOYEE, Role.LAB, Role.LAB_EMP)
  @ApiOperation({ summary: 'Get client by ID' })
  findById(@Param('id') id: string, @CurrentUser() user: any) { 
    return this.clientsService.findById(id, user); 
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EMPLOYEE, Role.LAB, Role.LAB_EMP)
  @ApiOperation({ summary: 'Update client' })
  update(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any) { 
    return this.clientsService.update(id, dto, user); 
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.LAB, Role.LAB_EMP)
  @ApiOperation({ summary: 'Delete client' })
  delete(@Param('id') id: string, @CurrentUser() user: any) { 
    return this.clientsService.delete(id, user); 
  }
}
