import { NgxSiemaService, NgxSiemaOptions } from 'ngx-siema';
import { DOCUMENT, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Component, OnInit, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import * as $ from 'jquery';
import { Title, Meta } from '@angular/platform-browser';


@Component({
  selector: 'app-campaign',
  templateUrl: './campaign.component.html',
  styleUrls: ['./campaign.component.scss']
})
export class CampaignComponent implements OnInit {
  options: NgxSiemaOptions = {
    selector: '.moglix-hain-na-siema',
    duration: 200,
    easing: 'ease-out',
    perPage: 1,
    startIndex: 0,
    draggable: true,
    threshold: 20,
    loop: true,
    onInit: () => { },
    onChange: () => { },
  };
  interval = 5000;
  bannerInterval;
  isBrowser: boolean;
  isServer: boolean;
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public pageTitle: Title,
    public meta: Meta,
    private ElementRef: ElementRef,
    @Inject(DOCUMENT) private _document,
    private ngxSiemaService: NgxSiemaService) {

    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId);
    this.pageTitle.setTitle('Abse No Fikar Of Prices Or Delivery Kyunki #MoglixHaina');

  }

  ngOnInit() {
    if (this.isBrowser) {
      this.autoPlaySiema();
      /* jquery custom*/

      // $('#bannermoglixhainalightSlider').lightSlider({
      //             gallery: true,
      //             item: 1,
      //             loop:true,
      //             slideMargin: 0,
      //             thumbItem: 1,
      //             enableDrag:false,
      //             auto: true,
      //             cssEasing:'easing',
      //             easing:'easeInOutExpo',
      //             pause: 3000,
      // 			speed:1600,
      //         });
      //   $('#toprotateslide').lightSlider({
      //       gallery: true,
      //       item: 1,
      //       loop:true,
      //       slideMargin: 0,
      //       thumbItem: 1,
      //       mode:'fade',
      //       enableDrag:false,
      //       controls:false,
      //       auto: true,
      // cssEasing:'easing',
      //       easing:'easeInOutExpo',
      //       pause: 3000,
      //   });
      // $(document).ready(function () {
      //   $('.lightslider-banner li,.slidewrap').css('height', $(window).height() - 100)
      //   $('lightslider-banner li,.rotating').css({ 'width': $(window).height() + 150, 'height': $(window).height() + 150 });
      //   $('.lSPager').remove();

      // })

      $(window).resize(function () {
        $('.lightslider-banner li,.slidewrap').css('height', $(window).height() - 100)
      })
      $(document).ready(function () {
        $('.lightslider-banner li,.slidewrap').css('height', $(window).height() - 100)
        $('lightslider-banner li,.rotating').css({ 'width': $(window).height() + 150, 'height': $(window).height() + 150 });
        $('.lSPager').remove();
      });



      /*moglixhainavideo banner */
      var url1 = 'https://www.youtube.com/embed/TddxyWx5g0o';
      var url2 = 'https://www.youtube.com/embed/1d-sZmcyOnc';
      var url3 = 'https://www.youtube.com/embed/V7vw4qFHp0E';
      var url4 = 'https://www.youtube.com/embed/6trNPkCGejc';
      var url5 = 'https://www.youtube.com/embed/yyVtU7wsqtQ';


      $('.watch-now').click(function () {
        //alert('show')
        $('.moglixhainavideopop iframe').attr('src', url1);
        $('.moglixhainavideopop').fadeIn();

      })
      $('.playmoglixhainavideo').click(function () {
        //alert('show')
        $('.moglixhainavideopop iframe').attr('src', url1);
        $('.moglixhainavideopop').fadeIn();

      })
      $('.video-thumb .playbtn1').click(function () {
        //alert('show')
        $('.moglixhainavideopop iframe').attr('src', url2);
        $('.moglixhainavideopop').fadeIn();

      })
      $('.video-thumb .playbtn2').click(function () {
        //alert('show')
        $('.moglixhainavideopop iframe').attr('src', url3);
        $('.moglixhainavideopop').fadeIn();

      })
      $('.video-thumb .playbtn3').click(function () {
        //alert('show')
        $('.moglixhainavideopop iframe').attr('src', url4);
        $('.moglixhainavideopop').fadeIn();

      })
      $('.video-thumb .playbtn4').click(function () {
        //alert('show')
        $('.moglixhainavideopop iframe').attr('src', url5);
        $('.moglixhainavideopop').fadeIn();

      })

      $('.moglixhainavideopop,.inner-formforentprise .crossthispop').click(function () {
        $('.moglixhainavideopop').fadeOut();
        $('.moglixhainavideopop iframe').attr('src', '');
        $('.moglixhainavideopop iframe').attr('src', url1);
      })
    }
  }

  scollToSection() {
    this._document.getElementById('terms_conditions').scrollIntoView(true);
  }
  autoPlaySiema() {
    this.bannerInterval = setInterval(() => {
      this.ngxSiemaService.next(1, this.options.selector);
    }, this.interval);
  }
}