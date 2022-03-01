export interface AccordiansDetails {
    name:string,
    isNotVisible?:boolean,
    data:AccordianDataItem[],
    extra?:any
}

export interface AccordianDataItem {
    name:string
    link:string
}

