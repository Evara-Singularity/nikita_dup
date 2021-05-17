import { Component} from '@angular/core';
import { Title,Meta } from  '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';

@Component({
  selector: 'wire',
  templateUrl: 'wire.html',
  styleUrls: ['wire.scss']
})

export class WireComponent {
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  
  constructor(private title:Title,public meta:Meta){
  }

  ngOnInit(){
    this.meta.addTag({"property":"og:title","content":"Wires Buying Guide by Moglix.com"});
    this.title.setTitle("Wires Buying Guide by Moglix.com");
    this.meta.addTag({ "name": "description", "content": "Read how to effectively buy Wires at Moglix.com with exclusive buying guide on popular industrial products." })
  }
}