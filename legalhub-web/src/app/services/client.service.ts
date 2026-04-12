import { Injectable, signal } from '@angular/core';
import { Client } from '../models';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private clientsSignal = signal<Client[]>([
    {
      id: 'c1', name: 'Robert Smith', email: 'rsmith@email.com',
      phone: '+1 (555) 234-5678', type: 'individual', status: 'active',
      totalCases: 3, openCases: 1, joinDate: new Date('2022-03-15'),
      avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-7.jpg',
      address: '123 Main St, Los Angeles, CA 90001'
    },
    {
      id: 'c2', name: 'Mary Williams', email: 'mary.w@email.com',
      phone: '+1 (555) 345-6789', type: 'individual', status: 'active',
      totalCases: 1, openCases: 1, joinDate: new Date('2024-01-20'),
      avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg'
    },
    {
      id: 'c3', name: 'NexGen Technologies', email: 'legal@nexgen.com',
      phone: '+1 (555) 456-7890', type: 'corporate', status: 'active',
      company: 'NexGen Technologies Inc.',
      totalCases: 5, openCases: 2, joinDate: new Date('2021-06-01')
    },
    {
      id: 'c4', name: 'Jennifer Davis', email: 'j.davis@email.com',
      phone: '+1 (555) 567-8901', type: 'individual', status: 'active',
      totalCases: 1, openCases: 1, joinDate: new Date('2024-02-10'),
      avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg'
    },
    {
      id: 'c5', name: 'Thomas Anderson', email: 't.anderson@email.com',
      phone: '+1 (555) 678-9012', type: 'individual', status: 'active',
      totalCases: 2, openCases: 1, joinDate: new Date('2023-11-05')
    },
    {
      id: 'c6', name: 'Patricia Brown', email: 'p.brown@email.com',
      phone: '+1 (555) 789-0123', type: 'individual', status: 'inactive',
      totalCases: 1, openCases: 0, joinDate: new Date('2023-08-15'),
      avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg'
    }
  ]);

  clients = this.clientsSignal.asReadonly();

  getClientById(id: string): Client | undefined {
    return this.clientsSignal().find(c => c.id === id);
  }

  addClient(client: Client): void {
    this.clientsSignal.update(clients => [...clients, client]);
  }

  updateClient(updated: Client): void {
    this.clientsSignal.update(clients =>
      clients.map(c => c.id === updated.id ? updated : c)
    );
  }
}
