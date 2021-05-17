import { Component } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';

@Component({
  selector: 'led',
  templateUrl: 'led.html',
  styleUrls: ['led.scss']
})

export class LedComponent {
  API: {}
  constructor(private title: Title, public meta: Meta) {
  }

  ngOnInit() {
    this.API = CONSTANTS;
    this.meta.addTag({ "property": "og:title", "content": "LED Buying Guide by Moglix.com" });
    this.title.setTitle("LED Buying Guide by Moglix.com");
    this.meta.addTag({ "name": "description", "content": "Read how to effectively buy LED at Moglix.com with exclusive buying guide on popular industrial products." })
  }
}