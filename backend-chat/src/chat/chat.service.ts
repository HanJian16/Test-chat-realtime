import { Injectable } from '@nestjs/common';
import { ChatMessage } from './chat.types';

@Injectable()
export class ChatService {
    private messages: ChatMessage[] = [];

    createMessage(user: string, message: string): ChatMessage {
        const msg: ChatMessage = { user, message, time: new Date().toISOString() };

        this.messages.push(msg);

        return msg;
    }

    getRecentMessages(limit = 50): ChatMessage[] {
        return this.messages.slice(-limit);
    }
}
