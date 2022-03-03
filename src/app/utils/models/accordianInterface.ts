export interface AccordiansDetails {
    name:string,
    isNotVisible?:boolean,
    data:AccordianDataItem[],
    icon:string,
    extra?:any,
    outerNavRouteEvent?: boolean
}

export interface AccordianDataItem {
    name:string
    link:string
}

