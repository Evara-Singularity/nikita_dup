import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, NgModule, OnInit } from '@angular/core';


@Component({
  selector: 'product-three-sixty-view-v1',
  templateUrl: './product-three-sixty-view-v1.component.html',
  styleUrls: ['./product-three-sixty-view-v1.component.scss']
})
export class ProductThreeSixtyViewComponentV1 implements OnInit {
  @Input() threeDImages = [];
  constructor(private cdr: ChangeDetectorRef) {
  }

  ngOnInit(){
    this.load3dViewer();
  }

  load3dViewer() {
    const spinImg = document.getElementById('spinImg');
    let clicked = false;
    let pageX = 0;
    let pageY = 0;
    let index = null;
    let indexX = null;
    let pageYarray = [2784, 1392, 4176, 464, 3248, 1856, 4640, 928, 3712, 2320, 5104, 0];
    let pageXarray = [540, 1080, 1620, 2160, 2700, 0];
    let swipingRight = false;
    let prevX = null;
    
    spinImg.style.visibility = 'visible';
    
    spinImg.addEventListener('pointerdown', handlePointerDown);
    spinImg.addEventListener('pointermove', handlePointerMove);
    spinImg.addEventListener('pointerup', handlePointerUp);
    spinImg.addEventListener('pointercancel', handlePointerUp);
    
    function handlePointerDown(e) {
      clicked = true;
      e.target.setPointerCapture(e.pointerId);
      e.preventDefault();
    }
    
    function handlePointerMove(e) {
      if (clicked) {
        let currentX = e.clientX || e.touches[0].clientX;
        if (prevX !== null) {
          if (currentX > prevX) {
            swipingRight = true;
          } else if (currentX < prevX) {
            swipingRight = false;
          }
        }
        prevX = currentX;
        // change the index based on the swipingRight value
        if (index == 12 && !swipingRight) {
          index = 0;
          indexX += 1;
        } else if (index == -1 && swipingRight) {
          index = 12;
          indexX -= 1;
        }
        if (indexX == -1) {
          indexX = 5;
        } else if (indexX == 6) {
          indexX = 0;
        }
        pageY = -pageYarray[index];
        if (pageY == 0 && !swipingRight) {
          pageX = -pageXarray[indexX];
        } else if (pageY == -5104 && swipingRight) {
          pageX = -pageXarray[indexX];
        }
        if (pageX < -2700) {
          pageX = 0;
        }
        spinImg.style.transform = `translate3d(${pageX}px, ${pageY}px, 0px)`;
        index = swipingRight ? index - 1 : index + 1;
      }
    }
    
    function handlePointerUp(e) {
      clicked = false;
      e.target.releasePointerCapture(e.pointerId);
    }
    this.cdr.detectChanges();
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
 

