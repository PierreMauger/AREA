import { Module } from '@nestjs/common';
import { ClockController } from './clock.controller';
import { ClockService } from './clock.service';
import { PrismaProvider } from '../../prisma';
import { LinkerService } from 'src/linker/linker.service';
import { TwitterService } from '../twitter/twitter.service';
import { TwitchService } from '../twitch/twitch.service';

@Module({
  controllers: [ClockController],
  providers: [
    ClockService,
    PrismaProvider,
    LinkerService,
    TwitterService,
    TwitchService,
  ],
})
export class ClockModule {}
