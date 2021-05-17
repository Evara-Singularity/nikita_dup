import { Component} from '@angular/core';
import CONSTANTS from '@app/config/constants';

@Component({
  selector: 'table',
  templateUrl: 'table.html',
  styleUrls: ['table.scss']
})

export class TableComponent {
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  ngOnInit(){
  }
}
