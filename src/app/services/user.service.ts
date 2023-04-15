import { Injectable } from "@angular/core";
import { messageStruct, userStruct } from "../interfaces/Interface";
import jwt from "jwt-decode";
import { CookieService } from "ngx-cookie-service";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: "root"
})

export class UserService {
    user!: userStruct;
    static logout: any;

    constructor(private cookies: CookieService) {
        const token = this.cookies.get("token");
        this.user = jwt(token);
        console.log(this.user);
    }

    public logout() {
        this.cookies.deleteAll();
        location.reload();
    }
}