import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { contactStruct, loginStruct, messageStruct } from "../interfaces/Interface";

export const BACKEND_URL: string = "http://localhost:4000";


@Injectable({
    providedIn: "root"
})

export class HttpService {
    constructor(private http: HttpClient, private sanitizer: DomSanitizer) {
    }

    public getIcon(icon: string) {
        const http = this.http.get(`assets/icons/${icon}.svg`, {
            responseType: "text"
        });
        

        return http;
    }

    public sanitizerIcon(icon: string) {
        const sanitizer = this.sanitizer.bypassSecurityTrustHtml(icon);
        return sanitizer;
    }

    public getDataByIndex(path: string, user_id: number) {
        const http = this.http.get<any>(URL + path, {
            params: {
                id: user_id
            }
        });

        return http;
    }

    public getMessages(id: number, user_id: number) {
        const http = this.http.get<messageStruct[]>(URL + "/messages", {
            params: {
                id: id,
                user_id: user_id
            }
        })

        return http;
    }

    public sendMessages(message: messageStruct) {
        const http = this.http.post(URL + "/messages", JSON.stringify(message));
        return http;
    }

    public userLogin(data: FormGroup) {
        console.log(data);
        const http = this.http.post<loginStruct>(URL + "/login", data)
       
        return http;
    }

    public userRegister(data: FormGroup) {
        console.log(data);

        const http = this.http.post(URL + "/register", data, {
            headers: {
                "Content-Type": "application/json"
            }
        })
        
        return http;
    }

    public checkAuth(token: string) {
        const http = this.http.post<boolean>(URL + "/auth", {})
        return http;
    }

    public searchContact(param: string, id: number) {
        const http = this.http.get<contactStruct[]>(URL + "/search", {
            params: {
                id: id,
                search: param
            }
        });

        return http;
    }

    public addContact(data: contactStruct, id: number) {
        const params = {
            contact: data.id,
            id: id, 
        }

        const http = this.http.post(URL + "/add", params);
        return http;

    }
}