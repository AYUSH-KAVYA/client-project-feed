import { prisma } from '../utils/prisma';
import { NotFoundError } from '../utils/errors';

export class ClientService {
  public static async getAllClients() {
    return prisma.client.findMany({
      include: {
        _count: {
          select: { projects: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  public static async getClientById(id: string) {
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        projects: {
          include: {
            createdBy: { select: { id: true, name: true, email: true } },
            _count: { select: { tasks: true } },
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundError('Client not found');
    }

    return client;
  }

  public static async createClient(data: { name: string; company: string; email: string; phone?: string }) {
    return prisma.client.create({
      data,
    });
  }

  public static async updateClient(id: string, data: { name?: string; company?: string; email?: string; phone?: string }) {
    await this.getClientById(id);
    return prisma.client.update({
      where: { id },
      data,
    });
  }

  public static async deleteClient(id: string) {
    await this.getClientById(id);
    return prisma.client.delete({
      where: { id },
    });
  }
}
