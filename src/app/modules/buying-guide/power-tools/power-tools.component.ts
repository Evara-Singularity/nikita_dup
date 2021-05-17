import { Component } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';

@Component({
  selector: 'power-tools',
  templateUrl: 'power-tools.html',
  styleUrls: ['power-tools.scss']
})

export class PowerToolsComponent {
  API: {}
  constructor(private title: Title, public meta: Meta) {
  }

  ngOnInit() {
    this.API = CONSTANTS;
    this.meta.addTag({ "property": "og:title", "content": "Power Tools Buying Guide by Moglix.com" });
    this.title.setTitle("Power Tools  Buying Guide by Moglix.com");
    this.meta.addTag({ "name": "description", "content": "Read how to effectively buy Power Tools at Moglix.com with exclusive buying guide on popular industrial products." })
  }
}