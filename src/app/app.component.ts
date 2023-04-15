import { Component, OnInit } from '@angular/core';
import { templateService } from './services/template.service';
import { CookieService } from 'ngx-cookie-service';
import { HttpService } from './services/http.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  showTemplate!: string;

  URL: string = "http://localhost:4000";

  constructor(private templateService: templateService, private cookies: CookieService, private http: HttpService) {
  }

  public ngOnInit() {
    const cookies: string = this.cookies.get("token");

    if (cookies.length) {
      this.http.checkAuth(cookies).subscribe({
        next: (res) => {
          this.showTemplate = "chat";
        },
        error: (error) => {
          throw new Error(error);
        }
      })
    }

    this.templateService.templateLogin$.subscribe({
      next: (res) => {
        this.showTemplate = res;
        console.log(res);
      }
    })
  }
}
