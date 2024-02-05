import { Body, Controller, Post, Res, StreamableFile } from '@nestjs/common';
import { AppService } from './app.service';
import { UploadPathDto } from './app.dto';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('upload/path')
  async uploadImgWithPath(
    @Body() body: UploadPathDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const now = new Date();
    const fileName = `images_${now.toISOString()}`;
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${fileName}.zip`,
    );
    return await this.appService.actionWithDirPath(body.path);
  }
}
