import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import CONSTANTS from 'src/app/config/constants';


@Component({
  selector: 'app-cluster-category',
  templateUrl: './cluster-category.component.html',
  styleUrls: ['./cluster-category.component.scss']
})
export class ClusterCategoryComponent implements OnInit {
  @Input() data;
  @Input() extraData;
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  defaultImage = CONSTANTS.IMAGE_BASE_URL+'assets/img/home_card.webp';
  
  constructor(
    private router: Router
  ) { }
  
  ngOnInit() {
  }

  link(url){
    this.router.navigateByUrl('/'+url);
  }
  


}
