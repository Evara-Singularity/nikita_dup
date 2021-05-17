import { Component } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';

@Component({
  selector: 'polisher',
  templateUrl: 'polisher.html',
  styleUrls: ['polisher.scss']
})

export class PolisherComponent {
  API: {};
  constructor(private title: Title, public meta: Meta) {
  }

  ngOnInit() {
    this.API = CONSTANTS;
    this.meta.addTag({ "property": "og:title", "content": "Sanders and Polisher Buying Guide by Moglix.com" });
    this.title.setTitle("Sanders and Polisher Buying Guide by Moglix.com");
    this.meta.addTag({ "name": "description", "content": "Read how to effectively buy Sanders and Polisher at Moglix.com with exclusive buying guide on popular industrial products." })
  }
}