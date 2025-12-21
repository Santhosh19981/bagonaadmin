import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidemenuComponent } from "../sidemenu/sidemenu.component";
import { HeaderComponent } from "../header/header.component";

@Component({
    selector: 'app-orders',
    standalone: true,
    imports: [SidemenuComponent, CommonModule, HeaderComponent],
    templateUrl: './orders.component.html',
    styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {

    orders: any[] = [];
    filteredOrders: any[] = [];
    selectedOrder: any = null;
    showTemplate = false;
    searchQuery: string = '';
    activeTab: string = 'all';
    detailsActiveTab: string = 'events';
    servicesActiveCategory: string = 'Poultry & Mutton';

    ngOnInit(): void {
        const initialOrders = [
            {
                id: "ORD-583488",
                type: "Premium Event",
                date: "18-10-2025",
                address: "Gachibowli, Hyderabad",
                status: "Pending",
                summary: {
                    totalPrice: "₹45,000",
                    contactPerson: "Rahul Sharma",
                    phone: "+91 98765 43210",
                    email: "rahul.s@example.com",
                    fullAddress: "Plot No. 42, Gachibowli, Hyderabad, 500032"
                },
                events: [
                    { title: "Engagement Ceremony", date: "18/10/25", time: "06:00 PM", members: 150, contact: "9876543210", address: "Western Dallas center 5th Floor, Raidurg Village, Hyderabad", image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400" },
                    { title: "Reception Event", date: "20/10/25", time: "07:30 PM", members: 300, contact: "9876543210", address: "Survey No: 83/1 Raidurg Village, Serilingampally, Hyderabad", image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400" }
                ],
                cheffs: [
                    { name: "Executive Chef Anirudh", experience: "12+ Years", contact: "9876543210", address: "Banjara Hills, Hyderabad", image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400" },
                    { name: "Sous Chef Meera", experience: "8+ Years", contact: "9876543211", address: "Jubilee Hills, Hyderabad", image: "https://images.unsplash.com/photo-1583394238182-6f3ad3c2c1a1?w=400" }
                ],
                services: {
                    categories: ["Poultry & Mutton", "Kirana/Grocery", "Vegetables & Leafs"],
                    items: {
                        "Poultry & Mutton": [
                            { name: "Fresh Mutton", weight: "10kg", price: "₹8,500", icon: "bi-egg-fill" },
                            { name: "Premium Chicken", weight: "20kg", price: "₹5,200", icon: "bi-egg-fill" }
                        ],
                        "Kirana/Grocery": [
                            { name: "Basmati Rice", weight: "50kg", price: "₹4,500", icon: "bi-box-seam" },
                            { name: "Cooking Oil", weight: "15L", price: "₹2,800", icon: "bi-droplet-fill" }
                        ]
                    }
                }
            },
            {
                id: "ORD-583489",
                type: "Corporate Dinner",
                date: "22-11-2025",
                address: "Cyber City, Mumbai",
                status: "Completed",
                summary: {
                    totalPrice: "₹1,25,000",
                    contactPerson: "Anita Singh",
                    phone: "+91 91234 56789",
                    email: "anita.s@corp.com",
                    fullAddress: "Level 10, Tower B, Cyber City, Mumbai, 400001"
                },
                events: [
                    { title: "Annual Meet Interior", date: "22/11/25", time: "08:00 PM", members: 500, contact: "9123456789", address: "Grand Ballroom, Mumbai", image: "https://images.unsplash.com/photo-1540575861501-7ad0582373f1?w=400" }
                ],
                cheffs: [
                    { name: "Chef Vikram", experience: "15+ Years", contact: "9123456789", address: "Andheri West, Mumbai", image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400" }
                ],
                services: {
                    categories: ["Poultry & Mutton", "Kirana/Grocery"],
                    items: {
                        "Poultry & Mutton": [
                            { name: "Prime Ribs", weight: "15kg", price: "₹12,000", icon: "bi-egg-fill" }
                        ]
                    }
                }
            },
            {
                id: "ORD-583490",
                type: "Wedding Gala",
                date: "05-12-2025",
                address: "Whitefield, Bangalore",
                status: "Pending",
                summary: { totalPrice: "₹2,50,000", contactPerson: "Suresh Reddy", phone: "+91 99887 76655", email: "suresh.r@wedding.in", fullAddress: "Royal Orchid Resort, Bangalore" },
                events: [{ title: "Grand Wedding", date: "05/12/25", time: "06:30 PM", members: 1000, contact: "9988776655", address: "Resort Lawn, Bangalore", image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400" }],
                cheffs: [{ name: "Chef Karthik", experience: "20+ Years", contact: "9988776655", address: "Indiranagar, Bangalore", image: "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=400" }],
                services: { categories: ["Poultry & Mutton", "Vegetables & Leafs"], items: { "Vegetables & Leafs": [{ name: "Organic Salad Mix", weight: "5kg", price: "₹1,500", icon: "bi-leaf" }] } }
            }
        ];

        // Add 7 more similar records to make it 10
        for (let i = 4; i <= 10; i++) {
            initialOrders.push({
                ...initialOrders[i % 3],
                id: `ORD-5834${87 + i}`,
                date: `${10 + i}-12-2025`,
                status: i % 2 === 0 ? "Completed" : "Cancelled"
            });
        }

        this.orders = initialOrders;
        this.filteredOrders = [...this.orders];
    }

    onSearch(query: string) {
        this.searchQuery = query;
        this.applyFilters();
    }

    setFilter(tab: string) {
        this.activeTab = tab;
        this.applyFilters();
    }

    applyFilters() {
        this.filteredOrders = this.orders.filter(order => {
            const matchesSearch = !this.searchQuery ||
                order.id.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                order.address.toLowerCase().includes(this.searchQuery.toLowerCase());

            const matchesTab = this.activeTab === 'all' ||
                order.status.toLowerCase() === this.activeTab.toLowerCase();

            return matchesSearch && matchesTab;
        });
    }

    viewDetails(order: any) {
        this.selectedOrder = order;
        this.showTemplate = true;
        this.detailsActiveTab = 'events'; // Default tab
        if (order.services?.categories?.length) {
            this.servicesActiveCategory = order.services.categories[0];
        }
    }

    closeDetails() {
        this.showTemplate = false;
        this.selectedOrder = null;
    }

    toggle() {
        this.showTemplate = !this.showTemplate;
    }

    setDetailsTab(tab: string) {
        this.detailsActiveTab = tab;
    }

    setServiceCategory(category: string) {
        this.servicesActiveCategory = category;
    }
}
