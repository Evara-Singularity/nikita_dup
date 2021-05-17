import { Component } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';

@Component({
  selector: 'respiratory',
  templateUrl: 'respiratory.html',
  styleUrls: ['respiratory.scss']
})

export class RespiratoryComponent {
  API: {}
  constructor(private title: Title, public meta: Meta) {
  }

  ngOnInit() {
    this.API = CONSTANTS;
    this.title.setTitle("Respiratory Masks Buying Guide by Moglix.com");
    this.meta.addTag({ "property": "og:title", "content": "Respiratory Masks Buying Guide by Moglix.com" });
    this.meta.addTag({ "name": "description", "content": "Read how to effectively buy Respiratory Masks at Moglix.com with exclusive buying guide on popular industrial products." })
  }
}