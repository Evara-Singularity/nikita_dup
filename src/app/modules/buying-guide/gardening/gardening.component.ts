import { Component } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';

@Component({
  selector: 'gardening',
  templateUrl: 'gardening.html',
  styleUrls: ['gardening.scss']
})

export class GardenComponent {
  API: {};
  constructor(private title: Title, public meta: Meta) {
  }

  ngOnInit() {
    this.API = CONSTANTS;
    this.meta.addTag({ "property": "og:title", "content": "Gardening Buying Guide by Moglix.com" });
    this.title.setTitle("Gardening Buying Guide by Moglix.com");
    this.meta.addTag({ "name": "description", "content": "Read how to effectively buy Gardening at Moglix.com with exclusive buying guide on popular industrial products." })
  }
}
