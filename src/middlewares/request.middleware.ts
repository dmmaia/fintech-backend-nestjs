import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class RequestMiddleware implements NestMiddleware {
  constructor(
      private readonly cls: ClsService,
      private jwtService: JwtService
    ){}

  use(req: Request, res: Response, next: NextFunction) {
    const token = this.extractTokenFromHeader(req);
    if(!token)
      next();
    
    const payload = this.jwtService.decode(token??"");
    this.cls.set("userId", payload["sub"])
    next();
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}