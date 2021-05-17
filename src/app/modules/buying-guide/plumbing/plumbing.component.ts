import { Component } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';

@Component({
  selector: 'plumbing',
  templateUrl: 'plumbing.html',
  styleUrls: ['plumbing.scss']
})

export class PlumbingComponent {

  API: {}
  
  constructor(private title: Title, public meta: Meta) {
  }

  ngOnInit() {
    this.API = CONSTANTS;
    this.meta.addTag({ "property": "og:title", "content": "Plumbing Buying Guide by Moglix.com" });
    this.title.setTitle("Plumbing Buying Guide by Moglix.com");
    this.meta.addTag({ "name": "description", "content": "Read how to effectively buy Plumbing at Moglix.com with exclusive buying guide on popular industrial products." })
  }
}