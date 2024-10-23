import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserRequest } from './dto/create-user.request';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { TokenPayload } from '../auth/token-payload.interface';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import {
  UpdateAdminUserRequest,
  UpdateUserRequest,
} from './dto/update-user.request';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('register')
  async createUser(@Body() request: CreateUserRequest) {
    await this.usersService.createUser(request);
    return { message: 'Register Success' };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUsers() {
    const getUsers = await this.usersService.getUsers();
    return { message: 'Get Data Success', data: getUsers };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: TokenPayload) {
    return { message: 'Get Data Success', data: user };
  }

  @Get(':userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUserById(@Param('userId') userId: string) {
    const getUser = await this.usersService.getUserById(+userId);
    return { message: 'Get Data Success', data: getUser };
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async updateUser(
    @CurrentUser() user: TokenPayload,
    @Body() request: UpdateUserRequest,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    if (image) {
      const uploadResult = await this.cloudinaryService.uploadImage(image);
      request.image = uploadResult.secure_url;
    }
    const updatedUser = await this.usersService.updateUser(
      user.userId,
      request,
      user.role,
    );
    return { message: 'Update Success', data: updatedUser };
  }

  @Patch(':userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async adminUpdateUser(
    @Param('userId') userId: string,
    @Body() request: UpdateAdminUserRequest,
  ) {
    const updatedUser = await this.usersService.adminUpdateUser(
      +userId,
      request,
    );
    return { message: 'Update Success', data: updatedUser };
  }
}
