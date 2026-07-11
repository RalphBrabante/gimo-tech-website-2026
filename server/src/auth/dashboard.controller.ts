import { Controller, Get, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { resolve } from 'node:path';
import { AuthService } from './auth.service';

const SESSION_COOKIE = 'gimo_internal_session';
const dashboardSourcePath = resolve(__dirname, '../../../client/public/dashboard');
const dashboardBuildPath = resolve(__dirname, '../../../client/dist/client/browser/dashboard');
const internalSourcePath = resolve(__dirname, '../../../client/public/internal');
const internalBuildPath = resolve(__dirname, '../../../client/dist/client/browser/internal');

function dashboardFile(name: string): string {
  const root = process.env.NODE_ENV === 'production' ? dashboardBuildPath : dashboardSourcePath;
  return resolve(root, name);
}

function internalFile(name: string): string {
  const root = process.env.NODE_ENV === 'production' ? internalBuildPath : internalSourcePath;
  return resolve(root, name);
}

@Controller()
export class DashboardController {
  constructor(private readonly auth: AuthService) {}

  @Get(['internal/dashboard', 'internal/dashboard/'])
  dashboard(@Req() request: Request, @Res() response: Response): void {
    this.auth.userFromRequest(request);
    response.setHeader('Cache-Control', 'private, no-store');
    response.sendFile(dashboardFile('index.html'));
  }

  @Get('internal/dashboard/dashboard.js')
  script(@Res() response: Response): void {
    response.type('text/javascript');
    response.sendFile(dashboardFile('dashboard.js'));
  }

  @Get(['internal/products', 'internal/products/'])
  products(@Req() request: Request, @Res() response: Response): void {
    this.auth.userFromRequest(request);
    response.setHeader('Cache-Control', 'private, no-store');
    response.sendFile(internalFile('products/index.html'));
  }

  @Get('internal/products/products.js')
  productsScript(@Res() response: Response): void {
    response.type('text/javascript');
    response.sendFile(internalFile('products/products.js'));
  }

  @Get(['internal/settings', 'internal/settings/'])
  settings(@Req() request: Request, @Res() response: Response): void {
    this.auth.userFromRequest(request);
    response.setHeader('Cache-Control', 'private, no-store');
    response.sendFile(internalFile('settings/index.html'));
  }

  @Get('internal/settings/settings.js')
  settingsScript(@Res() response: Response): void {
    response.type('text/javascript');
    response.sendFile(internalFile('settings/settings.js'));
  }
}
