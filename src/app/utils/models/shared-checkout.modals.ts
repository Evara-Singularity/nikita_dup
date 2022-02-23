export interface AddressListModal
{
    deliveryAddressList:any[],
    billingAddressList:any[]
}

export interface AddressListActionModal
{
    action:string,
    idAddress:number
}

export interface CreateEditAddressModal
{
    action: string,
    address: any,
}

