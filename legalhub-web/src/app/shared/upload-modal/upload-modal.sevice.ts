import { Injectable, signal } from '@angular/core';

export interface UploadedFile {
  file: File;
  name: string;
  size: string;
  type: 'pdf' | 'word' | 'image' | 'other';
  progress: number;
  done: boolean;
  error: boolean;
}

@Injectable({ providedIn: 'root' })
export class UploadModalService {

  // ── UI state ─────────────────────────────────────────────
  showModal    = signal(false);
  isUploading  = signal(false);
  isDone       = signal(false);
  isDragging   = signal(false);

  // ── Form ─────────────────────────────────────────────────
  selectedCase      = signal('');
  selectedCategory  = signal('');
  selectedAttorney  = signal('');
  description       = signal('');
  files             = signal<UploadedFile[]>([]);

  // ── Lookups ──────────────────────────────────────────────
  readonly cases = [
    'Johnson vs. State Corporation',
    'Martinez Family Trust',
    'Thompson Real Estate Deal',
    'Anderson Employment Case',
    'Wilson Medical Malpractice',
    'Greenfield Corporate Merger',
  ];
  readonly categories = [
    'Contracts', 'Pleadings', 'Depositions', 'Financial',
    'Evidence', 'Medical', 'Correspondence', 'Court Orders', 'Other',
  ];
  readonly attorneys = [
    'Sarah Williams', 'Michael Chen', 'David Morrison',
    'Jennifer Lopez', 'Robert Taylor',
  ];

  // ── Accept filter per upload type ────────────────────────
  private _acceptFilter = signal('*');
  get acceptFilter() { return this._acceptFilter(); }

  // ── Open helpers ─────────────────────────────────────────
  open(accept = '*') {
    this._acceptFilter.set(accept);
    this.selectedCase.set('');
    this.selectedCategory.set('');
    this.selectedAttorney.set('');
    this.description.set('');
    this.files.set([]);
    this.isUploading.set(false);
    this.isDone.set(false);
    this.isDragging.set(false);
    this.showModal.set(true);
  }

  openPdf()    { this.open('.pdf'); }
  openWord()   { this.open('.doc,.docx'); }
  openImage()  { this.open('.jpg,.jpeg,.png,.gif,.webp'); }
  openFolder() { this.open('*'); }

  close() { this.showModal.set(false); }

  // ── File handling ────────────────────────────────────────
  addFiles(fileList: FileList | File[]) {
    const arr = Array.from(fileList);
    const mapped: UploadedFile[] = arr.map(f => ({
      file: f,
      name: f.name,
      size: this.formatSize(f.size),
      type: this.detectType(f),
      progress: 0,
      done: false,
      error: false,
    }));
    this.files.update(existing => [...existing, ...mapped]);
  }

  removeFile(index: number) {
    this.files.update(f => f.filter((_, i) => i !== index));
  }

  private formatSize(bytes: number): string {
    if (bytes < 1024)       return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  private detectType(f: File): UploadedFile['type'] {
    if (f.type === 'application/pdf') return 'pdf';
    if (f.type.includes('word') || f.name.endsWith('.doc') || f.name.endsWith('.docx')) return 'word';
    if (f.type.startsWith('image/')) return 'image';
    return 'other';
  }

  get typeIcon(): Record<UploadedFile['type'], string> {
    return {
      pdf:   'fa-solid fa-file-pdf text-red-500',
      word:  'fa-solid fa-file-word text-blue-500',
      image: 'fa-solid fa-file-image text-purple-500',
      other: 'fa-solid fa-file text-gray-500',
    };
  }

  get isValid() {
    return this.files().length > 0 && this.selectedCase() !== '';
  }

  // ── Upload simulation ────────────────────────────────────
  upload() {
    if (!this.isValid) return;
    this.isUploading.set(true);

    const total = this.files().length;
    let completed = 0;

    this.files().forEach((_, idx) => {
      const duration = 800 + Math.random() * 1200;
      const start = Date.now();
      const tick = () => {
        const pct = Math.min(100, Math.round(((Date.now() - start) / duration) * 100));
        this.files.update(arr =>
          arr.map((f, i) => i === idx ? { ...f, progress: pct } : f)
        );
        if (pct < 100) {
          requestAnimationFrame(tick);
        } else {
          this.files.update(arr =>
            arr.map((f, i) => i === idx ? { ...f, done: true } : f)
          );
          completed++;
          if (completed === total) {
            this.isUploading.set(false);
            this.isDone.set(true);
          }
        }
      };
      requestAnimationFrame(tick);
    });
  }
}