import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../services/navigation.service';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
    @Output() searchEvent = new EventEmitter<string>();
    userName: string = 'Admin';
    userRole: string = 'Administrator';
    currentTime: string = '';
    showNotifications: boolean = false;
    showProfile: boolean = false;
    searchQuery: string = '';
    private timeInterval: any;

    constructor(private navigationService: NavigationService) { }

    ngOnInit(): void {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                this.userName = user.name || 'Admin';
                this.userRole = this.getUserRoleLabel(this.navigationService.getCurrentUserRole());
            } catch (e) {
                console.error('Error parsing user data', e);
            }
        }
        this.updateTime();
        this.timeInterval = setInterval(() => this.updateTime(), 60000);
    }

    ngOnDestroy(): void {
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
        }
    }

    updateTime(): void {
        const now = new Date();
        this.currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    getUserRoleLabel(roleId: number | null): string {
        switch (roleId) {
            case 4: return 'Administrator';
            case 2: return 'Chef';
            case 3: return 'Vendor';
            default: return 'User';
        }
    }

    toggleNotifications(): void {
        this.showNotifications = !this.showNotifications;
        this.showProfile = false;
    }

    toggleProfile(): void {
        this.showProfile = !this.showProfile;
        this.showNotifications = false;
    }

    onSearch(event: any): void {
        this.searchQuery = event.target.value;
        this.searchEvent.emit(this.searchQuery);
    }
}
