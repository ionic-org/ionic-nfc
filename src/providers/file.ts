import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file';

@Injectable()
export class FileProvider {

  constructor(private file: File) {
  }

}
