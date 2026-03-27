import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";

@Module({
    imports:[
        
        UsersModule,
    ],
    providers: [AuthService],
    controllers: [AuthController],
    exports: [AuthService],
})

export class AuthModule {}