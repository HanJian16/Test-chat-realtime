import { Injectable } from '@nestjs/common';
import { ConnectedUser, UserWithStatus } from './user.types';

@Injectable()
export class UsersService {
    private connectedUsers = new Map<String, ConnectedUser>();
    private readonly userStatus = new Map<string, 'online' | 'offline'>();

    addUser(socketId: string, nickname: string): ConnectedUser {
        // this.allUsers.add(nickname);

        const user: ConnectedUser = {
            id: socketId,
            nickname: nickname
        }

        this.connectedUsers.set(socketId, user);
        this.userStatus.set(nickname, 'online');
        return user;
    }

    removeUser(socketId: string): string | null {
        // this.users.delete(socketId);
        const user = this.connectedUsers.get(socketId);
        if (!user) return null;
        this.connectedUsers.delete(socketId);
        this.userStatus.set(user.nickname, 'offline');
        return user.nickname;
    }

    getUsers(): UserWithStatus[] {
        const users: UserWithStatus[] = [];

        for (const [nickname, status] of this.userStatus.entries()) {
            users.push({ nickname, status });
        }

        return users;
    }

    getUser(socketId: string): ConnectedUser | undefined {
        return this.connectedUsers.get(socketId);
    }

    getUserByNickname(nickname: string): ConnectedUser | undefined {
        for (const user of this.connectedUsers.values()) {
            if (user.nickname === nickname) {
                return user;
            }
        }
        return undefined;
    }

    getOnlineUsers(): ConnectedUser[] {
        return Array.from(this.connectedUsers.values());
    }
}
