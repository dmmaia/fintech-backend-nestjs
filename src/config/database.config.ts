import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

export class PostgresConfigService implements TypeOrmOptionsFactory {
    createTypeOrmOptions(connectionName?: string): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
       return {
        type: 'postgres',
        host: '127.0.0.1',
        port: 5432,
        username: 'root',
        password: 'root',
        database: 'loja',
        entities: [],
        synchronize: true,
        };
    }

}