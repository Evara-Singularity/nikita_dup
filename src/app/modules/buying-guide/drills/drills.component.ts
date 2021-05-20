import { Component} from '@angular/core';
import { Title,Meta } from  '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';

@Component({
  selector: 'drills',
  templateUrl: 'drills.html',
  styleUrls: ['drills.scss']
})

export class DrillComponent {
  API:{}
  constructor(private title:Title,public meta:Meta){
  }

  ngOnInit(){
    this.API = CONSTANTS;
    this.meta.addTag({"property":"og:title","content":"Drills Buying Guide by Moglix.com"});
    this.title.setTitle("Drills Buying Guide by Moglix.com");
    this.meta.addTag({ "name": "description", "content": "Read how to effectively buy Drills at Moglix.com with exclusive buying guide on popular industrial products." })
  }
}
