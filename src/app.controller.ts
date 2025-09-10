import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller() // pas "api" ici si tu utilises un préfixe global
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health') // 👈 chemin explicite pour qu'il s'affiche dans les logs
  health() {
    return { status: 'ok' };
  }

  @Get() // (optionnel) GET /api -> "Hello"
  getHello(): string {
    return this.appService.getHello();
  }
}
