export class DeliveryAddressUtil
{
    static getVerifiedPhones(addressList: any[])
    {
        let phones = [];
        if (addressList.length) {
            const filtered = addressList.filter((address) => { return address.phoneVerified });
            phones = filtered.map((address) => address.phone);
        }
        return phones;

    }
}