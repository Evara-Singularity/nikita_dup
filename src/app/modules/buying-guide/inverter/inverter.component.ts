import { Component } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';

@Component({
  selector: 'inverter',
  templateUrl: 'inverter.html',
  styleUrls: ['inverter.scss']
})

export class InverterComponent {
  API: {}
  constructor(private title: Title, public meta: Meta) {
  }

  ngOnInit() {
    this.API = CONSTANTS;
    this.meta.addTag({ "property": "og:title", "content": "Inverter Buying Guide by Moglix.com" });
    this.title.setTitle("Inverter Buying Guide by Moglix.com");
    this.meta.addTag({ "name": "description", "content": "Read how to effectively buy Inverter at Moglix.com with exclusive buying guide on popular industrial products." })
  }
}