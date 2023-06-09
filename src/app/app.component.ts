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
  
  constructor(private templateService: templateService, private cookies: CookieService, private http: HttpService) {
  }

  private checkSubject = new BehaviorSubject<boolean>(false);
  readonly check$ = this.checkSubject.asObservable();
  
  public ngOnInit() {
    const cookies: string = this.cookies.get("token");
    
    if (cookies.length) {
      // if (check)
      this.checkSubject.next(true);

      this.http.checkAuth(cookies).subscribe({
        next: (res) => {
          this.showTemplate = "chat";
        },
        error: (error) => {
          this.checkSubject.next(false);
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