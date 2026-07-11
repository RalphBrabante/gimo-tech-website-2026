import { Controller, Get } from '@nestjs/common';
import { MenusService } from './menus.service';

@Controller('api/menus')
export class MenusController {
  constructor(private readonly menus: MenusService) {}

  @Get()
  getPublic() {
    return this.menus.getPublic();
  }
}
