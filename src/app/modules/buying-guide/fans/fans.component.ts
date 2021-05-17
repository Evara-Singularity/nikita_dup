import { Component } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';

@Component({
  selector: 'fans',
  templateUrl: 'fans.html',
  styleUrls: ['fans.scss']
})

export class FansComponent {
  API: {};
  constructor(private title: Title, public meta: Meta) {
    this.API = CONSTANTS;
  }

  ngOnInit() {
    this.meta.addTag({ "property": "og:title", "content": "Fans Buying Guide by Moglix.com" });
    this.title.setTitle("Fans Buying Guide by Moglix.com");
    this.meta.addTag({ "name": "description", "content": "Read how to effectively buy Fans at Moglix.com with exclusive buying guide on popular industrial products." })
  }
}