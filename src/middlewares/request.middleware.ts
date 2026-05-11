import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';
import { LoggersService } from 'src/logger/logger.service';

@Injectable()
export class RequestMiddleware implements NestMiddleware {
  constructor(
      private readonly cls: ClsService,
      private jwtService: JwtService,
      private loggersService: LoggersService
    ){}

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now()

    res.on('finish', ()=>{
      this.loggersService.info("HTTP Request", {
        method: req.method,
        path: req.path,
        statusCode:  res.statusCode,
        duration: Date.now() - start
      });
    })
    

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