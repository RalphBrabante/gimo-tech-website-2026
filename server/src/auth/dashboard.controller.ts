import { Controller, Get, Req, Res, UnauthorizedException } from '@nestjs/common';
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

  @Get(['internal', 'internal/'])
  login(@Res() response: Response): void {
    response.setHeader('Cache-Control', 'private, no-store');
    response.sendFile(internalFile('index.html'));
  }

  @Get(['internal/dashboard', 'internal/dashboard/'])
  dashboard(@Req() request: Request, @Res() response: Response): void {
    this.sendProtectedPage(request, response, dashboardFile('index.html'));
  }

  @Get('internal/dashboard/dashboard.js')
  script(@Res() response: Response): void {
    response.type('text/javascript');
    response.sendFile(dashboardFile('dashboard.js'));
  }

  @Get('internal/dashboard/dashboard.css')
  dashboardStyles(@Res() response: Response): void {
    response.type('text/css');
    response.sendFile(dashboardFile('dashboard.css'));
  }

  @Get(['internal/profile', 'internal/profile/'])
  profile(@Req() request: Request, @Res() response: Response): void {
    this.sendProtectedPage(request, response, internalFile('profile/index.html'));
  }

  @Get('internal/profile/profile.js')
  profileScript(@Res() response: Response): void {
    response.type('text/javascript');
    response.sendFile(internalFile('profile/profile.js'));
  }

  @Get(['internal/reset-password', 'internal/reset-password/'])
  resetPassword(@Res() response: Response): void {
    response.setHeader('Cache-Control', 'private, no-store');
    response.sendFile(internalFile('reset-password.html'));
  }

  @Get('internal/reset-password.js')
  resetPasswordScript(@Res() response: Response): void {
    response.type('text/javascript');
    response.sendFile(internalFile('reset-password.js'));
  }

  @Get(['internal/products', 'internal/products/'])
  products(@Req() request: Request, @Res() response: Response): void {
    this.sendProtectedPage(request, response, internalFile('products/index.html'));
  }

  @Get('internal/products/products.js')
  productsScript(@Res() response: Response): void {
    response.type('text/javascript');
    response.sendFile(internalFile('products/products.js'));
  }

  @Get(['internal/settings', 'internal/settings/'])
  settings(@Req() request: Request, @Res() response: Response): void {
    this.sendProtectedPage(request, response, internalFile('settings/index.html'));
  }

  @Get('internal/settings/settings.js')
  settingsScript(@Res() response: Response): void {
    response.type('text/javascript');
    response.sendFile(internalFile('settings/settings.js'));
  }

  @Get(['internal/homepage', 'internal/homepage/'])
  homepage(@Req() request: Request, @Res() response: Response): void {
    this.sendProtectedPage(request, response, internalFile('homepage/index.html'));
  }

  @Get('internal/homepage/homepage.js')
  homepageScript(@Res() response: Response): void {
    response.type('text/javascript');
    response.sendFile(internalFile('homepage/homepage.js'));
  }

  @Get(['internal/pages', 'internal/pages/'])
  pages(@Req() request: Request, @Res() response: Response): void {
    this.sendProtectedPage(request, response, internalFile('pages/index.html'));
  }

  @Get('internal/pages/pages.js')
  pagesScript(@Res() response: Response): void {
    response.type('text/javascript');
    response.sendFile(internalFile('pages/pages.js'));
  }

  @Get(['internal/menus', 'internal/menus/'])
  menus(@Req() request: Request, @Res() response: Response): void {
    this.sendProtectedPage(request, response, internalFile('menus/index.html'));
  }

  @Get('internal/menus/menus.js')
  menusScript(@Res() response: Response): void {
    response.type('text/javascript');
    response.sendFile(internalFile('menus/menus.js'));
  }

  @Get(['internal/quotations', 'internal/quotations/'])
  quotations(@Req() request: Request, @Res() response: Response): void {
    this.sendProtectedPage(request, response, internalFile('quotations/index.html'));
  }

  @Get('internal/quotations/quotations.js')
  quotationsScript(@Res() response: Response): void {
    response.type('text/javascript');
    response.sendFile(internalFile('quotations/quotations.js'));
  }

  @Get(['internal/helpdesk', 'internal/helpdesk/', 'internal/desk', 'internal/desk/'])
  desk(@Req() request: Request, @Res() response: Response): void {
    this.sendProtectedPage(request, response, internalFile('desk/index.html'));
  }

  @Get('internal/desk/desk.js')
  deskScript(@Res() response: Response): void {
    response.type('text/javascript');
    response.sendFile(internalFile('desk/desk.js'));
  }

  @Get(['internal/helpdesk/messages/:uid', 'internal/helpdesk/messages/:uid/', 'internal/desk/messages/:uid', 'internal/desk/messages/:uid/'])
  deskMessage(@Req() request: Request, @Res() response: Response): void {
    this.sendProtectedPage(request, response, internalFile('desk/message.html'));
  }

  @Get('internal/desk/thread.js')
  deskThreadScript(@Res() response: Response): void {
    response.type('text/javascript');
    response.sendFile(internalFile('desk/thread.js'));
  }

  private sendProtectedPage(request: Request, response: Response, filePath: string): void {
    try {
      this.auth.userFromRequest(request);
      response.setHeader('Cache-Control', 'private, no-store');
      response.sendFile(filePath);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        response.status(401);
        response.setHeader('Cache-Control', 'private, no-store');
        response.sendFile(internalFile('unauthorized.html'));
        return;
      }
      throw error;
    }
  }
}
