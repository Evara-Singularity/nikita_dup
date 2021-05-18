import { Component } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';

@Component({
  selector: 'angle',
  templateUrl: 'angle.html',
  styleUrls: ['angle.scss']
})

export class AngleComponent {

  API: {}
  constructor(
    private title: Title,
    public meta: Meta) {

    this.API = CONSTANTS;
    this.setMetas();
  }
  setMetas() {
    this.meta.addTag({ "property": "og:title", "content": "Angle Grinder Buying Guide by Moglix.com" });
    this.title.setTitle("Angle Grinder Buying Guide by Moglix.com");
    this.meta.addTag({ "name": "description", "content": "Read how to effectively buy Angle Grinder  at Moglix.com with exclusive buying guide on popular industrial products." })
  }
}