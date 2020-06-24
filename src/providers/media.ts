import { Injectable } from '@angular/core';
import { Media, MediaObject, MEDIA_ERROR, MEDIA_STATUS } from '@ionic-native/media';

@Injectable()
export class MediaProvider {

  MEDIA_NONE: number;
  MEDIA_STARTING: number;
  MEDIA_RUNNING: number;
  MEDIA_PAUSED: number;
  MEDIA_STOPPED: number;

  constructor(
    public media: Media,
    public mediaObject: MediaObject
  ) {
    this.MEDIA_NONE = this.media.MEDIA_NONE;
    this.MEDIA_STARTING = this.media.MEDIA_STARTING;
    this.MEDIA_RUNNING = this.media.MEDIA_RUNNING;
    this.MEDIA_PAUSED = this.media.MEDIA_PAUSED
    this.MEDIA_STOPPED = this.media.MEDIA_STOPPED;
  }

  create(src: string,
    onSuccess?: (success: any) => void,
    onError?: (error) => void,
    onStatusUpdate?: (status: MEDIA_STATUS) => void
  ): MediaObject {
    this.mediaObject = this.media.create(src);

    if (onSuccess) {
      this.mediaObject.onSuccess.subscribe((success: any) => {
        console.log('Action is successful')
        onSuccess(success);
      });
    }

    if (onError) {
      this.mediaObject.onError.subscribe((error: MEDIA_ERROR) => {
        console.log('Error!', error);
        onError(error);
      });
    }

    if (onStatusUpdate) {
      this.mediaObject.onStatusUpdate.subscribe((status: MEDIA_STATUS) => {
        console.log(status);
        onStatusUpdate(status);
      });
    }

    return this.mediaObject;
  }

}
