import { Injectable, signal } from '@angular/core';
import { Case } from '../models';

@Injectable({ providedIn: 'root' })
export class CaseService {
  private casesSignal = signal<Case[]>([
    {
      id: '1', caseNumber: 'CASE-2024-001', title: 'Smith vs. Johnson Corporation',
      client: 'Robert Smith', clientId: 'c1', type: 'Civil Litigation',
      status: 'active', priority: 'high', assignedTo: 'David Morrison',
      openDate: new Date('2024-01-15'),
      nextHearing: new Date('2024-03-20'),
      court: 'Superior Court of California',
      description: 'Commercial dispute involving breach of contract and intellectual property violations.',
      tags: ['Commercial', 'IP', 'Contract']
    },
    {
      id: '2', caseNumber: 'CASE-2024-002', title: 'Estate of Williams - Probate',
      client: 'Mary Williams', clientId: 'c2', type: 'Estate Planning',
      status: 'active', priority: 'medium', assignedTo: 'Sarah Chen',
      openDate: new Date('2024-02-01'),
      nextHearing: new Date('2024-03-25'),
      court: 'Probate Court',
      description: 'Complex estate with multiple beneficiaries and international assets.',
      tags: ['Probate', 'Estate', 'International']
    },
    {
      id: '3', caseNumber: 'CASE-2024-003', title: 'Tech Startup - Series B Funding',
      client: 'NexGen Technologies', clientId: 'c3', type: 'Corporate',
      status: 'active', priority: 'high', assignedTo: 'David Morrison',
      openDate: new Date('2024-02-10'),
      tags: ['Corporate', 'Startup', 'Funding']
    },
    {
      id: '4', caseNumber: 'CASE-2024-004', title: 'Davis Employment Dispute',
      client: 'Jennifer Davis', clientId: 'c4', type: 'Employment Law',
      status: 'pending', priority: 'medium', assignedTo: 'Marcus Johnson',
      openDate: new Date('2024-02-15'),
      nextHearing: new Date('2024-04-05'),
      tags: ['Employment', 'HR', 'Discrimination']
    },
    {
      id: '5', caseNumber: 'CASE-2024-005', title: 'Anderson Property Dispute',
      client: 'Thomas Anderson', clientId: 'c5', type: 'Real Estate',
      status: 'active', priority: 'low', assignedTo: 'Sarah Chen',
      openDate: new Date('2024-01-20'),
      tags: ['Real Estate', 'Property']
    },
    {
      id: '6', caseNumber: 'CASE-2023-089', title: 'Brown Divorce Settlement',
      client: 'Patricia Brown', clientId: 'c6', type: 'Family Law',
      status: 'closed', priority: 'medium', assignedTo: 'David Morrison',
      openDate: new Date('2023-09-01'),
      tags: ['Family Law', 'Divorce']
    }
  ]);

  cases = this.casesSignal.asReadonly();

  getCaseById(id: string): Case | undefined {
    return this.casesSignal().find(c => c.id === id);
  }

  getActiveCases(): Case[] {
    return this.casesSignal().filter(c => c.status === 'active');
  }

  addCase(c: Case): void {
    this.casesSignal.update(cases => [...cases, c]);
  }

  updateCase(updated: Case): void {
    this.casesSignal.update(cases =>
      cases.map(c => c.id === updated.id ? updated : c)
    );
  }

  deleteCase(id: string): void {
    this.casesSignal.update(cases => cases.filter(c => c.id !== id));
  }
}
