import { CommonModule } from '@angular/common';
import { Input, NgModule } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import CONSTANTS from '@app/config/constants';


@Component({
  selector: 'app-cluster-category',
  templateUrl: './cluster-category.component.html',
  styleUrls: ['./cluster-category.component.scss']
})
export class ClusterCategoryComponent implements OnInit {
  @Input('data') data;
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
