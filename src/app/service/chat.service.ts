import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr'
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  public connection: signalR.HubConnection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5063/chat")
    .configureLogging(signalR.LogLevel.Information)
    .build();

  public messages$ = new BehaviorSubject<any>([]);
  public connectedUser$ = new BehaviorSubject<string[]>([]);
  public messages: any[] = [];
  public users: string[] = [];

  constructor() {
    this.start();
    this.connection.on("RecieveMessage", (user: string, message: string, messageTime: string) => {
      this.messages = [...this.messages, { user, message, messageTime }];
      this.messages$.next(this.messages);
    });

    this.connection.on("ConnectedUser", (users: any) => {
      this.connectedUser$.next(users);
    })
  }

  //start connection
  public async start() {
    try {
      await this.connection.start();
      console.log("Connection is established!");
    } catch (error) {
      console.log(error);
      setTimeout(() => {
        this.start();
      }, 5000);
    }
  }
  // Join Room
  public async joinRoom(user: string, room: string) {
    return this.connection.invoke("JoinRoom", { user, room })
  }

  // Send Message
  public async sendMessage(message: string) {
    return this.connection.invoke("SendMessage", message);
  }

  // Leave
  public async leaveChat() {
    this.connection.stop();
  }
}