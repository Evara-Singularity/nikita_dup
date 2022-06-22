import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';

@Component({
    selector: 'order',
    templateUrl:'./order-tracking.component.html',
    styleUrls: ['faq.scss']
})

export class OrderTrackingComponent implements OnInit {

    readonly CONSTANTS = CONSTANTS

    constructor(private title:Title) { }

    ngOnInit() { 
        this.title.setTitle("Order Tracking-Moglix.com");
    }
}