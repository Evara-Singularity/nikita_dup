import { Component } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';

@Component({
  selector: 'power',
  templateUrl: 'power.html',
  styleUrls: ['power.scss']
})

export class PowerComponent {
  API: {}
  constructor(private title: Title, public meta: Meta) {
  }

  ngOnInit() {
    this.API = CONSTANTS;
    this.meta.addTag({ "property": "og:title", "content": "Power Generation & Transformers Buying Guide by Moglix.com" });
    this.title.setTitle("Power Generation & Transformers Buying Guide by Moglix.com");
    this.meta.addTag({ "name": "description", "content": "Read how to effectively buy Power at Moglix.com with exclusive buying guide on popular industrial products." })
  }
}