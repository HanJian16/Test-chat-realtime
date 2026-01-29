export interface ConnectedUser {
    id: string;
    nickname: string;
}

export interface UserWithStatus {
    nickname: string,
    status: 'online' | 'offline'
}