import { Controller, Get } from '@nestjs/common';
import { PRIVACY_NOTICE } from './privacy.constants';

@Controller('privacy')
export class PrivacyController {
  @Get('notice')
  getNotice() {
    return PRIVACY_NOTICE;
  }
}