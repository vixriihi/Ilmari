import { Injectable } from '@angular/core';
import { WindowRef } from '../ref/window.ref';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

declare const webkitSpeechRecognition: any;

@Injectable()
export class SpeechService {

  private recognition;
  private speechSubject = new Subject<string>();
  private speechObserver = this.speechSubject.asObservable();
  private recording = false;

  constructor(private windowRef: WindowRef) {
  }

  hasSpeechSupport() {
    try {
      return this.windowRef.nativeWindow.hasOwnProperty('webkitSpeechRecognition');
    } catch (e) {
      return false;
    }
  }

  getObserver(): Observable<string> {
    return this.speechObserver;
  }

  startRecording(): void {
    this.recording = true;
    this.record();
  }

  stopRecording() {
    this.recording = false;
    if (!this.recognition) {
      return;
    }
    this.recognition.stop();
  }

  sendResult(result: string) {
    this.speechSubject.next(result);
  }

  private record() {
    this.recognition = new webkitSpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = false;

    this.recognition.lang = 'fi-FI';
    this.recognition.start();

    this.recognition.onresult = (e) => {
      const idx = e.results.length - 1;
      this.speechSubject.next(e.results[idx][0].transcript.trim());
    };

    this.recognition.onend = () => {
      if (this.recording) {
        this.record();
      }
    };

    this.recognition.onspeechend = () => {
      this.recognition.stop();
    };

    this.recognition.onerror = (e) => {
      this.recognition.stop();
    };
  }
}
