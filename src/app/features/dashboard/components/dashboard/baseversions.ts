export class BaseVersion {
    baseversionsid: number ;
    bvnumber: number ;
    baseversionsname: string ;
    baseversionsiseditable: boolean;
    baseversiontype : string

   
}

export const baseVersions: any[] = [
    {
        baseversionsid: 1,
        baseVersionsNumber: 1 ,
        baseVersionsName: 'Data_aktuell',
        baseVersionsIsEditable: true,
    },
    {
        baseversionsid: 2,
        baseVersionsNumber: 2 ,
        baseVersionsName: 'Data_aktuell2',
        baseVersionsIsEditable: false,
    }
];
