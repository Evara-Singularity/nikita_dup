import { NgxSiemaService, NgxSiemaOptions } from 'ngx-siema';
import { DOCUMENT } from '@angular/common';
import { Component, OnInit, Inject } from '@angular/core';
import * as $ from 'jquery';
import { Title, Meta } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';
import { CommonService } from '@app/utils/services/common.service';


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
    public pageTitle: Title,
    public meta: Meta,
    @Inject(DOCUMENT) private _document,
    private ngxSiemaService: NgxSiemaService,
    public _commonService: CommonService) {

    this.isServer = _commonService.isServer;
    this.isBrowser = _commonService.isBrowser;
    this.pageTitle.setTitle('Abse No Fikar Of Prices Or Delivery Kyunki #MoglixHaina');

  }

  ngOnInit() {
    if (this.isBrowser) {
      this.autoPlaySiema();
      $(window).resize(function () {
        $('.lightslider-banner li,.slidewrap').css('height', $(window).height() - 100)
      })
      $(document).ready(function () {
        $('.lightslider-banner li,.slidewrap').css('height', $(window).height() - 100)
        $('lightslider-banner li,.rotating').css({ 'width': $(window).height() + 150, 'height': $(window).height() + 150 });
        $('.lSPager').remove();
      });



      /*moglixhainavideo banner */
      var url1 = CONSTANTS.MOGLIX_HAINA_VIDEO.url1;
      var url2 = CONSTANTS.MOGLIX_HAINA_VIDEO.url2;
      var url3 = CONSTANTS.MOGLIX_HAINA_VIDEO.url3;
      var url4 = CONSTANTS.MOGLIX_HAINA_VIDEO.url4;
      var url5 = CONSTANTS.MOGLIX_HAINA_VIDEO.url5;

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