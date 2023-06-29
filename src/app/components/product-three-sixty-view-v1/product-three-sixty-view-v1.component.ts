import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit } from '@angular/core';


@Component({
  selector: 'product-three-sixty-view-v1',
  templateUrl: './product-three-sixty-view-v1.component.html',
  styleUrls: ['./product-three-sixty-view-v1.component.scss']
})
export class ProductThreeSixtyViewComponentV1 implements OnInit {
  @Input() threeDImages = [];
  constructor() {
  }

  ngOnInit(){
    console.log(this.threeDImages);
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


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    ProductThreeSixtyViewComponentV1
  ],
  exports:[
    ProductThreeSixtyViewComponentV1
  ],
})
export default class ProductThreeSixtyViewV1Module { }
 

