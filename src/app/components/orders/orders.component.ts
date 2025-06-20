import { Component, OnInit } from '@angular/core';
import { SidemenuComponent } from "../sidemenu/sidemenu.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [SidemenuComponent,CommonModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {

  orders: any[] = [];
   showTemplate  = false

  ngOnInit(): void {
    
    const storedData = localStorage.getItem('orders');

    if (storedData) {
      this.orders = JSON.parse(storedData);
    } else {
     
      const initialOrders = [
        {
          id: "#583488/80",
          type: "Event",
          date: "18-10-2021",
          address: "Hyderbad",
          status: "Completed"
        },
        {
          id: "#583489/81",
          type: "Service",
          date: "22-11-2021",
          address: "Mumbai",
          status: "Pending"
        }
      ];

      localStorage.setItem('orders', JSON.stringify(initialOrders));
      this.orders = initialOrders;
    }
  }
   toggle  (){
    this. showTemplate = !this.showTemplate
   }
}
