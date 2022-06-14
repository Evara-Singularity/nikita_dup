import { CommonModule } from '@angular/common';
import { Component, Input, EventEmitter, NgModule, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-oos-similar-section',
  templateUrl: './oos-similar-section.component.html',
  styleUrls: ['./oos-similar-section.component.scss']
})
export class OosSimilarSectionComponent  {

  // @Input('productOutOfStock') productOutOfStock;
  @Input('productService') productService;
  // @Input('oosSimilarcardFeaturesConfig') oosSimilarcardFeaturesConfig;
  // @Input('similarForOOSContainer') similarForOOSContainer; 
  
  OnInit(){
    console.log("i am in the oss module ,,");
    // console.log("productOutOfStock-------" , this.productOutOfStock);
    // console.log("productService------------" , this.productService);
  }

} 
