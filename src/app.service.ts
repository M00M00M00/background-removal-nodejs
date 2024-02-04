import { Injectable, StreamableFile } from '@nestjs/common';
import * as JSZip from 'jszip';
import { removeBackground } from '@imgly/background-removal-node';
import * as fs from 'fs';
import * as cliProgress from 'cli-progress';
import * as colors from 'ansi-colors';

@Injectable()
export class AppService {
  async downloadBlob(blob: Blob): Promise<StreamableFile> {
    const buffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    return new StreamableFile(uint8Array);
  }

  async actionWithDirPath(dirPath: string): Promise<StreamableFile> {
    const imagePaths = this.getFiles(dirPath);

    const removedImages = [];

    const b1 = new cliProgress.SingleBar({
      format:
        'In Progress |' +
        colors.cyan('{bar}') +
        '| {percentage}% || {value}/{total} Images',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true,
    });

    b1.start(imagePaths.length, 0);

    for (const imagePath of imagePaths) {
      const removedImage = await this.backGroundRemove(imagePath);
      removedImages.push(removedImage);

      b1.increment();
    }

    b1.stop();

    const returnBlob = await this.zipping(removedImages);

    return await this.downloadBlob(returnBlob);
  }

  getFiles(dir: string, files = []) {
    const fileList = fs.readdirSync(dir);
    for (const file of fileList) {
      const name = `${dir}/${file}`;
      if (fs.statSync(name).isDirectory()) {
        this.getFiles(name, files);
      } else {
        if (
          name.endsWith('.png') ||
          name.endsWith('.jpg') ||
          name.endsWith('.jpeg')
        ) {
          files.push(name as never);
        }
      }
    }
    return files;
  }

  private async zipping(files: Blob[]): Promise<Blob> {
    const zip = new JSZip();

    const addFileToZip = async (file: Blob, index: number) => {
      const arrayBuffer = await new Response(file).arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      if (file.type === 'image/jpeg') {
        zip.file(`image-${index}.jpg`, uint8Array, { binary: true });
      }
      if (file.type === 'image/png') {
        zip.file(`image-${index}.png`, uint8Array, { binary: true });
      }
    };

    // Iterate through files and add them to the zip
    await Promise.all(files.map(addFileToZip));

    return await zip.generateAsync({ type: 'blob' });
  }

  private async backGroundRemove(
    file: Blob | ArrayBuffer | string,
  ): Promise<Blob> {
    return await removeBackground(file);
  }
}
