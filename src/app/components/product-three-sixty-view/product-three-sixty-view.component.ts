import { Component, OnInit } from '@angular/core';
import { from, of } from 'rxjs';
import { concatMap } from 'rxjs/operators';
declare var jQuery: any;
declare var product360_initialize:Function;


@Component({
  selector: 'product-three-sixty-view',
  templateUrl: './product-three-sixty-view.component.html',
  styleUrls: ['./product-three-sixty-view.component.scss']
})
export class ProductThreeSixtyViewComponent implements OnInit {
  scriptUrls = [
    'https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.153.0/three.min.js',
    'https://ajax.googleapis.com/ajax/libs/model-viewer/3.1.1/model-viewer.min.js',
    'assets/product360.js'
  ];
  constructor() {
    this.load3dPlayerScript();
  }

  ngOnInit(){
    console.log("OnInIt");
  }
  

  load3dPlayerScript(){
    from(this.scriptUrls)
    .pipe(
      concatMap((url) => {
        if (!this.isScriptLoaded(url)) {
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

 

