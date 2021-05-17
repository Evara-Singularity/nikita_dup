import { Component } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';

@Component({
  selector: 'office',
  templateUrl: 'office.html',
  styleUrls: ['office.scss']
})

export class OfficeComponent {
  API: {}
  constructor(private title: Title, public meta: Meta) {
  }

  ngOnInit() {
    this.API = CONSTANTS;
    this.meta.addTag({ "property": "og:title", "content": "Office Supplies Buying Guide by Moglix.com" });
    this.title.setTitle("Office Supplies  Buying Guide by Moglix.com");
    this.meta.addTag({ "name": "description", "content": "Read how to effectively buy Office Supplies  at Moglix.com with exclusive buying guide on popular industrial products." })
  }
}