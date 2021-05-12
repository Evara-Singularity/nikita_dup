import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'payement',
    templateUrl:'./payment-options.component.html',
    styleUrls: ['faq.scss']
})

export class PaymentOptionsComponent implements OnInit {
    constructor(private title:Title) { }

    ngOnInit() {
        this.title.setTitle("Payment-Moglix.com");
     }
}