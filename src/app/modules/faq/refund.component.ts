import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'refund',
   templateUrl:'./refund.component.html',
   styleUrls: ['faq.scss']
})

export class RefundComponent implements OnInit {
    constructor(private title:Title) {
        this.title.setTitle("Refund-Moglix.com");
     }

    ngOnInit() { }
}