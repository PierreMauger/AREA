import { Injectable, Inject, HttpException } from '@nestjs/common';
import { Brick, PrismaClient } from '@prisma/client';

@Injectable()
export class BrickService {
  constructor(@Inject('Prisma') private readonly prisma: PrismaClient) {}

  async readAllBricks(accountId: number): Promise<Brick[]> {
    return this.prisma.brick.findMany({
      where: {
        accountId: accountId,
      },
    });
  }

  async createBrick(accountId: number, brick: Brick): Promise<Brick> {
    return this.prisma.brick.create({
      data: {
        title: brick.title,
        // description: brick.description,
        accountId: accountId,
        serviceId: brick.serviceId,
        published: true,
      },
    });
  }

  async readBrick(accountId: number, id: number): Promise<Brick> {
    const brick = await this.prisma.brick.findUnique({
      where: { id: id },
    });
    if (!brick) throw new HttpException('Forbidden', 403);
    if (brick.accountId !== accountId)
      throw new HttpException('Forbidden', 403);
    return brick;
  }

  async updateBrick(
    accountId: number,
    id: number,
    data: Brick,
  ): Promise<Brick> {
    const brick = await this.prisma.brick.findUnique({
      where: { id: id },
    });
    if (!brick) throw new HttpException('Forbidden', 403);
    if (brick.accountId !== accountId)
      throw new HttpException('Forbidden', 403);
    return this.prisma.brick.update({
      where: { id: id },
      data: data,
    });
  }

  async deleteBrick(accountId: number, id: number): Promise<Brick> {
    const brick = await this.prisma.brick.findUnique({
      where: { id: id },
    });
    if (!brick) throw new HttpException('Forbidden', 403);
    if (brick.accountId !== accountId)
      throw new HttpException('Forbidden', 403);
    return this.prisma.brick.delete({ where: { id: id } });
  }
}
