export interface AccordiansDetails {
    name:string,
    data:AccordianDataItem[],
    toggle:AccordianToggleItem
}

export interface AccordianDataItem {
    name:string
    link:string
}

export interface AccordianToggleItem {
    idName:string
    styleDisplay:boolean
}
