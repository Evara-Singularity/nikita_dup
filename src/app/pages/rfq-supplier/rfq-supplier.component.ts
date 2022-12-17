import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-rfq-supplier',
  templateUrl: './rfq-supplier.component.html',
  styleUrls: ['./rfq-supplier.component.scss']
})
export class RfqSupplierComponent implements OnInit {

  openPopup: boolean;
  constructor() { }

  ngOnInit() {
    console.log('heyy')
  }

}
