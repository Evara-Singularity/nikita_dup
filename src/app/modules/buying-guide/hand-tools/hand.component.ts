import { Component } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';

@Component({
  selector: 'hand',
  templateUrl: 'hand.html',
  styleUrls: ['hand.scss']
})

export class HandComponent {
  API: {}

  constructor(private title: Title, public meta: Meta) {
    this.API = CONSTANTS;
  }

  ngOnInit() {
    this.meta.addTag({ "property": "og:title", "content": "Hand Tools Buying Guide by Moglix.com" });
    this.title.setTitle("Hand Tools  Buying Guide by Moglix.com");
    this.meta.addTag({ "name": "description", "content": "Read how to effectively buy Hand Tools at Moglix.com with exclusive buying guide on popular industrial products." })
  }
}