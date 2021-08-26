export class DeliveryAddressUtil
{
    static getVerifiedPhones(addressList: any[])
    {
        let phones = [];
        if (addressList.length) {
            //TODO:need to change filter depending on backend flag
            const filtered = addressList.filter((address) => { return false });
            phones = filtered.map((address) => address.phone);
        }
        return phones;

    }
}