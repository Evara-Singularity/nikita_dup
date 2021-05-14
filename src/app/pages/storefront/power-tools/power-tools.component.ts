import { ViewEncapsulation, Renderer2, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Component } from '@angular/core';
import { ClientUtility } from '../../../utils/client.utility';
declare let $: any;


@Component({
  selector: 'power-tools',
  templateUrl: './power-tools.html',
  styleUrls: ['./power-tools.scss'],
  encapsulation: ViewEncapsulation.None
})

export class PowerToolsComponent {
  powerData: any;
  bannerCarsl = [1, 2, 3, 4];
  branddata = [1, 2, 3, 4, 5, 6, 7, 8];
  logoCarsl = [1, 2, 3, 4, 5, 6];
  isServer: boolean = typeof window !== "undefined" ? false : true;

  constructor(private elementRef: ElementRef,
    private _renderer2: Renderer2,
    public router: Router,
    private route: ActivatedRoute) {

  }
  ngOnInit() {
    this.route.data.subscribe((rawData) => {
      if (!rawData['data']['error']) {
        this.powerData = rawData['data']

        setTimeout(() => {
          // wait for DOM rendering
          this.reinsertLinks();
        }, 0);
        if (!this.isServer) {
          setTimeout(function () {
            let wh = window.outerHeight;
            (<HTMLElement>document.querySelector('.fixed_section')).style.minHeight = wh + "px";
            window.addEventListener('scroll', function () {
              let scrollEl = document.scrollingElement || document.documentElement;
              let ws = scrollEl.scrollTop;
              let getClass = document.querySelector('.fixed_section');
              Array.prototype.forEach.call(getClass, function (el) {
                let bp = scrollEl.scrollTop;
                let c = ClientUtility.offset(el).top - 60;
                let d = ClientUtility.offset(el).top + ClientUtility.outerHeight(el) - ClientUtility.outerHeight(el.querySelector('.wp-20'));
                if (bp >= c) {
                  el.querySelector('.wp-20').classList.add('block1');
                  let w = ((window.outerWidth - (<HTMLElement>document.querySelector('.wp-95')).offsetWidth) / 2) - 20;
                  let wblock1 = (<HTMLElement>document.querySelector('.wp-95')).offsetWidth - (<HTMLElement>document.querySelector('.wp-79')).offsetWidth + 26;
                  (<HTMLElement>document.querySelector('.block1')).style.left = w + "px";
                  (<HTMLElement>document.querySelector('.block1')).setAttribute('style', 'width:' + wblock1 + 'px !important;')
                } else {
                  el.querySelector('.wp-20').classList.removeClass('block1');
                }
                if (bp >= d) {
                  el.querySelector('.wp-20').classList.removeClass('block1');
                  (<HTMLElement>el.querySelector('.wp-20')).style.position = "absolute";
                  (<HTMLElement>el.querySelector('.wp-20')).style.bottom = "-10";
                  alert(d);
                }
              });
            }, { passive: true });
          }, 1000);
          $(document).on('click', '.fixed_section .wp-20 ul li', function () {
            alert("hi");
            let activeTab = $(this).attr('class').split(' ')[0];
            $(this).parents('.fixed_section').find('.wp-79').attr("style", "display: none !important");
            $(this).parents('.wp-20').siblings('.' + activeTab).attr("style", "display: inline-block !important");

          });
        }
      }
    });
  }
  reinsertLinks() {
    const links = <HTMLAnchorElement[]>this.elementRef.nativeElement.getElementsByTagName('a');

    if (links) {
      const linksInitialLength = links.length;
      for (let i = 0; i < linksInitialLength; i++) {
        const link = links[i];

        if (link.host === window.location.host) {
          this._renderer2.listen(link, 'click', event => {
            event.preventDefault();
            this.router.navigate([
              link.href
                .replace(link.host, '')
                .replace(link.protocol, '')
                .replace('//', '')
            ]);
          });
        }
      }
    }
  }
}