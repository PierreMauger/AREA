import { Injectable, Inject, HttpException } from '@nestjs/common';
import { Action, PrismaClient } from '@prisma/client';
import { CreateActionDto } from './dto/create-action.dto';
import { UpdateActionDto } from './dto/update-action.dto';

@Injectable()
export class ActionService {
  constructor(@Inject('Prisma') private readonly prisma: PrismaClient) {}

  async readAllActions(accountId: number): Promise<Action[]> {
    const brick = await this.prisma.brick.findMany({
      where: { accountId: accountId },
    });
    if (!brick) throw new HttpException('Forbidden', 403);
    return this.prisma.action.findMany({
      where: {
        brickId: {
          in: brick.map((b) => b.id),
        },
      },
    });
  }

  async readActionsFromBrick(
    accountId: number,
    brickId: number,
  ): Promise<Action[]> {
    const brick = await this.prisma.brick.findUnique({
      where: { id: brickId },
    });
    if (!brick) throw new HttpException('Forbidden', 403);
    if (brick.accountId !== accountId)
      throw new HttpException('Forbidden', 403);
    return this.prisma.action.findMany({
      where: {
        brickId: brickId,
      },
    });
  }

  async createAction(
    accountId: number,
    action: CreateActionDto,
  ): Promise<Action> {
    const brick = await this.prisma.brick.findUnique({
      where: { id: action.brickId },
    });
    let serviceId;
    if (action.serviceName == 'Time') {
      serviceId = -1;
    } else if (action.serviceName == 'Meteo') {
      serviceId = -2;
    } else if (action.serviceName == 'Crypto') {
      serviceId = -3;
    } else {
      const service = await this.prisma.service.findFirst({
        where: { accountId: accountId, title: action.serviceName },
      });
      serviceId = service.id;
    }

    if (!brick) throw new HttpException('Forbidden', 403);
    if (brick.accountId !== accountId)
      throw new HttpException('Forbidden', 403);
    return this.prisma.action.create({
      data: {
        description: action.description,
        brickId: action.brickId,
        serviceId: serviceId,
        arguments: action.arguments,
        isInput: action.isInput,
        actionType: action.actionType,
      },
    });
  }

  async readAction(accountId: number, id: number): Promise<Action> {
    const action = await this.prisma.action.findUnique({
      where: { id: id },
    });
    if (!action) throw new HttpException('Forbidden', 403);
    const brick = await this.prisma.brick.findUnique({
      where: { id: action.brickId },
    });
    if (!brick) throw new HttpException('Forbidden', 403);
    if (brick.accountId !== accountId)
      throw new HttpException('Forbidden', 403);
    return action;
  }

  async updateAction(
    accountId: number,
    id: number,
    data: UpdateActionDto,
  ): Promise<Action> {
    const action = await this.prisma.action.findUnique({
      where: { id: id },
    });
    if (!action) throw new HttpException('Forbidden', 403);
    const brick = await this.prisma.brick.findUnique({
      where: { id: action.brickId },
    });
    if (!brick) throw new HttpException('Forbidden', 403);
    if (brick.accountId !== accountId)
      throw new HttpException('Forbidden', 403);
    return this.prisma.action.update({
      where: { id: id },
      data: data,
    });
  }

  async deleteAction(accountId: number, id: number): Promise<Action> {
    const action = await this.prisma.action.findUnique({
      where: { id: id },
    });
    if (!action) throw new HttpException('Forbidden', 403);
    const brick = await this.prisma.brick.findUnique({
      where: { id: action.brickId },
    });
    if (!brick) throw new HttpException('Forbidden', 403);
    if (brick.accountId !== accountId)
      throw new HttpException('Forbidden', 403);
    return this.prisma.action.delete({ where: { id: id } });
  }
}
