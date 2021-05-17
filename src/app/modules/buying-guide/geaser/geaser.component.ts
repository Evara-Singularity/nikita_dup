import { Component } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';

@Component({
  selector: 'geaser',
  templateUrl: 'geaser.html',
  styleUrls: ['geaser.scss']
})

export class GeaserComponent {
  API: {}
  constructor(private title: Title, public meta: Meta) {
  }

  ngOnInit() {
    this.API = CONSTANTS;
    this.meta.addTag({ "property": "og:title", "content": "Geysers Buying Guide by Moglix.com" });
    this.title.setTitle("Geysers Buying Guide by Moglix.com");
    this.meta.addTag({ "name": "description", "content": "Read how to effectively buy Geysers at Moglix.com with exclusive buying guide on popular industrial products." })
  }
}