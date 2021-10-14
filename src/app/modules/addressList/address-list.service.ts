import {Injectable} from '@angular/core';

@Injectable()
export class AddressListService {

    lastSelectedAddress: any = null

    setLastSelectedAddress(data: any){
        this.lastSelectedAddress = data;
    }

    getLastSelectedAddress(){
        return this.lastSelectedAddress; 
    }

}
