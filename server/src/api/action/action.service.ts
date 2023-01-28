import { Injectable, Inject, HttpException } from '@nestjs/common';
import { Action, PrismaClient } from '@prisma/client';

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

  async createAction(accountId: number, action: Action): Promise<Action> {
    const brick = await this.prisma.brick.findUnique({
      where: { id: action.brickId },
    });
    if (!brick) throw new HttpException('Forbidden', 403);
    if (brick.accountId !== accountId)
      throw new HttpException('Forbidden', 403);
    return this.prisma.action.create({
      data: {
        description: action.description,
        brickId: action.brickId,
        serviceId: action.serviceId,
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
    data: Action,
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
