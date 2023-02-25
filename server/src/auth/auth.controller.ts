import {
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Res,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Login',
    description: 'Login and returns a JWT token.',
  })
  @ApiBody({
    type: LoginDto,
    required: true,
    description: 'Login',
    examples: {
      user: {
        value: {
          email: 'AdolpheThiers@mail.com',
          password: '18711873',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
        },
      },
    },
  })
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post('register')
  @ApiOperation({
    summary: 'Register',
    description: 'Register and returns a JWT token.',
  })
  @ApiBody({
    type: LoginDto,
    required: true,
    description: 'Login',
    examples: {
      user: {
        value: {
          email: 'AdolpheThiers@mail.com',
          password: '18711873',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
        },
      },
    },
  })
  async register(@Body() body: LoginDto) {
    return this.authService.register(body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('logout')
  @ApiOperation({
    summary: 'Logout',
    description: 'Logout from the application.',
  })
  @ApiBearerAuth()
  logout(@Req() req: ParameterDecorator, @Res() res: ParameterDecorator) {
    return this.authService.logout(req, res);
  }
}
