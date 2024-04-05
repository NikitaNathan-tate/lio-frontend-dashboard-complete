// src/app/services/audio.service.ts
import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import * as moment from "moment";
import { StreamState } from '../interfaces/stream-state';
@Injectable({
  providedIn: "root"
})
export class AudioService {
  private state: StreamState = {
    playing: false,
    readableCurrentTime: '',
    readableDuration: '',
    duration: undefined,
    currentTime: undefined,
    canplay: false,
    error: false,
    index :undefined,
  };
  private stateChange: BehaviorSubject<StreamState> = new BehaviorSubject(
    this.state
  );
  public isPaused: boolean = false;
  private activeItem: any;
  public setActiveItem(item: any) {
    this.activeItem = item;
  }
  
  public getActiveItem() {
    return this.activeItem;
  }
  
  public clearActiveItem() {
    this.activeItem = null;
  }
  
  private playStateChange: Subject<boolean> = new Subject<boolean>();
  private updateStateEvents(event: Event): void {
    switch (event.type) {
      case "canplay":
        this.state.duration = this.audioObj.duration;
        this.state.readableDuration = this.formatTime(this.state.duration);
        this.state.canplay = true;
        break;
      case "playing":
        this.state.playing = true;
        break;
      case "pause":
        this.state.playing = false;
        break;
      case "timeupdate":
        this.state.currentTime = this.audioObj.currentTime;
        this.state.index = this.audioObj.id;
        this.state.readableCurrentTime = this.formatTime(
          this.state.currentTime
        );
        break;
      case "error":
        this.resetState();
        this.state.error = true;
        break;
    }
    this.stateChange.next(this.state);
    this.playStateChange.next(this.state.playing);
  }
  playStateChanges(): Observable<boolean> {
    return this.playStateChange.asObservable();
  }
  private resetState() {
    this.state = {
      playing: false,
      readableCurrentTime: '',
      readableDuration: '',
      duration: undefined,
      currentTime: undefined,
      canplay: false,
      error: false,
      index :undefined
    };
  }
  getState(): Observable<StreamState> {
    return this.stateChange.asObservable();
  }
  private stop$ = new Subject();
  private audioObj = new Audio();
  audioEvents = [
    "ended",
    "error",
    "play",
    "playing",
    "pause",
    "timeupdate",
    "canplay",
    "loadedmetadata",
    "loadstart"
  ];

  private addEvents(obj, events, handler) {
    events.forEach(event => {
      obj.addEventListener(event, handler);
    });
  }

  private removeEvents(obj, events, handler) {
    events.forEach(event => {
      obj.removeEventListener(event, handler);
    });
  }

  playStream(audioData: Uint8Array, index: any) {
    return new Observable(observer => {
      this.audioObj.src = URL.createObjectURL(new Blob([audioData]));
      this.audioObj.load();
  
      const playHandler = () => {
        this.isPaused = false;
        this.state.playing = true;
        observer.next();
      };
  
      const pauseHandler = () => {
        this.isPaused = true;
        this.state.playing = false;
        observer.next();
      };
  
      const endedHandler = () => {
        this.isPaused = false;
        this.state.playing = false;
        this.state.currentTime = 0;
        this.state.readableCurrentTime = this.formatTime(0);
        this.stateChange.next(this.state); // Update the state
      };
  
      const errorHandler = (error: any) => {
        observer.error(error);
      };
  
      this.audioObj.addEventListener("play", playHandler);
      this.audioObj.addEventListener("pause", pauseHandler);
      this.audioObj.addEventListener("ended", endedHandler);
      this.audioObj.addEventListener("error", errorHandler);
  
      this.audioObj.play();
  
      return () => {
        this.audioObj.removeEventListener("play", playHandler);
        this.audioObj.removeEventListener("pause", pauseHandler);
        this.audioObj.removeEventListener("ended", endedHandler);
        this.audioObj.removeEventListener("error", errorHandler);
        this.audioObj.pause();
        this.audioObj.currentTime = 0;
        this.isPaused = false;
      };
    });
  }
  
  
  isEnded(): boolean {
    return this.audioObj.ended;
  }
  play() {
    this.audioObj.play();
  }

  pause() {
    this.audioObj.pause();
    this.isPaused = true;
  }

  stop() {
    //this.stop$.next();
  }

  seekTo(seconds) {
    this.audioObj.currentTime = seconds;
  }

  formatTime(time: number, format: string = "HH:mm:ss") {
    const momentTime = time * 1000;
    return moment.utc(momentTime).format(format);
  }
  private streamObservable(audioData: Uint8Array,index :any) {
    return new Observable(observer => {
      // Play audio
      //this.audioObj.src = "../assets/HP33.mp3";
      this.audioObj.id = index;
      this.audioObj.src = URL.createObjectURL(new Blob([audioData]));
      this.audioObj.load();
      this.audioObj.play();
  
      const handler = (event: Event) => {
        this.updateStateEvents(event);
        observer.next(event);
      };
  
      this.addEvents(this.audioObj, this.audioEvents, handler);
      return () => {
        // Stop Playing
        this.audioObj.pause();
        this.audioObj.currentTime = 0;
        // remove event listeners
        this.removeEvents(this.audioObj, this.audioEvents, handler);
        // reset state
        this.resetState();
      };
    });
  }
}

