import { z } from 'zod';
import { Role, TaskStatus, TaskPriority } from '@prisma/client';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const createClientSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Client name is required'),
    company: z.string().min(2, 'Company name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
  }),
});

export const updateClientSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    name: z.string().min(2).optional(),
    company: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }),
});

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Project name must be at least 3 characters'),
    description: z.string().min(5, 'Description must be at least 5 characters'),
    clientId: z.string().uuid('Invalid client ID'),
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    name: z.string().min(3).optional(),
    description: z.string().min(5).optional(),
    clientId: z.string().uuid().optional(),
  }),
});

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(3, 'Description must be at least 3 characters'),
    priority: z.nativeEnum(TaskPriority).optional(),
    dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid due date format'),
    projectId: z.string().uuid('Invalid project ID'),
    assignedToId: z.string().uuid('Invalid assigned developer ID').nullable().optional(),
  }),
});

export const updateTaskStatusSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    status: z.nativeEnum(TaskStatus, { required_error: 'Valid task status is required' }),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(3).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid due date format').optional(),
    assignedToId: z.string().uuid().nullable().optional(),
  }),
});
