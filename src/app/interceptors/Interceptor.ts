import { HttpClient, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { CookieService } from "ngx-cookie-service";

import { Observable } from "rxjs";

@Injectable({
    providedIn: HttpClient
})

export class Interceptor implements HttpInterceptor {
    constructor(private cookies: CookieService) {

    }

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        const headers = new HttpHeaders({
            "Authorization": "Bearer " + this.cookies.get("token")
        })

        const clone = req.clone({
            headers
        });

        return next.handle(clone);
    }
}