import { Component } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';

@Component({
  selector: 'cctv',
  templateUrl: 'cctv.html',
  styleUrls: ['cctv.scss']
})

export class CctvComponent {
  API: {}
  
  constructor(private title: Title, public meta: Meta) {
  }

  ngOnInit() {
    this.API = CONSTANTS;
    this.meta.addTag({ "property": "og:title", "content": "CCTV Buying Guide by Moglix.com" });
    this.title.setTitle("CCTV  Buying Guide by Moglix.com");
    this.meta.addTag({ "name": "description", "content": "Read how to effectively buy CCTV at Moglix.com with exclusive buying guide on popular industrial products." })
  }
}