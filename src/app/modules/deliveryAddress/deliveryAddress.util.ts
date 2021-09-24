export class DeliveryAddressUtil
{
    static getVerifiedPhones(addressList: any[], user):any[]
    {
        let verifiedPhones = [];
        if (user['phoneVerified']) {
            verifiedPhones.push(user['phone']);
        }
        if (addressList.length) {
            const filtered = addressList.filter((address) => { return address.phoneVerified });
            const phones = filtered.map((address) => address.phone);
            console.log(phones);
            verifiedPhones = [...verifiedPhones, ...phones];
        }
        return verifiedPhones;
    }
}