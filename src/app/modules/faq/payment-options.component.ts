import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';

@Component({
    selector: 'payement',
    templateUrl:'./payment-options.component.html',
    styleUrls: ['faq.scss']
})

export class PaymentOptionsComponent implements OnInit {
    
    readonly CONSTANTS = CONSTANTS

    constructor(private title:Title) { }

    ngOnInit() {
        this.title.setTitle("Payment-Moglix.com");
     }
}