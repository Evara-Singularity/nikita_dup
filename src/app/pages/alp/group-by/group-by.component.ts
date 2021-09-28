import { Component, OnInit, Input } from '@angular/core';
import { CONSTANTS } from "@config/constants";

@Component({
  selector: 'group-by',
  templateUrl: './group-by.component.html',
  styleUrls: ['./group-by.component.scss']
})
export class GroupByComponent implements OnInit {

    @Input('name') name: string = '';
    @Input('products') products: any[] = [];
  readonly baseImgPath = CONSTANTS.IMAGE_BASE_URL;
    readonly defaultImage = this.baseImgPath + 'img/others/Card.jpg';
    readonly offset = 100;

  ngOnInit(): void {
  }

}
