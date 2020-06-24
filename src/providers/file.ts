import { Injectable } from '@angular/core';
import { File, Entry } from '@ionic-native/file';

@Injectable()
export class FileProvider {

  constructor(private file: File) {
  }

  resolveLocalFilesystemUrl(fileUrl: string): Promise<Entry> {
    return this.file.resolveLocalFilesystemUrl(fileUrl);
  }
}
