import { Component } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import CONSTANTS from '../../config/constants';

@Component({
  selector: 'max',
  templateUrl: 'max.html',
  styleUrls: ['max.scss']
})

export class MaxComponent {
  API: {}
  constructor(private title: Title, private meta: Meta) {
    this.API = CONSTANTS;
    this.title.setTitle("Introducing Moglix Max - Facilitate GST compliance to SME’s");
    this.meta.addTag({ "name": "description", "content": "Max, a product by Moglix, is designed precisely to facilitate GST compliance to SME’s. Buy now to enjoy additional benefits on other products of Moglix." });
  }
}
