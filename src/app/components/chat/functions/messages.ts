import { messageStruct } from "src/app/interfaces/Interface";
import { HttpService } from "src/app/services/http.service";
import { lastValueFrom } from "rxjs"

export class GetMessages {
    constructor(private http: HttpService) {
    }

    async get(id: number, contact_id: number) {
        try {
            const messages: messageStruct[] = await lastValueFrom(this.http.getMessages(id, contact_id));
            return messages;
        }
        catch (error) {
            throw new Error("Ocurrió un error");
        }
    }
    
    // async get(url: string, id: number, user_id: number) {
    //     const http = this.http.get<messageStruct[]>(this.URL + "/messages", {
    //         params: {
    //             id: id,
    //             user_id: user_id
    //         }
    //     })

    //     return http;
    // }
}