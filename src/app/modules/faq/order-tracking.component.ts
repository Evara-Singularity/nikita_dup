import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'order',
    templateUrl:'./order-tracking.component.html',
    styleUrls: ['faq.scss']
})

export class OrderTrackingComponent implements OnInit {
    constructor(private title:Title) { }

    ngOnInit() { 
        this.title.setTitle("Order Tracking-Moglix.com");
    }
}