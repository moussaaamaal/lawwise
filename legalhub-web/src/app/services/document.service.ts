import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environments/environment';

export interface DocEntry {
  id: string;
  name: string;
  size: string;
  ago: string;
  iconBg: string;
  iconColor: string;
  icon: string;
  url: string;
}

interface RawDoc {
  id: string;
  file_name: string;
  file_type: string;
  file_size_mb: number;
  storage_url: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private http = inject(HttpClient);
  private api  = environment.apiUrl;

  async listForCase(caseId: string): Promise<DocEntry[]> {
    const raw = await firstValueFrom(
      this.http.get<RawDoc[]>(`${this.api}/api/documents`, { params: { case_id: caseId } })
    );
    return raw.map(r => this._map(r));
  }

  async uploadFile(file: File, caseId: string): Promise<DocEntry> {
    const form = new FormData();
    form.append('file', file);
    form.append('case_id', caseId);
    const raw = await firstValueFrom(
      this.http.post<RawDoc>(`${this.api}/api/documents/upload`, form)
    );
    return this._map(raw);
  }

  async deleteDocument(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.api}/api/documents/${id}`));
  }

  // Download via fetch → Blob pour contourner les restrictions CORS du navigateur
  async downloadFile(doc: DocEntry): Promise<void> {
    try {
      const res  = await fetch(doc.url);
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = doc.name;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(doc.url, '_blank');
    }
  }

  private _map(raw: RawDoc): DocEntry {
    const styles: Record<string, { bg: string; color: string; icon: string }> = {
      PDF:   { bg: 'bg-red-100',    color: 'text-red-600',    icon: 'fa-file-pdf' },
      WORD:  { bg: 'bg-blue-100',   color: 'text-blue-600',   icon: 'fa-file-word' },
      IMAGE: { bg: 'bg-purple-100', color: 'text-purple-600', icon: 'fa-file-image' },
      OTHER: { bg: 'bg-gray-100',   color: 'text-gray-600',   icon: 'fa-file' },
    };
    const s = styles[raw.file_type] ?? styles['OTHER'];
    return {
      id:        raw.id,
      name:      raw.file_name,
      size:      `${(raw.file_size_mb ?? 0).toFixed(1)} MB`,
      ago:       this._ago(raw.created_at),
      iconBg:    s.bg,
      iconColor: s.color,
      icon:      s.icon,
      url:       raw.storage_url ?? '',
    };
  }

  private _ago(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60_000);
    if (m < 60)  return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24)  return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }
}
