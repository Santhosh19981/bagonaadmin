import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { SidemenuComponent } from '../sidemenu/sidemenu.component';
import { HeaderComponent } from '../header/header.component';

type RuleType = 'guest_count' | 'bill_amount';
type DiscountType = 'fixed' | 'percentage';
type StatusFilter = 'all' | RuleType;

interface DiscountForm {
  id: number | null;
  title: string;
  description: string;
  rule_type: RuleType;
  min_value: number | null;
  discount_type: DiscountType;
  discount_value: number | null;
  max_discount: number | null;
  start_date: string;
  end_date: string;
  always: boolean;
  is_active: number;
}

@Component({
  selector: 'app-discount-management',
  standalone: true,
  imports: [CommonModule, FormsModule, SidemenuComponent, HeaderComponent],
  templateUrl: './discount-management.component.html',
  styleUrl: './discount-management.component.scss'
})
export class DiscountManagementComponent implements OnInit {
  actor: { actor_id: number; actor_role: number } | null = null;
  isAdmin = false;

  discounts: any[] = [];
  filter: StatusFilter = 'all';
  loading = false;
  submitting = false;
  togglingId: number | null = null;

  showModal = false;
  isEdit = false;
  form: DiscountForm = this.emptyForm();
  errors: Record<string, string> = {};
  submitted = false;

  deleteTarget: any = null;
  deleting = false;

  readonly today = this.toDateStr(new Date());

  constructor(private apiService: ApiService, private toastr: ToastrService) { }

  ngOnInit() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      if (user?.id && user?.role) {
        this.actor = { actor_id: Number(user.id), actor_role: Number(user.role) };
        this.isAdmin = Number(user.role) === 4;
        this.loadDiscounts();
      }
    } catch {
      this.actor = null;
    }
  }

  // ── Data ─────────────────────────────────────────────────────────────────
  loadDiscounts() {
    if (!this.actor) return;
    this.loading = true;
    this.apiService.getDiscounts(this.actor).subscribe({
      next: (res: any) => {
        this.discounts = res?.data || [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error(err?.error?.message || 'Failed to load discounts');
      }
    });
  }

  get filteredDiscounts() {
    return this.filter === 'all' ? this.discounts : this.discounts.filter(d => d.rule_type === this.filter);
  }

  get activeCount() {
    return this.discounts.filter(d => this.statusOf(d) === 'active').length;
  }

  countBy(type: RuleType) {
    return this.discounts.filter(d => d.rule_type === type).length;
  }

  // ── Display helpers ─────────────────────────────────────────────────────
  statusOf(d: any): 'active' | 'paused' | 'scheduled' | 'expired' {
    if (!Number(d.is_active)) return 'paused';
    if (d.end_date && d.end_date < this.today) return 'expired';
    if (d.start_date && d.start_date > this.today) return 'scheduled';
    return 'active';
  }

  statusClass(d: any) {
    switch (this.statusOf(d)) {
      case 'active': return 'bg-green-100 text-green-600';
      case 'scheduled': return 'bg-blue-100 text-blue-600';
      case 'expired': return 'bg-red-50 text-red-500';
      default: return 'bg-slate-100 text-slate-500';
    }
  }

  valueLabel(d: { discount_type: string; discount_value: any }) {
    const v = Number(d.discount_value) || 0;
    return d.discount_type === 'percentage' ? `${this.trimNum(v)}% OFF` : `₹${this.money(v)} OFF`;
  }

  conditionLabel(d: { rule_type: string; min_value: any }) {
    const v = Number(d.min_value) || 0;
    return d.rule_type === 'guest_count' ? `${this.trimNum(v)}+ guests` : `Bill ₹${this.money(v)}+`;
  }

  /** Plain-language summary shown live in the form. */
  get preview(): string {
    const f = this.form;
    if (!f.min_value || !f.discount_value) return 'Fill in the condition and discount to see a preview.';
    const who = f.rule_type === 'guest_count'
      ? `Orders with ${this.trimNum(f.min_value)} or more guests`
      : `Orders with a bill of ₹${this.money(f.min_value)} or more`;
    let what = f.discount_type === 'percentage'
      ? `get ${this.trimNum(f.discount_value)}% off the bill`
      : `get ₹${this.money(f.discount_value)} off`;
    if (f.discount_type === 'percentage' && f.max_discount) what += ` (up to ₹${this.money(f.max_discount)})`;
    const where = this.isAdmin ? ' from every vendor and chef' : '';
    return `${who}${where} ${what}.`;
  }

  /** Example: what a qualifying customer saves, using the threshold itself for bill rules. */
  get exampleSaving(): string | null {
    const f = this.form;
    if (f.rule_type !== 'bill_amount' || !f.min_value || !f.discount_value) return null;
    let amt = f.discount_type === 'percentage' ? (f.min_value * f.discount_value) / 100 : f.discount_value;
    if (f.discount_type === 'percentage' && f.max_discount) amt = Math.min(amt, f.max_discount);
    return `A ₹${this.money(f.min_value)} bill saves ₹${this.money(amt)}.`;
  }

  money(v: number) {
    return Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  }

  private trimNum(v: number) {
    return Number(v).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  }

  private toDateStr(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // ── Modal ────────────────────────────────────────────────────────────────
  emptyForm(): DiscountForm {
    return {
      id: null,
      title: '',
      description: '',
      rule_type: 'guest_count',
      min_value: null,
      discount_type: 'fixed',
      discount_value: null,
      max_discount: null,
      start_date: '',
      end_date: '',
      always: true,
      is_active: 1
    };
  }

  openAddModal() {
    this.isEdit = false;
    this.form = this.emptyForm();
    this.errors = {};
    this.submitted = false;
    this.showModal = true;
  }

  openEditModal(d: any) {
    if (!d.can_edit) return;
    this.isEdit = true;
    this.form = {
      id: d.id,
      title: d.title || '',
      description: d.description || '',
      rule_type: d.rule_type,
      min_value: d.min_value !== null ? Number(d.min_value) : null,
      discount_type: d.discount_type,
      discount_value: d.discount_value !== null ? Number(d.discount_value) : null,
      max_discount: d.max_discount !== null && d.max_discount !== undefined ? Number(d.max_discount) : null,
      start_date: d.start_date || '',
      end_date: d.end_date || '',
      always: !d.start_date && !d.end_date,
      is_active: Number(d.is_active) ? 1 : 0
    };
    this.errors = {};
    this.submitted = false;
    this.showModal = true;
  }

  closeModal() {
    if (this.submitting) return;
    this.showModal = false;
    this.form = this.emptyForm();
    this.errors = {};
    this.submitted = false;
  }

  setRuleType(t: RuleType) {
    if (this.form.rule_type === t) return;
    this.form.rule_type = t;
    this.form.min_value = null;
    this.revalidate();
  }

  /** Switching between ₹ and % changes what the number means, so start the value fresh. */
  setDiscountType(t: DiscountType) {
    if (this.form.discount_type === t) return;
    this.form.discount_type = t;
    this.form.discount_value = null;
    this.form.max_discount = null;
    this.revalidate();
  }

  /** "Always" on = no date window; turning it off asks for start and end dates. */
  toggleAlways() {
    this.form.always = !this.form.always;
    if (this.form.always) {
      this.form.start_date = '';
      this.form.end_date = '';
    } else if (!this.form.start_date) {
      this.form.start_date = this.today;
    }
    this.revalidate();
  }

  /** Re-run validation as the user types, but only after the first save attempt. */
  revalidate() {
    if (this.submitted) this.errors = this.validate();
  }

  validate(): Record<string, string> {
    const f = this.form;
    const e: Record<string, string> = {};
    const title = (f.title || '').trim();
    const min = f.min_value === null || (f.min_value as any) === '' ? NaN : Number(f.min_value);
    const val = f.discount_value === null || (f.discount_value as any) === '' ? NaN : Number(f.discount_value);
    const cap = f.max_discount === null || (f.max_discount as any) === '' ? null : Number(f.max_discount);

    if (title.length < 3 || title.length > 100) e['title'] = 'Title must be 3 to 100 characters.';
    if ((f.description || '').length > 255) e['description'] = 'Description must be 255 characters or fewer.';

    if (f.rule_type === 'guest_count') {
      if (!Number.isInteger(min) || min < 1 || min > 100000) e['min_value'] = 'Enter a whole number of guests between 1 and 100,000.';
    } else if (!Number.isFinite(min) || min < 1 || min > 100000000) {
      e['min_value'] = 'Enter a minimum bill between ₹1 and ₹10,00,00,000.';
    }

    if (f.discount_type === 'percentage') {
      if (!Number.isFinite(val) || val <= 0 || val >= 100) e['discount_value'] = 'Percentage must be greater than 0 and less than 100.';
      if (cap !== null && (!Number.isFinite(cap) || cap < 1)) e['max_discount'] = 'Maximum discount must be at least ₹1, or leave it empty.';
    } else {
      if (!Number.isFinite(val) || val < 1 || val > 10000000) e['discount_value'] = 'Fixed discount must be between ₹1 and ₹1,00,00,000.';
      else if (f.rule_type === 'bill_amount' && Number.isFinite(min) && val >= min) e['discount_value'] = 'Fixed discount must be less than the minimum bill amount.';
    }

    if (!f.always) {
      if (!f.start_date) e['start_date'] = 'Choose a start date.';
      if (!f.end_date) e['end_date'] = 'Choose an end date.';
      else if (f.start_date && f.end_date < f.start_date) e['end_date'] = 'End date cannot be before the start date.';
      else if (!this.isEdit && f.end_date < this.today) e['end_date'] = 'End date cannot be in the past.';
    }

    return e;
  }

  saveDiscount() {
    if (!this.actor || this.submitting) return;
    this.submitted = true;
    this.errors = this.validate();
    if (Object.keys(this.errors).length) {
      this.toastr.warning('Please fix the highlighted fields');
      return;
    }

    const f = this.form;
    const payload = {
      ...this.actor,
      title: f.title.trim(),
      description: (f.description || '').trim(),
      rule_type: f.rule_type,
      min_value: Number(f.min_value),
      discount_type: f.discount_type,
      discount_value: Number(f.discount_value),
      max_discount: f.discount_type === 'percentage' && f.max_discount ? Number(f.max_discount) : null,
      start_date: f.always ? null : (f.start_date || null),
      end_date: f.always ? null : (f.end_date || null),
      is_active: f.is_active
    };

    this.submitting = true;
    const req$ = this.isEdit && f.id
      ? this.apiService.updateDiscount(f.id, payload)
      : this.apiService.createDiscount(payload);

    req$.subscribe({
      next: (res: any) => {
        this.submitting = false;
        if (res?.status) {
          this.toastr.success(res.message || `Discount ${this.isEdit ? 'updated' : 'created'}`);
          this.closeModal();
          this.loadDiscounts();
        } else {
          this.toastr.error(res?.message || 'Operation failed');
        }
      },
      error: (err) => {
        this.submitting = false;
        if (err?.error?.errors) this.errors = { ...this.errors, ...err.error.errors };
        this.toastr.error(err?.error?.message || 'Operation failed');
      }
    });
  }

  // ── Row actions ─────────────────────────────────────────────────────────
  toggleStatus(d: any) {
    if (!this.actor || !d.can_edit || this.togglingId) return;
    const next = Number(d.is_active) ? 0 : 1;
    this.togglingId = d.id;
    this.apiService.setDiscountStatus(d.id, next, this.actor).subscribe({
      next: (res: any) => {
        this.togglingId = null;
        if (res?.status) {
          d.is_active = next;
          this.toastr.success(res.message || 'Status updated');
        }
      },
      error: (err) => {
        this.togglingId = null;
        this.toastr.error(err?.error?.message || 'Could not update status');
      }
    });
  }

  askDelete(d: any) {
    if (d.can_edit) this.deleteTarget = d;
  }

  cancelDelete() {
    if (!this.deleting) this.deleteTarget = null;
  }

  confirmDelete() {
    if (!this.actor || !this.deleteTarget) return;
    this.deleting = true;
    this.apiService.deleteDiscount(this.deleteTarget.id, this.actor).subscribe({
      next: (res: any) => {
        this.deleting = false;
        if (res?.status) {
          this.toastr.success(res.message || 'Discount deleted');
          this.discounts = this.discounts.filter(x => x.id !== this.deleteTarget.id);
        }
        this.deleteTarget = null;
      },
      error: (err) => {
        this.deleting = false;
        this.toastr.error(err?.error?.message || 'Could not delete discount');
      }
    });
  }
}
