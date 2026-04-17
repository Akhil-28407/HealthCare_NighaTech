import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, MinLength, IsOptional, IsMobilePhone } from 'class-validator';

export class SendOtpDto {
  @ApiProperty({ example: '9876543210' })
  @IsString()
  @IsNotEmpty()
  mobile: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '9876543210' })
  @IsString()
  @IsNotEmpty()
  mobile: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  otp: string;

  @ApiProperty({ example: 'Chrome on Windows', required: false })
  @IsOptional()
  @IsString()
  deviceInfo?: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: '9876543210', required: false })
  @IsOptional()
  @IsString()
  mobile?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'Chrome on Windows', required: false })
  @IsOptional()
  @IsString()
  deviceInfo?: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'newpassword123' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class RegisterVendorDto {
  @ApiProperty({ example: 'NighaTech Labs' })
  @IsString()
  @IsNotEmpty()
  labName: string;

  @ApiProperty({ example: 'Sector 5, Gurgaon' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Gurgaon' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Haryana' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: '122001' })
  @IsString()
  @IsNotEmpty()
  pincode: string;

  @ApiProperty({ example: 'lab@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: '29AAAAA0000A1Z5' })
  @IsString()
  @IsNotEmpty()
  gstNumber: string;

  @ApiProperty({ example: 'LIC123456' })
  @IsString()
  @IsNotEmpty()
  labLicense: string;

  @ApiProperty({ example: '9999999999' })
  @IsString()
  @IsNotEmpty()
  contactPersonNumber: string;

  @ApiProperty({ example: 'https://lab.com', required: false })
  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/...', required: false })
  @IsOptional()
  @IsString()
  logoUrl?: string;
}
