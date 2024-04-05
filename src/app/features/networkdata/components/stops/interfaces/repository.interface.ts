import { IStop } from "./stop.interface";

export interface IRepository {
  repositoryStateDelta: IRepositoryStateDelta;
  hasHighPrio: boolean;
  vehicleAdds: IStop[];
  vehicleUpdates: IStop[];
}

export interface IRepositoryStateDelta {
  fromRepositoryVersion: IRepositoryVersion;
  toRepositoryVersion: IRepositoryVersion;
  repositoryId: string;
}

export interface IRepositoryVersion {
  primary: 3;
  secondary: 3;
}

export interface IClearRepositoryCommand {
  repositoryName: string;
}

export interface IUpdateCommand {
  clearRepository: IClearRepositoryCommand;
  stopView: IStop;
}
