import { Inject, Injectable, OnDestroy } from '@angular/core';
import { IStop, IStopTableService, IUpdateCommand } from '../interfaces';
import { BehaviorSubject, Observable } from 'rxjs';
//import { ISharedWorkerManagerService, SHARED_WORKER_MANAGER_SERVICE, WorkerMsgTypes } from '@app/core';


@Injectable({
  providedIn: 'root',
})
export class StopsService  implements IStopTableService, OnDestroy {
  private readonly workerUrl = '/assets/vehicles.worker.js';
  private readonly logPrefix = 'stops-service';
  private readonly repositoryId = 'StopView';
  //private stopsWorker?: Worker;
  private stopsSubject$ = new BehaviorSubject<IStop[] | undefined>(undefined);

  constructor(
    //@Inject(SHARED_WORKER_MANAGER_SERVICE) private readonly sharedWorkerManagerService: ISharedWorkerManagerService,
  ) {
    //this.startStopsWorker();
  }

  public getStops$(): Observable<IStop[] | undefined> {
    return this.stopsSubject$.asObservable();
  }

  public ngOnDestroy(): void {
    //this.stopsWorker?.terminate();
  }

  /*private startStopsWorker(): void {
    this.stopsWorker = new Worker(this.workerUrl, { type: 'classic' });
    this.stopsWorker.postMessage(
      {
        sharedWorkerDataManagerPort: this.dataManagerWorkerPort,
        repolist: [this.repositoryId],
        type: WorkerMsgTypes.Configuration,
      },
      [this.dataManagerWorkerPort],
    );
    this.stopsWorker.onmessage = (event: MessageEvent) => this.onStopWorkerMsg(event);
  }*/

  /*private onStopWorkerMsg(event: MessageEvent): void {
    {
      const eventType = event.data.type;
      if (eventType === WorkerMsgTypes.Update) {
        const data = event.data.data.updates as IUpdateCommand[];
        this.onUpdate(data);
      }
    }
  }*/

  private onUpdate(updateCommand: IUpdateCommand[]): void {
    const stopViews = updateCommand.filter(uc => !!uc.stopView).map(uc => uc.stopView);
    if (stopViews.length > 0) {
      const stops = [...(this.stopsSubject$.value ?? [])];
      for (const v of stopViews) {
        const idx = stops.findIndex(vup => vup.stopId === v.stopId);
        if (idx !== -1) {
          stops[idx] = v;
        } else {
          stops.push(v);
        }
      }
      this.stopsSubject$.next(stops);
    }
  }

  /*private get dataManagerWorkerPort(): MessagePort {
    return this.sharedWorkerManagerService.dataManagerWorkerPort;
  }*/
}
