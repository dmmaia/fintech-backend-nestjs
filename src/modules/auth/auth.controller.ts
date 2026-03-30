import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./auth.dto";
import { ApiBody, ApiOperation } from "@nestjs/swagger";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService){}

    @ApiOperation({ summary: 'Login authentication' })
    @HttpCode(HttpStatus.OK)
    @Post('login')
    signIn(@Body() signInDto: LoginDto){
        return this.authService.signIn(signInDto.email, signInDto.password)
    }
}