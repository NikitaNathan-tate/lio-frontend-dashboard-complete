import { IStop } from "src/app/features/networkdata/components/stops/interfaces";

export interface IResolveMapData {
  selectedStop?: IStop;
}

export type MapResolvers = {
  [A in keyof IResolveMapData]?: any;
};
