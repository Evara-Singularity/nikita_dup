import { Component } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';

@Component({
  selector: 'safety',
  templateUrl: 'safety.html',
  styleUrls: ['safety.scss']
})

export class SafetyHelmetComponent {

  API: {}
  constructor(private title: Title, public meta: Meta) {
  }
  ngOnInit() {
    this.API = CONSTANTS;
    this.meta.addTag({ "property": "og:title", "content": "Safety Helmets Buying Guide by Moglix.com" });
    this.title.setTitle("Safety Helmets  Buying Guide by Moglix.com");
    this.meta.addTag({ "name": "description", "content": "Read how to effectively buy Safety Helmets at Moglix.com with exclusive buying guide on popular industrial products." })
  }
}