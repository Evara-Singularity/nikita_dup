import { Component } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';

@Component({
  selector: 'stablizer',
  templateUrl: 'stablizer.html',
  styleUrls: ['stablizer.scss']
})

export class StablizerComponent {
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  constructor(private title: Title, public meta: Meta) {
  }

  ngOnInit() {
    this.meta.addTag({ "property": "og:title", "content": "Stabilizer Buying Guide by Moglix.com" });
    this.title.setTitle("Stablizer  Buying Guide by Moglix.com");
    this.meta.addTag({ "name": "description", "content": "Read how to effectively buy Stabilizer at Moglix.com with exclusive buying guide on popular industrial products." })
  }
}