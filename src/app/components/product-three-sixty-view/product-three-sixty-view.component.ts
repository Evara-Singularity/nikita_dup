import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  showModelViewer:boolean = false;
  scriptUrls = [
    'https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js',
    'assets/product360.js'
  ];
  constructor(private cdr: ChangeDetectorRef) {
    
  }

  ngOnInit(){
    
  }
  ngAfterViewInit(){
    this.load3dPlayerScript();
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
        this.showModelViewer= true;
        var basePath = "../../../assets/img/MSN2VVROZZFFC9";
        document.getElementById('model').innerHTML = `<model-viewer  loading="eager" style="display:none;" id="viewer"
        src="assets/img/MSN2VVROZZFFC9/ASSET.glb" auto-rotate camera-controls poster="poster.webp"shadow-intensity="1">
        <div class="progress-bar">
        <div class="update-bar"></div>
        </div>
        </model-viewer>`
        product360_initialize(basePath);
        this.cdr.detectChanges();
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

 

