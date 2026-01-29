import { Module } from '@nestjs/common';
import { ChatGateway } from './chat/chat.gateway';
import { UsersModule } from 'src/users/users.module';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  imports: [UsersModule, ChatModule],
  providers: [ChatGateway]
})
export class GatewayModule {}
