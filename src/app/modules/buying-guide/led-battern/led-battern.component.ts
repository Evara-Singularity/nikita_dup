import { Component } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';

@Component({
  selector: 'led-battern',
  templateUrl: 'led-battern.html',
  styleUrls: ['led-battern.scss'],
})

export class BatternComponent {

  API: {}

  constructor(private title: Title, public meta: Meta) {
  }

  ngOnInit() {
    this.API = CONSTANTS;
    this.meta.addTag({ "property": "og:title", "content": "LED Battern Buying Guide by Moglix.com" });
    this.title.setTitle("LED Battern Buying Guide by Moglix.com");
    this.meta.addTag({ "name": "description", "content": "Read how to effectively buy LED Battern at Moglix.com with exclusive buying guide on popular industrial products." })
  }
}