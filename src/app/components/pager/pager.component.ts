import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

/**
 * Pager: [<]  1 2 3 4 5 …  [>]
 * Every page number is shown in a horizontal row (scrolls sideways when there are many);
 * click a number to jump to it, or use the arrows to step one page back / forward.
 */
@Component({
  selector: 'app-pager',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-2 select-none" *ngIf="totalPages > 0">
      <button type="button" (click)="go(currentPage - 1)" [disabled]="currentPage <= 1"
        aria-label="Previous page"
        class="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-yellow-600 hover:border-yellow-500/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
        <i class="bi bi-chevron-left text-sm"></i>
      </button>

      <div #row class="flex items-center gap-1 max-w-[60vw] sm:max-w-xl overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        <button *ngFor="let p of pages" type="button" (click)="go(p)"
          [attr.data-page]="p" [attr.aria-current]="p === currentPage ? 'page' : null"
          [ngClass]="p === currentPage ? 'bg-yellow-500 text-white shadow-sm shadow-yellow-500/30' : 'text-slate-500 hover:bg-slate-100'"
          class="min-w-[2rem] h-7 px-1.5 shrink-0 flex items-center justify-center rounded-lg text-xs font-black transition-all">
          {{ p }}
        </button>
      </div>

      <button type="button" (click)="go(currentPage + 1)" [disabled]="currentPage >= totalPages"
        aria-label="Next page"
        class="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-yellow-600 hover:border-yellow-500/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
        <i class="bi bi-chevron-right text-sm"></i>
      </button>
    </div>
  `
})
export class PagerComponent implements AfterViewChecked {
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Output() pageChange = new EventEmitter<number>();

  @ViewChild('row') row?: ElementRef<HTMLElement>;
  private shownPage = 0;

  get pages(): number[] {
    return Array.from({ length: Math.max(this.totalPages, 0) }, (_, i) => i + 1);
  }

  go(page: number) {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.pageChange.emit(page);
  }

  /** When the row overflows, keep the current page number scrolled into view. */
  ngAfterViewChecked() {
    if (!this.row || this.shownPage === this.currentPage) return;
    this.shownPage = this.currentPage;
    const el = this.row.nativeElement;
    const btn = el.querySelector<HTMLElement>(`[data-page="${this.currentPage}"]`);
    if (btn && el.scrollWidth > el.clientWidth) {
      el.scrollLeft = btn.offsetLeft - el.clientWidth / 2 + btn.offsetWidth / 2;
    }
  }
}
