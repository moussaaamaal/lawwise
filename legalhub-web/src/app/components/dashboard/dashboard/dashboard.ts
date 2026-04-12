import { Component, inject, AfterViewInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CaseService } from '../../../services/case.service';

declare var Plotly: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, NgClass],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements AfterViewInit {
  private authService = inject(AuthService);
  private caseService = inject(CaseService);

  currentUser = this.authService.currentUser;
  cases = this.caseService.cases;

  metrics = [
    { icon: 'fa-solid fa-briefcase', bgColor: 'bg-blue-100', iconColor: 'text-blue-600', value: '24', label: 'Active Cases', badge: '+12%', badgeColor: 'text-green-600 bg-green-100', note: '8 hearings this week' },
    { icon: 'fa-solid fa-circle-check', bgColor: 'bg-green-100', iconColor: 'text-green-600', value: '147', label: 'Closed Cases', badge: '+8%', badgeColor: 'text-green-600 bg-green-100', note: '12 closed this month' },
    { icon: 'fa-solid fa-gavel', bgColor: 'bg-amber-100', iconColor: 'text-amber-600', value: '7', label: 'Upcoming Hearings', badge: 'Urgent', badgeColor: 'text-red-600 bg-red-100', note: '3 in next 48 hours' },
    { icon: 'fa-solid fa-dollar-sign', bgColor: 'bg-purple-100', iconColor: 'text-purple-600', value: '$48.2K', label: 'Pending Payments', badge: '-5%', badgeColor: 'text-red-600 bg-red-100', note: '15 overdue invoices' },
    { icon: 'fa-solid fa-clock', bgColor: 'bg-red-100', iconColor: 'text-red-600', value: '12', label: 'Active Reminders', badge: 'Due', badgeColor: 'text-amber-600 bg-amber-100', note: '5 due today' },
  ];

  hearings = [
    { month: 'Nov', day: '16', title: 'Johnson vs. State Corp', location: 'District Court - Courtroom 4B', badge: 'Tomorrow', badgeColor: 'bg-red-600', cardColor: 'bg-red-50 border-red-200', dateBg: 'bg-red-100', dotColor: 'text-red-500', dayColor: 'text-red-700', time: '10:00 AM', user: 'Sarah Williams', type: 'Civil Litigation' },
    { month: 'Nov', day: '18', title: 'Martinez Family Trust', location: 'Estate Planning - Document Review', badge: 'In 3 days', badgeColor: 'bg-amber-500', cardColor: 'bg-amber-50 border-amber-200', dateBg: 'bg-amber-100', dotColor: 'text-amber-500', dayColor: 'text-amber-700', time: '2:30 PM', user: 'Michael Chen', type: 'Estate Law' },
    { month: 'Nov', day: '20', title: 'Thompson Real Estate Deal', location: 'Contract Signing - Office Meeting', badge: 'In 5 days', badgeColor: 'bg-blue-500', cardColor: 'bg-blue-50 border-blue-200', dateBg: 'bg-blue-100', dotColor: 'text-blue-500', dayColor: 'text-blue-700', time: '11:00 AM', user: 'David Morrison', type: 'Real Estate' },
    { month: 'Nov', day: '22', title: 'Anderson Employment Case', location: 'Mediation Session - Conference Room A', badge: 'In 7 days', badgeColor: 'bg-green-500', cardColor: 'bg-green-50 border-green-200', dateBg: 'bg-green-100', dotColor: 'text-green-500', dayColor: 'text-green-700', time: '9:00 AM', user: 'Jennifer Lopez', type: 'Employment Law' },
  ];

  reminders = [
    { dot: 'bg-red-500', title: 'File motion for summary judgment', subtitle: 'Johnson case - Due today' },
    { dot: 'bg-amber-500', title: 'Review discovery documents', subtitle: 'Martinez case - Tomorrow' },
    { dot: 'bg-blue-500', title: 'Client consultation call', subtitle: 'Thompson - Nov 17, 3 PM' },
    { dot: 'bg-green-500', title: 'Submit expert witness list', subtitle: 'Anderson - Nov 19' },
    { dot: 'bg-purple-500', title: 'Invoice payment follow-up', subtitle: 'Multiple clients - Nov 20' },
  ];

  activities = [
    { avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg', name: 'Sarah Williams', action: 'uploaded 3 new documents to', target: 'Johnson vs. State Corp', targetColor: 'text-blue-600', detail: 'Contract_Amendment.pdf, Evidence_Photos.zip, Witness_Statement.docx', time: '2 hours ago', tags: [{label:'Documents',color:'bg-blue-100 text-blue-700'},{label:'Civil Litigation',color:'bg-gray-100 text-gray-700'}] },
    { avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg', name: 'Michael Chen', action: 'created invoice #INV-2847 for', target: 'Martinez Family Trust', targetColor: 'text-green-600', detail: 'Amount: $5,250.00 - Due: December 15, 2024', time: '4 hours ago', tags: [{label:'Billing',color:'bg-green-100 text-green-700'},{label:'Estate Law',color:'bg-gray-100 text-gray-700'}] },
    { avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg', name: 'David Morrison', action: 'scheduled a hearing for', target: 'Thompson Real Estate Deal', targetColor: 'text-amber-600', detail: 'November 20, 2024 at 11:00 AM - Conference Room A', time: '5 hours ago', tags: [{label:'Calendar',color:'bg-amber-100 text-amber-700'},{label:'Real Estate',color:'bg-gray-100 text-gray-700'}] },
    { avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg', name: 'Jennifer Lopez', action: 'completed task: "Review employment contract" for', target: 'Anderson Employment Case', targetColor: 'text-purple-600', detail: 'Task completed 2 days ahead of deadline', time: '6 hours ago', tags: [{label:'Tasks',color:'bg-purple-100 text-purple-700'},{label:'Employment Law',color:'bg-gray-100 text-gray-700'}] },
    { avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg', name: 'Robert Taylor', action: 'added a new client', target: 'Greenfield Industries LLC', targetColor: 'text-indigo-600', detail: 'Corporate law client - Initial consultation scheduled', time: '8 hours ago', tags: [{label:'Clients',color:'bg-indigo-100 text-indigo-700'},{label:'Corporate Law',color:'bg-gray-100 text-gray-700'}] },
  ];

  teamMembers = [
    { avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg', name: 'Sarah Williams', role: 'Senior Associate', cases: 12, border: 'border-blue-500' },
    { avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg', name: 'Michael Chen', role: 'Partner', cases: 8, border: 'border-green-500' },
    { avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg', name: 'Jennifer Lopez', role: 'Associate', cases: 6, border: 'border-purple-500' },
    { avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg', name: 'Robert Taylor', role: 'Of Counsel', cases: 4, border: 'border-amber-500' },
  ];

  tasks = [
    { title: 'File motion for summary judgment', desc: 'Prepare and submit legal motion', case: 'Johnson vs. State Corp', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg', assignee: 'Sarah Williams', priority: 'High', priorityColor: 'bg-red-100 text-red-700', dueDate: 'Nov 15, 2024', dueNote: 'Due today', dueNoteColor: 'text-red-600', status: 'In Progress', statusColor: 'bg-amber-100 text-amber-700' },
    { title: 'Review discovery documents', desc: 'Analyze evidence and prepare response', case: 'Martinez Family Trust', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg', assignee: 'Michael Chen', priority: 'Medium', priorityColor: 'bg-amber-100 text-amber-700', dueDate: 'Nov 16, 2024', dueNote: 'Tomorrow', dueNoteColor: 'text-gray-600', status: 'Not Started', statusColor: 'bg-blue-100 text-blue-700' },
    { title: 'Prepare contract amendments', desc: 'Draft revised contract terms', case: 'Thompson Real Estate', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg', assignee: 'David Morrison', priority: 'Low', priorityColor: 'bg-green-100 text-green-700', dueDate: 'Nov 18, 2024', dueNote: 'In 3 days', dueNoteColor: 'text-gray-600', status: 'In Progress', statusColor: 'bg-amber-100 text-amber-700' },
    { title: 'Client consultation preparation', desc: 'Review case files and prepare materials', case: 'Anderson Employment', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg', assignee: 'Jennifer Lopez', priority: 'Medium', priorityColor: 'bg-amber-100 text-amber-700', dueDate: 'Nov 17, 2024', dueNote: 'In 2 days', dueNoteColor: 'text-gray-600', status: 'Completed', statusColor: 'bg-green-100 text-green-700' },
    { title: 'Submit expert witness list', desc: 'Finalize and file witness list with court', case: 'Wilson Medical Malpractice', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg', assignee: 'Robert Taylor', priority: 'High', priorityColor: 'bg-red-100 text-red-700', dueDate: 'Nov 19, 2024', dueNote: 'In 4 days', dueNoteColor: 'text-gray-600', status: 'Not Started', statusColor: 'bg-blue-100 text-blue-700' },
  ];

  documents = [
    { icon: 'fa-solid fa-file-pdf', iconColor: 'text-red-600', iconBg: 'bg-red-100', name: 'Contract_Amendment_v3.pdf', case: 'Johnson vs. State Corp', size: '2.4 MB', time: '2 hours ago' },
    { icon: 'fa-solid fa-file-word', iconColor: 'text-blue-600', iconBg: 'bg-blue-100', name: 'Witness_Statement_Final.docx', case: 'Martinez Family Trust', size: '1.8 MB', time: '4 hours ago' },
    { icon: 'fa-solid fa-file-excel', iconColor: 'text-green-600', iconBg: 'bg-green-100', name: 'Financial_Analysis_2024.xlsx', case: 'Thompson Real Estate', size: '3.2 MB', time: '6 hours ago' },
    { icon: 'fa-solid fa-file-image', iconColor: 'text-purple-600', iconBg: 'bg-purple-100', name: 'Evidence_Photos.zip', case: 'Anderson Employment', size: '12.5 MB', time: '8 hours ago' },
  ];

  invoices = [
    { number: 'INV-2845', client: 'Johnson Corp', amount: '$12,500.00', date: 'Nov 10, 2024', note: '5 days overdue', noteColor: 'text-red-600', status: 'Overdue', statusColor: 'bg-red-100 text-red-700' },
    { number: 'INV-2846', client: 'Martinez Family', amount: '$8,750.00', date: 'Nov 20, 2024', note: 'Due in 5 days', noteColor: 'text-gray-600', status: 'Pending', statusColor: 'bg-amber-100 text-amber-700' },
    { number: 'INV-2847', client: 'Thompson Properties', amount: '$15,200.00', date: 'Nov 25, 2024', note: 'Due in 10 days', noteColor: 'text-gray-600', status: 'Sent', statusColor: 'bg-blue-100 text-blue-700' },
    { number: 'INV-2848', client: 'Anderson Industries', amount: '$6,300.00', date: 'Dec 01, 2024', note: 'Due in 16 days', noteColor: 'text-gray-600', status: 'Sent', statusColor: 'bg-blue-100 text-blue-700' },
  ];

  ngAfterViewInit(): void {
    this.loadPlotly().then(() => this.renderCharts());
  }

  private loadPlotly(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof Plotly !== 'undefined') { resolve(); return; }
      const s = document.createElement('script');
      s.src = 'https://cdn.plot.ly/plotly-3.1.1.min.js';
      s.onload = () => resolve();
      document.head.appendChild(s);
    });
  }

  private renderCharts(): void {
    try {
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      Plotly.newPlot('case-activity-chart', [
        { x: months, y: [12,15,18,14,20,22,19,24,21,26,24,28], type: 'scatter', mode: 'lines', name: 'Active Cases', line: { color: '#3b82f6', width: 3 }, fill: 'tozeroy', fillcolor: 'rgba(59,130,246,0.1)' },
        { x: months, y: [8,11,13,10,15,17,14,18,16,20,19,22], type: 'scatter', mode: 'lines', name: 'Closed Cases', line: { color: '#10b981', width: 3 } }
      ], { title: { text: '' }, xaxis: { title: '' }, yaxis: { title: 'Number of Cases' }, margin: { t: 20, r: 20, b: 40, l: 50 }, plot_bgcolor: '#ffffff', paper_bgcolor: '#ffffff', showlegend: true, legend: { x: 0, y: 1.1, orientation: 'h' } }, { responsive: true, displayModeBar: false });

      Plotly.newPlot('case-distribution-chart', [{
        labels: ['Civil Litigation','Estate Law','Real Estate','Employment','Corporate','Family Law'],
        values: [28,18,15,12,17,10], type: 'pie',
        marker: { colors: ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4'] },
        textinfo: 'percent', hoverinfo: 'label+percent+value'
      }], { title: { text: '' }, margin: { t: 20, r: 20, b: 20, l: 20 }, plot_bgcolor: '#ffffff', paper_bgcolor: '#ffffff', showlegend: true, legend: { x: 0, y: -0.1, orientation: 'v' } }, { responsive: true, displayModeBar: false });

      Plotly.newPlot('revenue-chart', [{
        x: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov'],
        y: [85000,92000,88000,105000,98000,112000,108000,125000,118000,132000,124500],
        type: 'bar', marker: { color: '#f59e0b' }
      }], { title: { text: '' }, xaxis: { title: '' }, yaxis: { title: 'Revenue ($)' }, margin: { t: 20, r: 20, b: 40, l: 60 }, plot_bgcolor: '#ffffff', paper_bgcolor: '#ffffff', showlegend: false }, { responsive: true, displayModeBar: false });
    } catch (e) { console.error('Chart error:', e); }
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = { 'Active': 'bg-green-100 text-green-700', 'Pending': 'bg-amber-100 text-amber-700', 'Closed': 'bg-gray-100 text-gray-600' };
    return map[status] || 'bg-gray-100 text-gray-700';
  }

  getPriorityClass(priority: string): string {
    const map: Record<string, string> = { 'High': 'bg-red-100 text-red-700', 'Medium': 'bg-amber-100 text-amber-700', 'Low': 'bg-green-100 text-green-700' };
    return map[priority] || 'bg-gray-100 text-gray-700';
  }
}