import { Module } from '@nestjs/common';
import { ResourcesController } from './resources.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RESOURCES_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.RESOURCES_HOST || 'resources-service',
          port: 3005,
        },
      },
    ]),
  ],
  controllers: [ResourcesController],
  providers: [],
})
export class ResourcesModule {}