import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'address-list',
    templateUrl: './address-list.component.html',
    styleUrls: ['./address-list.component.scss']
})
export class AddressListComponent implements OnInit
{
    @Input('type') type = "DELIVERY";
    constructor() { }
    ngOnInit() { }
}
