import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ClockService } from './clock.service';

@ApiTags('Clock')
@Controller('clock')
export class ClockController {
  constructor(private readonly clockService: ClockService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiOperation({
    summary: 'Get clock',
    description: 'Get the current time.',
  })
  @ApiBearerAuth()
  @ApiResponse({
    schema: {
      type: 'object',
      properties: {
        clock: {
          type: 'string',
        },
      },
    },
  })
  getClock(): string {
    return this.clockService.getClock();
  }
}
