import {
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { UsersService } from 'src/users/users.service'
import { ChatService } from 'src/chat/chat.service'
import { ChatMessage } from 'src/chat/chat.types'
import { ConnectedUser } from 'src/users/user.types'

@WebSocketGateway({
  cors: {
    origin: [
      process.env.FRONTEND_URL,        // prod
      'http://localhost:5173',         // dev (vite)
    ].filter(Boolean),
    credentials: true,
  },
})

export class ChatGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  constructor(
    private readonly userService: UsersService,
    private readonly chatService: ChatService,
  ) { }

  @SubscribeMessage('join')
  handleJoin(@ConnectedSocket() client: Socket, @MessageBody() nickname: string) {
    const existingUser = this.userService.getUserByNickname(nickname)

    if (existingUser) {
      client.emit('join_error', {
        type: 'nickname_taken',
        message: `El nickname "${nickname}" ya está en uso`,
      })
      return
    }

    const user: ConnectedUser = this.userService.addUser(client.id, nickname)

    this.server.emit('users', this.userService.getUsers())

    const recentMessages = this.chatService.getRecentMessages()
    client.emit('chat_history', recentMessages)

    this.server.emit('system_message', {
      type: 'user_joined',
      message: `${user.nickname} se unió al chat`,
      user: user.nickname,
      time: new Date().toISOString(),
    })

    client.emit('join_success', {
      user,
      message: 'Te has unido al chat exitosamente',
    })
  }

  @SubscribeMessage('message')
  handleMessage(@ConnectedSocket() client: Socket, @MessageBody() message: string) {
    const user: ConnectedUser | undefined = this.userService.getUser(client.id)
    if (!user) return

    const chatMessage: ChatMessage = this.chatService.createMessage(user.nickname, message)
    this.server.emit('message', chatMessage)
  }

  @SubscribeMessage('leave')
  handleLeave(@ConnectedSocket() client: Socket) {
    const disconnectedNickname = this.userService.removeUser(client.id)
    if (!disconnectedNickname) {
      client.disconnect(true)
      return
    }

    this.server.emit('users', this.userService.getUsers())

    this.server.emit('system_message', {
      type: 'user_left',
      message: `${disconnectedNickname} abandonó el chat`,
      user: disconnectedNickname,
      time: new Date().toISOString(),
    })

    client.disconnect(true)
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { typing?: boolean },
  ) {
    const user = this.userService.getUser(client.id)
    if (!user) return

    client.broadcast.emit('typing', {
      nickname: user.nickname,
      typing: !!payload?.typing,
      time: new Date().toISOString(),
    })
  }

  handleDisconnect(client: Socket) {
    const disconnectedNickname = this.userService.removeUser(client.id)
    if (!disconnectedNickname) return

    this.server.emit('users', this.userService.getUsers())

    this.server.emit('system_message', {
      type: 'user_left',
      message: `${disconnectedNickname} abandonó el chat`,
      user: disconnectedNickname,
      time: new Date().toISOString(),
    })
  }
}
