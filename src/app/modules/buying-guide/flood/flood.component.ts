import { Component } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';

@Component({
  selector: 'flood',
  templateUrl: 'flood.html',
  styleUrls: ['flood.scss']
})

export class FloodComponent {

  API: {}

  constructor(private title: Title, public meta: Meta) {
  }
  
  ngOnInit() {
    this.API = CONSTANTS;
    this.title.setTitle("Flood Lights Buying Guide by Moglix.com");
    this.meta.addTag({ "property": "og:title", "content": "Flood Lights Buying Guide by Moglix.com" });
    this.meta.addTag({ "name": "description", "content": "Read how to effectively buy Flood Lights at Moglix.com with exclusive buying guide on popular industrial products." })
  }
}