import { Component } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';

@Component({
  selector: 'shoe',
  templateUrl: 'shoe.html',
  styleUrls: ['shoe.scss']
})

export class SafetyShoeComponent {

  API: {};
  
  constructor(private title: Title, public meta: Meta) {
  }

  ngOnInit() {
    this.API = CONSTANTS;
    this.meta.addTag({ "property": "og:title", "content": "Safety Shoes Buying Guide by Moglix.com" });
    this.title.setTitle("Safety Shoes Buying Guide by Moglix.com");
    this.meta.addTag({ "name": "description", "content": "Read how to effectively buy Safety Shoes at Moglix.com with exclusive buying guide on popular industrial products." })

  }
}