import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidemenuComponent } from "../sidemenu/sidemenu.component";
import { HeaderComponent } from "../header/header.component";
import { NavigationService } from '../../services/navigation.service';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexLegend,
  ApexGrid,
  ApexPlotOptions,
  ApexFill,
  ApexTooltip,
  NgApexchartsModule
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  yaxis: ApexYAxis;
  title: ApexTitleSubtitle;
  labels: string[];
  legend: ApexLegend;
  grid: ApexGrid;
  colors: string[];
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  tooltip: ApexTooltip;
};

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, SidemenuComponent, HeaderComponent, NgApexchartsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  // Common header state and logic moved to HeaderComponent

  // Chart properties
  public revenueChartOptions!: Partial<ChartOptions>;
  public userActivityChartOptions!: Partial<ChartOptions>;

  // Dashboard Stats
  dashboardStats = {
    totalRevenue: '₹12,45,000',
    totalOrders: '2,834',
    registeredChefs: '156',
    pendingApprovals: '12'
  };

  // Dummy data for recent orders
  recentOrders: any[] = [
    { id: '#ORD-7234', customer: 'John Doe', item: 'Wedding Event Planning', amount: 4500.00, status: 'Completed', date: '2023-10-24' },
    { id: '#ORD-7235', customer: 'Sarah Smith', item: 'Executive Chef Service', amount: 325.50, status: 'Processing', date: '2023-10-24' },
    { id: '#ORD-7236', customer: 'Mike Johnson', item: 'Catering - 50 Guest Service', amount: 2800.00, status: 'Shipped', date: '2023-10-23' },
    { id: '#ORD-7237', customer: 'Emily Brown', item: 'Corporate Lunch Event', amount: 1800.00, status: 'Completed', date: '2023-10-23' },
    { id: '#ORD-7238', customer: 'David Wilson', item: 'Private Chef Booking', amount: 245.50, status: 'Pending', date: '2023-10-22' }
  ];

  constructor(private navigationService: NavigationService) { }

  ngOnInit(): void {
    this.initCharts();
  }

  // Chart initialization remains here
  initCharts(): void {
    this.revenueChartOptions = {
      series: [
        {
          name: "Revenue",
          data: [3100, 4000, 2800, 5100, 4200, 10900, 10000]
        },
        {
          name: "Expenses",
          data: [1100, 3200, 4500, 3200, 3400, 5200, 4100]
        }
      ],
      chart: {
        height: 350,
        type: "area",
        toolbar: { show: false },
        animations: { enabled: true, easing: 'easeinout', speed: 800 }
      },
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 3 },
      colors: ["#6366f1", "#f43f5e"],
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0.05,
          stops: [20, 100]
        }
      },
      xaxis: {
        categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      grid: {
        borderColor: "rgba(226, 232, 240, 0.5)",
        strokeDashArray: 4
      },
      tooltip: { x: { format: "dd/MM/yy HH:mm" } },
      legend: { position: 'top', horizontalAlign: 'right' }
    };

    this.userActivityChartOptions = {
      series: [
        {
          name: "New Users",
          data: [44, 55, 57, 56, 61, 58, 63]
        },
        {
          name: "Returning Users",
          data: [76, 85, 101, 98, 87, 105, 91]
        }
      ],
      chart: {
        type: "bar",
        height: 350,
        toolbar: { show: false },
        stacked: false
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          borderRadius: 6
        }
      },
      dataLabels: { enabled: false },
      stroke: { show: true, width: 2, colors: ["transparent"] },
      xaxis: {
        categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        axisBorder: { show: false }
      },
      colors: ["#8b5cf6", "#ec4899"],
      fill: { opacity: 1 },
      tooltip: {
        y: {
          formatter: function (val: any) {
            return val + " users";
          }
        }
      },
      grid: {
        borderColor: "rgba(226, 232, 240, 0.5)",
        strokeDashArray: 4
      }
    };
  }

  onSearch(event: any): void {
    // Implement dashboard specific search if needed
  }
}
