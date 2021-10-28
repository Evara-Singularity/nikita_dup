import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { DataService } from '@app/utils/services/data.service';
import { Step } from '@app/utils/validators/step.validate';

@Component({
  selector: 'app-e-gift-voucher',
  templateUrl: './e-gift-voucher.component.html',
  styleUrls: ['./e-gift-voucher.component.scss']
})
export class EGiftVoucherComponent implements OnInit {

  showSuccessPopup = false;
  showListPopup = false;

  eGiftForm = this.fb.group({
      fullName:  ['',Validators.required],
      emailId: ['',[Validators.required, Step.validateEmail]],
      phone:  ['',Validators.required],
      company: [''],
      requirements: new FormArray([])
  })

  data: Object;
  categoryList: any[];
  brandList: any;
  TotalValue: any;
  rfqEnquiryItemsList: any[];
  brandListAll: [];
  // eGiftForm: FormGroup;


  constructor(public formBuilder: FormBuilder,
              private fb: FormBuilder,
              private _dataService:DataService,
              private _tms: ToastMessageService) { 
          
              }


  ngOnInit()
  {
      //call api store it in a variable data 
         this._dataService.callRestful("GET",'https://nodeapiqa.moglilabs.com/nodeApi/v1/rfq/getVoucherData').subscribe((res)=>{
         
          if(res['statusCode']===200 && res['data']){
               this.categoryList=[];
              res['data']['categoryList'].forEach(element => {
                  this.categoryList.push(element)
              });

              //this should have selected variable
              
              // this.form.get('myFormControlName').disable();

              //value changed
              this.valueChanged();
              
          }
       });

           //default case
      (this.requirements as FormArray).push(this.getRequirements());


      
    
      //map values from data to category brand

  
  }

  updateTotatQuantity() {
    this.TotalValue = 0;
    this.requirements.value.forEach(element => {
        if (parseInt(element.value) && element.quantity) {
            this.TotalValue += (parseInt(element.value)*parseInt(element.quantity));
        }
    });
  }

  valueChanged() {
      this.requirements.valueChanges.subscribe((changes) => {
          // this.calculator(itemForm)

          if(changes[0].category !==""){
             this.categoryList.forEach((ele)=>{
                 if(ele['categoryName']===changes[0].category){
                   this.brandList=ele['brandList'];

                 }
             })
              
          }


        //   if(changes[0].value !==""){
        //        this.TotalValue=changes[0].quantity*changes[0].value;
        //    }
        });
  }
  

  getRequirements()
  {
      return this.fb.group(
        {
          category: ['',Validators.required],
          brand: ['',Validators.required],
          value: ['',Validators.required],
          quantity: ['1',[Validators.required, Validators.maxLength(3)]],
          totalvalue: [''],
        }
      )
  }

  firstName(event) {
      var key;
      key = event.charCode;  //         key = event.keyCode;  (Both can be used)
      // return ((key > 47 && key < 58) || key == 45 || key == 46);
      return ((key > 64 &&
        key < 91) || (key > 96 && key < 123) || key == 32 || key == 46);
    } 

    checkQuantityCode(event) {
      return event.charCode >= 48 && event.charCode <= 57;
    }

  togglePopUp1(){
      this.showSuccessPopup = !this.showSuccessPopup;
  }

  togglePopUp2(){
      this.showListPopup = !this.showListPopup;
  }

  removeProduct(index){
      (<FormArray>this.requirements).removeAt(index)
  }

  addProducts(){
      (this.requirements as FormArray).push(this.getRequirements());
  }

  

  onSubmit(request){


      console.clear();
      console.log(request.requirements);
      //send data
      this.rfqEnquiryItemsList=[];
      request.requirements.forEach(element => {
          this.rfqEnquiryItemsList.push({
              "categoryName":element.category,
              "quantity":element.quantity,
              "brandName":element.category,
              "itemValue":element.value,
              "totalValue":+element.totalValue
          })
      });

      this._dataService.callRestful("POST",'https://nodeapiqa.moglilabs.com/nodeApi/v1/rfq/createVoucherRfq',{body:{
          "rfqEnquiryCustomer":{
              "name":request.fullName,
              "email":request.emailId,
              "mobile":request.phone,
              "company":request.company,
              "userId":"23211"
          },
          "rfqEnquiryItemsList":this.rfqEnquiryItemsList
          
          }}).subscribe((res)=>{
     if(res['statusCode']== 200 ){
          //after success response 
      this.showSuccessPopup = true;
      //reset data
      this.eGiftForm.reset();
     }        
     else{
      this._tms.show({ type: 'error', text: 'Something Went Wrong' });

     
     }
});
     

      



      




  }

  brandClicked(){
      let categorySelected = this.eGiftForm.controls['category'].value;
  }

   getData(){
      this._dataService.callRestful("GET", '').subscribe((data)=>{
          this.data=data;
      });
   }

  //getters
  get requirements() { return this.eGiftForm.get('requirements') };

}
