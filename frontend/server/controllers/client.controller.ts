import { Request, Response, NextFunction } from 'express';
import { ClientService } from '../services/client.service';

export class ClientController {
  public static async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const clients = await ClientService.getAllClients();
      res.status(200).json({ success: true, data: clients });
    } catch (error) {
      next(error);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const client = await ClientService.getClientById(id);
      res.status(200).json({ success: true, data: client });
    } catch (error) {
      next(error);
    }
  }

  public static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const client = await ClientService.createClient(req.body);
      res.status(201).json({ success: true, data: client });
    } catch (error) {
      next(error);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const client = await ClientService.updateClient(id, req.body);
      res.status(200).json({ success: true, data: client });
    } catch (error) {
      next(error);
    }
  }

  public static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await ClientService.deleteClient(id);
      res.status(200).json({ success: true, data: { message: 'Client deleted successfully' } });
    } catch (error) {
      next(error);
    }
  }
}
