import { Component } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';

@Component({
  selector: 'printer',
  templateUrl: 'printer.html',
  styleUrls: ['printer.scss']
})

export class PrinterComponent {
  API: {}
  
  constructor(private title: Title, public meta: Meta) {
  }

  ngOnInit() {
    this.API = CONSTANTS;
    this.meta.addTag({ "property": "og:title", "content": "Printers Buying Guide by Moglix.com" });
    this.title.setTitle("Printers  Buying Guide by Moglix.com");
    this.meta.addTag({ "name": "description", "content": "Read how to effectively buy Printers  at Moglix.com with exclusive buying guide on popular industrial products." })
  }
}