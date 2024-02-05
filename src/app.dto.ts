import { ApiProperty } from '@nestjs/swagger';

export class UploadPathDto {
  @ApiProperty({
    description: '파일 주소',
    example: '/Users/Images',
  })
  readonly path: string;
}
