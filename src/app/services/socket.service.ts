import { HttpClientModule } from "@angular/common/http";
import { Injectable } from "@angular/core";
import * as connect from "socket.io-client";
import { messageStruct } from "../interfaces/Interface";
import { UserService } from "./user.service";
import { CookieService } from "ngx-cookie-service";

@Injectable({
    providedIn: "root"
})

export class SocketService {

    client: connect.Socket;

    constructor(private readonly data: UserService, cookies: CookieService) {
        const URL: string = "http://localhost:4000";

        this.client = connect.io(URL, {
            transports: [
                "websocket"
            ],
            auth: {
                token: cookies.get("token")
            }
        });

        this.client.on("connect", () => {
            this.client.emit("id", this.data.user.user_id);
        })
        
        this.client.on("disconnect", () => {
            console.log("Desonectado del servidor");
        })

        this.client.on("error", () => {
            console.log("Error al conectarte");
        })
    }

    public sendMessage(message: messageStruct) {
        console.log(message);

        this.client.emit("message", message); 
    }
}