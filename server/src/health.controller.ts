import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  private status() {
    return { status: 'ok', service: 'gimo-tech-api', uptime: Math.round(process.uptime()) };
  }

  @Get('health')
  health() {
    return this.status();
  }

  @Get('api/health')
  apiHealth() {
    return this.status();
  }
}
