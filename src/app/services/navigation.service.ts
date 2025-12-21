import { Injectable } from '@angular/core';

export interface MenuItem {
    id: string;
    label: string;
    route: string;
    icon: string;
    roles: number[]; // Array of role IDs that can access this menu
}

@Injectable({
    providedIn: 'root'
})
export class NavigationService {
    // Role constants based on database structure
    static readonly ROLE_CUSTOMER = 1;
    static readonly ROLE_CHEF = 2;
    static readonly ROLE_VENDOR = 3;
    static readonly ROLE_ADMIN = 4;
    static readonly ROLE_EVENT_MANAGER = 5;

    private menuItems: MenuItem[] = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            route: '/dashboard',
            icon: 'dashboard',
            roles: [2, 3, 4, 5] // Chef, Vendor, Admin, Event Manager
        },
        {
            id: 'approvals',
            label: 'Approvals',
            route: '/approvals',
            icon: 'approval',
            roles: [4] // Admin only
        },
        {
            id: 'events',
            label: 'Events',
            route: '/events',
            icon: 'events',
            roles: [4, 5] // Admin and Event Manager
        },
        {
            id: 'services',
            label: 'Services',
            route: '/services',
            icon: 'services',
            roles: [4] // Admin only
        },
        {
            id: 'serviceItems',
            label: 'Service Items',
            route: '/service-items',
            icon: 'service-items',
            roles: [4] // Admin only
        },
        {
            id: 'menuItems',
            label: 'Menu Items',
            route: '/menu-items',
            icon: 'menu-items',
            roles: [4] // Admin only
        },
        {
            id: 'orders',
            label: 'Orders',
            route: '/orders',
            icon: 'orders',
            roles: [2, 3, 4] // Chef, Vendor, Admin
        },
        {
            id: 'users',
            label: 'Customers',
            route: '/users',
            icon: 'users',
            roles: [4] // Admin only
        },
        {
            id: 'cheffs',
            label: 'Chefs',
            route: '/cheffs',
            icon: 'chefs',
            roles: [4] // Admin only
        },
        {
            id: 'vendors',
            label: 'Vendors',
            route: '/vendors',
            icon: 'vendors',
            roles: [4] // Admin only
        },
        {
            id: 'payment-history',
            label: 'Payment History',
            route: '/payment-history',
            icon: 'payments',
            roles: [2, 3, 4] // Chef, Vendor, Admin
        }
    ];

    constructor() { }

    /**
     * Get menu items filtered by user role
     * @param userRole - The role ID of the current user
     * @returns Array of menu items accessible by the role
     */
    getMenuByRole(userRole: number): MenuItem[] {
        return this.menuItems.filter(item => item.roles.includes(userRole));
    }

    /**
     * Get current user role from localStorage
     * @returns User role ID or null if not found
     */
    getCurrentUserRole(): number | null {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                return user.role || null;
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    /**
     * Check if a route is accessible by the current user
     * @param route - The route to check
     * @returns true if accessible, false otherwise
     */
    canAccessRoute(route: string): boolean {
        const userRole = this.getCurrentUserRole();
        if (!userRole) return false;

        const menuItem = this.menuItems.find(item => item.route === route);
        if (!menuItem) return false;

        return menuItem.roles.includes(userRole);
    }
}
