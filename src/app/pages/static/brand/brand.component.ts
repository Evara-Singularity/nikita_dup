import { Component, Renderer2, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from "@angular/common";
import { BrandService } from '../../brand/brand.service';
import CONSTANTS from 'src/app/config/constants';
import { ClientUtility } from 'src/app/utils/client.utility';

@Component({
  selector: 'brand',
  templateUrl: 'brand.html',
  styleUrls: ['brand.scss']
})

export class BrandComponent{
  API: {}
  brandData: any;

  val: any;
  brand_name: any = [];
  final_arr: any = [];
  final_arr1: any = [];
  alphabet_arr = ['0-9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  total_count: any;
  brand_url: any;
  isShowLoader: boolean;
  brandsLogo;
  constructor(public _brandService: BrandService, private title: Title, private meta: Meta, private _renderer2: Renderer2, @Inject(DOCUMENT) private _document, public _router: Router) {
    this.API = CONSTANTS;
    this.title.setTitle("Moglix Brand Store");
    this.meta.addTag({ "property": "og:title", "content": "Moglix Brand Store" });
    this.meta.addTag({ "property": "og:description", "content": "Get access to exclusive brands at Moglix brand store. Shop for products from your favorite brands inclusing Bosch, Eveready, Havells, V-Guard, Makita, Karam and more." });
    this.meta.addTag({ "property": "og:url", "content": "https://www.moglix.com/brand-store" });
    this.meta.addTag({ "name": "description", "content": "Get access to exclusive brands at Moglix brand store. Shop for products from your favorite brands inclusing Bosch, Eveready, Havells, V-Guard, Makita, Karam and more." });

    let links = this._renderer2.createElement('link');
    links.rel = "canonical";
    links.href = CONSTANTS.PROD + "/brand-store";
    this._renderer2.appendChild(this._document.head, links);
    this.isShowLoader = true;

  }
  ngOnInit(){
    this._brandService.getBrand().subscribe(val => {
      this.isShowLoader = false;
      this.total_count = val['totalCount'];
      this.final_arr1 = val['brands'].sort(this.compare);
      this.final_arr1.forEach(element => {
        this.adjustArray(element);
      });
    });
    this._brandService.getBrandLogo().subscribe(val=>{
       this.brandsLogo = val["data"][0]['block_data']['all_brand_store']['data'];
       console.log("this.brandsLogo",this.brandsLogo);
     });

    var scrollFixedVal = 0;
    window.addEventListener('scroll',function(e){
      var letterId = document.getElementById('letterId');
      var elOfset = letterId.offsetTop;
      var window_position = window.scrollY + 52;
      if(window_position > elOfset && scrollFixedVal == 0 && window_position > 300){
        letterId.classList.add('sticky');
        scrollFixedVal = window_position;
       }
       else if(scrollFixedVal > window_position){
        letterId.classList.remove('sticky');
        scrollFixedVal = 0;
       }
      }
     ,{passive: true});
  }

  scrollToList(getAlphabet){ 
    let idValue = 'alphabet_'+ getAlphabet;
    let getOffset = document.getElementById(idValue).offsetTop - 150;
    ClientUtility.scrollToTop(1000, getOffset);
  }
  adjustArray(element){
    let _alphabet = {};
    const ind = parseInt(element.name.charAt(0)) ? 0 : 1;
    if (ind === 0) {
      _alphabet['letter'] = '0-9'
    }
    else {
      _alphabet['letter'] = element.name.charAt(0);
    }
    let index = this.final_arr.findIndex(obj => obj['letter'] === _alphabet['letter'] || obj['letter'] === _alphabet['letter'].toUpperCase());
    _alphabet['nameArr'] = index < 0 ? [] : this.final_arr[index]['nameArr'];
    _alphabet['nameArr'].push(element);
    _alphabet['nameArr'].length === 1 ? this.final_arr.push(_alphabet) : null;
  }
  compare(a, b){
    
    const genreA = a.name.trim().toUpperCase();
    const genreB = b.name.trim().toUpperCase();
    
    if(a.link){
      if(a.link.split('/')[1])
        a.link = "brands/" + a.link.split('/')[1].split('.')[0];
    }
    if(b.link){
      if(b.link.split('/')[1])
        b.link = "brands/" + b.link.split('/')[1].split('.')[0];
    }
    let comparison = 0;
    if(genreA > genreB){
      comparison = 1;
    } else if (genreA < genreB){
      comparison = -1;
    }
    return comparison;
  }
}
