import { Component,  Inject, Renderer2} from '@angular/core';
import { Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';import { DOCUMENT } from "@angular/common";
import CONSTANTS from '@app/config/constants';
declare let $: any;

@Component({
  selector: 'about',
  templateUrl: 'about.html',
  styleUrls: ['about.scss']
})

export class AboutComponent {

  isServer: boolean;

  API = CONSTANTS;

  constructor(
    private _renderer2: Renderer2, 
    @Inject(DOCUMENT) private _document, 
    public _router: Router, 
    private title: Title, 
    private meta: Meta) {
  }

  ngOnInit(){

    this.isServer = typeof window !== "undefined" ? false : true;

    this.title.setTitle("Know More About the Moglix.com Team");
    this.meta.addTag({ "property": "og:title", "content": "Know More About the Moglix.com Team" });
    this.meta.addTag({ "property": "og:description", "content": "Learn more about the Moglix brand and the team behind the leading online marketplace for business and industry essential supplies." });
    this.meta.addTag({ "property": "og:url", "content": CONSTANTS.PROD+"/about" });
    this.meta.addTag({ "name": "description", "content": "Learn more about the Moglix brand and the team behind the leading online marketplace for business and industry essential supplies." });

    if (this.isServer) {
      let links = this._renderer2.createElement('link');
      links.rel = "canonical";
      links.href = CONSTANTS.PROD + "/about";
      // alert(this._router.url);
      this._renderer2.appendChild(this._document.head, links); 
    }

    let executed = false;

    if (!this.isServer) {
      window.addEventListener('scroll', ()=>{
        let scrollEl = document.scrollingElement || document.documentElement;
        let scroll = scrollEl.scrollTop;
        // (<HTMLElement>document.querySelector('.about-us')).style.top = -scroll * 4.5 + 'px';
        if ((scroll + window.outerHeight) > (<HTMLElement>document.querySelector('.about-pointer')).offsetTop) {
          document.querySelector('.about-pointer').classList.add('test');
          if (!executed) {
            executed = true;
            this.numberCount();
          }
        } else {
          document.querySelector('.about-pointer').classList.remove('test');
        }
      }, {passive: true});
  
      // this.numberCount();
      if(document.querySelector('#show-more')){
        document.querySelector('#show-more').addEventListener('click', function() {
          (<HTMLElement>document.querySelector('.item:nth-child(n+7)')).style.display = 'block';
          (<HTMLElement>document.querySelector('#show-less')).style.display = 'inline-block';
        });
      }
      if(document.querySelector('#show-less')){
        document.querySelector('#show-less').addEventListener('click', function() {
          (<HTMLElement>document.querySelector('.item:nth-child(n+7)')).style.display = 'none';
          this.style.display = 'none';
        });
      }
    } 

  }
  
  animateValue(el, start, end, duration, id) {
    // assumes integer values for start and end
    
    // let obj = document.getElementById(id);
    let range = end - start;
    // no timer shorter than 50ms (not really visible any way)
    let minTimer = 50;
    // calc step time to show all interediate values
    let stepTime = Math.abs(Math.floor(duration / range));
    
    // never go below minTimer
    stepTime = Math.max(stepTime, minTimer);
    
    // get current time and calculate desired end time
    let startTime = new Date().getTime();
    let endTime = startTime + duration;
    let timer = {};
  
    function run(el, id) {
        let now = new Date().getTime();
        let remaining = Math.max((endTime - now) / duration, 0);
        let value = Math.round(end - (remaining * range));
        el.innerHTML = value;
        if (value == end) {
            clearInterval(timer[id]);
        }
    }
    
    timer[id] = setInterval(run.bind(null, el, id), stepTime);
    run(el, id);
  }

  numberCount(){
    let elements = document.querySelectorAll('.count');
    Array.prototype.forEach.call(elements, (el, i)=>{
      this.animateValue(el, 0, el.innerHTML, 6000, i);
    });
  }

}




