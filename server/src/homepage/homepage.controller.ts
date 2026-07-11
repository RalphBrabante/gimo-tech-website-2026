import { Controller, Get } from '@nestjs/common';
import { HomepageService } from './homepage.service';

@Controller('api/homepage')
export class HomepageController {
  constructor(private readonly homepage: HomepageService) {}

  @Get()
  getAll() {
    return this.homepage.getAll();
  }
}
