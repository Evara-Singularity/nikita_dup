import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'product-three-sixty-view-v1',
  templateUrl: './product-three-sixty-view-v1.component.html',
  styleUrls: ['./product-three-sixty-view-v1.component.scss']
})
export class ProductThreeSixtyViewComponentV1 implements OnInit {
  threeDImages = [
    'https://m.media-amazon.com/images/I/51B2K6u14-L._SP539,464,0|51XJMbkgyvL.jpg,51ZuOYwnVkL.jpg,51TcO0J4DqL.jpg,51v+nwWeTaL.jpg,51q495TvNgL.jpg_.jpg',
    'https://m.media-amazon.com/images/I/41Dd%2BAYMBoL._SP539,464,0|51JacZqLDlL.jpg,51N+NSD6F-L.jpg,41LE5BZRogL.jpg,51Y4EGgx7PL.jpg,51uUky3eLML.jpg_.jpg',
    'https://m.media-amazon.com/images/I/41fANkX1C6L._SP539,464,0|51QgfWnageL.jpg,51Zx7aPAPvL.jpg,418lQfFZUPL.jpg,51Bnxf-fWmL.jpg,51jWtFrjsfL.jpg_.jpg',
    'https://m.media-amazon.com/images/I/51EPOHUXdbL._SP539,464,0|511khDo56lL.jpg,51rn74aUybL.jpg,51a7w6KWIRL.jpg,51uw5PJFBaL.jpg,51cCBuTESmL.jpg_.jpg',
    'https://m.media-amazon.com/images/I/4119L2Wd2oL._SP539,464,0|51AbB19tKKL.jpg,518qrx9eOTL.jpg,41lB8wf35tL.jpg,519I6gHHXIL.jpg,51-kx-yk9TL.jpg_.jpg',
    'https://m.media-amazon.com/images/I/51%2BIbk%2BvYuL._SP539,464,0|51DFtHYRC0L.jpg,51vPSmKXTvL.jpg,51Vzer-GGNL.jpg,51SjwUEyafL.jpg,51fc2+XqA0L.jpg_.jpg',
    'https://m.media-amazon.com/images/I/51oyqSg%2BIxL._SP539,464,0|51wUxUrzuuL.jpg,5136H+EKg2L.jpg,51CymUq4BeL.jpg,51RG911wj5L.jpg,510kS-6zpTL.jpg_.jpg',
    'https://m.media-amazon.com/images/I/41IHcc5egvL._SP539,464,0|51UXcz0XP8L.jpg,51hIgSvvLoL.jpg,41mFo8PY7aL.jpg,51r-Bd-1kQL.jpg,51+Xhj+ky8L.jpg_.jpg',
    'https://m.media-amazon.com/images/I/41cueAtXNeL._SP539,464,0|51jMkGDuKYL.jpg,51ztapFcItL.jpg,41L2eMJROBL.jpg,51C9D7Ax1WL.jpg,51Zovc9hzsL.jpg_.jpg',
    'https://m.media-amazon.com/images/I/5184Gu75KtL._SP539,464,0|51YpgXKUeUL.jpg,51n7Daa8dHL.jpg,41KVqn7cuZL.jpg,51nT0e86vQL.jpg,51Pb01J0-ZL.jpg_.jpg',
    'https://m.media-amazon.com/images/I/41L7qsSRRNL._SP539,464,0|51gm58eYqcL.jpg,51saWhDZcIL.jpg,41eCEIHX+yL.jpg,51YHqS7ytkL.jpg,51iZ195TUwL.jpg_.jpg',
    'https://m.media-amazon.com/images/I/51sdM3RsCEL._SP539,464,0|51mPMGDbYVL.jpg,51N3kWQCWlL.jpg,51fgep5hvqL.jpg,51JXDObqvML.jpg,51h4UTsBWCL.jpg_.jpg'
  ]
  constructor() {
  }

  ngOnInit(){
    this.load3dViewer();
  }

  load3dViewer() {
    const spinImg = document.getElementById('spinImg');
    let clicked = false;
    let counter = 0;
    let pageX = 0;
    let pageY = 0;
    let index = null;
    let indexX = null;
    let pageYarray = [2784, 1392, 4176, 464, 3248, 1856, 4640, 928, 3712, 2320, 5104, 0];
    let pageXarray = [540, 1080, 1620, 2160, 2700, 0]
    let swipingRight = false;
    let prevX = null;

    spinImg.style.visibility = 'visible';

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('touchstart', handleMouseDown);

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleMouseUp);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleMouseMove);

    function handleMouseDown(e: MouseEvent | TouchEvent) {
      clicked = true;
      counter = 1;
      return false;
    }

    function handleMouseUp() {
      clicked = false;
      counter = 0;
    }

    function handleMouseMove(e) {
      if (clicked) {
        let currentX;
        if (e.clientX) {
          // Mouse event
          currentX = e.clientX;
        } else if (e.touches && e.touches.length > 0) {
          // Touch e
          currentX = e.touches[0].clientX;
        } else {
          // No coordinates available
          return;
        }
        if (prevX !== null) {
          if (currentX > prevX) {
            swipingRight = true;
          } else if (currentX < prevX) {
            swipingRight = false;
          }
        }
        prevX = currentX;
        // change the index based the swipeRight value
        if(index == 12 && !swipingRight) {
          index = 0;
          indexX += 1;
        } else if(index == -1 && swipingRight) {
          index = 12;
          indexX -= 1;
        }
        if(indexX == -1) {
          indexX = 5
        } else if(indexX == 6) {
          indexX = 0; 
        }
        pageY = -pageYarray[index];
          if(pageY == 0 && !swipingRight) {
            pageX = -pageXarray[indexX];
          } else if(pageY == -5104 && swipingRight) {
            pageX = -pageXarray[indexX];
          }
          if(pageX < -2700) {
            pageX = 0;
          }
        spinImg.style.transform = `translate3d(${pageX}px, ${pageY}px, 0px)`;
        index = swipingRight ? index - 1 : index + 1;
      }
    }
  }
  
}

 

