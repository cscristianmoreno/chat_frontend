import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: "root"
})

export class templateService {
    subject = new BehaviorSubject<string>("login");
    templateLogin$ = this.subject.asObservable();
}