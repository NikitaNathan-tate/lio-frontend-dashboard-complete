
export class GuiTable {
  TableName:string;
  Name: string;
  Id : number;
  HelpId : string;
  ChildName : string;
  ChildTableName : string;
  TableType : string;
  UsageTable : string;
  UsageColumn : string;
  Columns : Columns[];
  Parameters : Parameters[];
  WindowParameter : WindowParameter;
  MapDisplay:boolean;
}

export class RootObject {
  GuiTables : GuiTable[];
}
export class Parameters 
{
  name : string;
  title : string;
  table : string;
  filterAttribute : string;
  filterValue : string;
  isTaSpecific : boolean;
 // ParameterTarget : ParameterTarget[];
}
export class Columns
{
  attribute : string;
  field : string;
  filter : string;
  helpId : number;
  hidden : boolean;
  locked : boolean;
  orderIndex : number;
  title : string 
  width: number;
  type : string;
 // SetItems : SetItems[];
}
export class WindowParameter
{
  name : string;
  table : string;
  title : string;
}
export class SetItems
{
  value : number;
  text : string
}
export class Stop {
  primarykeyduid?: string;
  stopnumber?:number;
  pointnumber?: number;
  stopname?: string;
  shortcode?: string;
  longdescription?: string;
  pointname?: string;
  longnumber?: number;
  zonewabe?: number;
  ibisname?: string;
  tlpmode?: string;
  vehannouncementtext?: string;
  stoppoints?: string;
  farepointname?: string;
  mfdtransferscreen?: string;
  previewtime?: string;
  importstate?: string;
  latitude?: number;
  longitude?: number;
  commentary?: string;
}
export class StoppingPoint {
  primarykeyduid?: string;
  stopindex: string;
  stopname?: string;
  pointnumber?: number;
  longnumber?: number;
  pointname?: number;
}
export class Links {
  primaryKeyDuid?: string;
  from?:string;
  to?: string;
  operatingBranch?: string;
  distance?: number;
  routingDistance?: number;
  points: CoordinatesView[];
}
export class LayoverLink {
  primaryKeyDuid?: string;
  stopId?:number;
  stopNumber?: number;
  externalId?: string;
  shortCode?: string;
  longDescription?: string;
  longNumber?: number;
  zoneWabe?: number;
  ibisName?: string;
  tlpMode?: string;
  vehAnnouncementText?: string;
  stopPoints?: string;
  farePointName?: string;
  mfdTransferScreen?: string;
  previewTime?: string;
  importState?: string;
  latitude?: number;
  longitude?: number;
  commentary?: string;
}

export class UpdateTable {
  tablename: string;
  parenttablename: string;
  modetype: number; //1:add, 2: changed,3: delete
  attributelist: UpdateAttribute[];
}
export class UpdateAttribute {
  primarykey : number;
  keyid : string;
  keyvalue : string
}

export class PrimaryKeyValues {
  tablename: string;
  primarykey : number;
  keyvalue : number;
}

export class FetchData
{
    tablename: string;
    attributelist: AttributeInfo[];
}

export class AttributeInfo
{
  attributename: string;
  usageTable: string ;
  usageColumn: string ;
  usageProvider: string ;
}

export class ListInformation
{
    public keys :  number[];
    public modetype :  number ;

}

export class CoordinatesView
{
    public lon: number;
    public lat: number;
}
export class PatternView {
  primaryKeyduid?: string;
  operatingBranch?: string;
  points?: CoordinatesView[];
  patternNumber: number;
  shortName: string;
  direction: number;
  patternType: number;
  isBasicPath: number;
  longNameDefault?: string;
  patternIndex?: number;
  routeRefDuid?: string;
  stopPointRefDuids?: string[];
  linkRefDuids?: string[];
}
export class LinkView {
  primaryKeyduid?: string;
  operatingbranch?: string;
  points?: CoordinatesView[];
}