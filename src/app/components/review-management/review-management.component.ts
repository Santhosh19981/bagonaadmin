import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { SidemenuComponent } from '../sidemenu/sidemenu.component';
import { HeaderComponent } from '../header/header.component';

@Component({
    selector: 'app-review-management',
    standalone: true,
    imports: [CommonModule, FormsModule, SidemenuComponent, HeaderComponent],
    templateUrl: './review-management.component.html',
    styleUrls: ['./review-management.component.scss']
})
export class ReviewManagementComponent implements OnInit {
    vendorId: number | null = null;
    reviews: any[] = [];
    loading = false;
    stats: any = {
        average: 0,
        total: 0,
        stars: [0, 0, 0, 0, 0]
    };

    constructor(
        private apiService: ApiService,
        private toastr: ToastrService
    ) { }

    ngOnInit() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            this.vendorId = user.id;
            this.loadReviews();
        }
    }

    loadReviews() {
        if (!this.vendorId) return;
        this.loading = true;
        this.apiService.getVendorReviews(this.vendorId).subscribe({
            next: (res: any) => {
                this.reviews = res.data || [];
                this.calculateStats();
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.toastr.error('Failed to load reviews', 'Error');
            }
        });
    }

    calculateStats() {
        if (this.reviews.length === 0) return;

        let sum = 0;
        const starCounts = [0, 0, 0, 0, 0];

        this.reviews.forEach(r => {
            const rating = Math.round(r.rating);
            sum += r.rating;
            if (rating >= 1 && rating <= 5) {
                starCounts[rating - 1]++;
            }
        });

        this.stats.total = this.reviews.length;
        this.stats.average = (sum / this.reviews.length).toFixed(1);
        this.stats.stars = starCounts.reverse(); // 5 to 1
    }

    getStarArray(rating: number): any[] {
        return Array(Math.round(rating)).fill(0);
    }
}
