import { Input } from '@angular/core';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import CONSTANTS from '@app/config/constants';


@Component({
  selector: 'app-cluster-category',
  templateUrl: './cluster-category.component.html',
  styleUrls: ['./cluster-category.component.scss']
})
export class ClusterCategoryComponent {
  @Input('data') data;
  @Input() extraData;
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  defaultImage = CONSTANTS.IMAGE_BASE_URL + CONSTANTS.ASSET_IMG;
  
  constructor(
    private router: Router
  ) { }

  link(url){
    this.router.navigateByUrl('/'+url);
  }
}
