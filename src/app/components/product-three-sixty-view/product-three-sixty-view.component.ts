import { Component, OnInit, AfterViewInit } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { concatMap } from 'rxjs/operators';
declare var jQuery: any;
// import {product360_initialize} from 'assets/product360.js'



@Component({
  selector: 'product-three-sixty-view',
  templateUrl: './product-three-sixty-view.component.html',
  styleUrls: ['./product-three-sixty-view.component.scss']
})
export class ProductThreeSixtyViewComponent implements OnInit, AfterViewInit {
  scriptUrls = [
    'https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.153.0/three.min.js',
    'https://ajax.googleapis.com/ajax/libs/model-viewer/3.1.1/model-viewer.min.js',
    '../../../assets/product360.js'
  ];
  constructor() { }
  ngOnInit(): void {
      
  }
  ngAfterViewInit(){
    this.load3dPlayerScript();
  }

  load3dPlayerScript(){
    from(this.scriptUrls)
    .pipe(
      concatMap((url) => {
        if (!this.isScriptLoaded(url)) {
          console.log("chal ja");
          return this.loadScript(url);
        } else {
          return of(undefined); // Skip loading the script
        }
      })
    )
    .subscribe(
      () => {
        console.log('Script loaded successfully');
      },
      (error) => {
        console.error('Failed to load script:', error);
      },
      () => {
        // all scripts are loaded, so this code will get invoked
        var basePath = "../../../assets/img/MSN2VVROZZFFC9";
        product360_initialize(basePath);
      }
    );
 }

 //if script is already loaded
 isScriptLoaded(url: string): boolean {
  const scripts = document.getElementsByTagName('script');
  for (let i = 0; i < scripts.length; i++) {
    if (scripts[i].src === url) {
      return true;
    }
  }
  return false;
}

//method which is getting called for every inner Observable in ConcatMap
 loadScript(url: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.type = 'text/javascript';
    script.onload = () => resolve();
    script.onerror = () => reject();
    document.head.appendChild(script);
  });
 }
}

 

