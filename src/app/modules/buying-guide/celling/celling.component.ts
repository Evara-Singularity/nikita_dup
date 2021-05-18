import { Component } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';

@Component({
  selector: 'celling',
  templateUrl: 'celling.html',
  styleUrls: ['celling.scss']
})

export class CellingComponent {

  API: {}
  constructor(private title: Title, public meta: Meta) {
  }
  ngOnInit() {
    this.API = CONSTANTS;
    this.meta.addTag({ "property": "og:title", "content": "Fans Buying Guide by Moglix.com" });
    this.title.setTitle("Fans Buying Guide by Moglix.com");
    this.meta.addTag({ "name": "description", "content": "Read how to effectively buy Fans at Moglix.com with exclusive buying guide on popular industrial products." })
  }
}