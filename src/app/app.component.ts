import { Component, OnInit } from '@angular/core';
import { templateService } from './services/template.service';
import { CookieService } from 'ngx-cookie-service';
import { HttpService } from './services/http.service';
import { BehaviorSubject } from 'rxjs';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent implements OnInit {
  showTemplate!: string;
  
  constructor(private templateService: templateService, private cookies: CookieService, private http: HttpService, private user: UserService) {
  }
  
  public ngOnInit() {
    const cookies: string = this.cookies.get("token");
    
    if (Object.keys(this.user.user).length > 0) {
      this.showTemplate = "chat";
    }
    
    this.templateService.templateLogin$.subscribe({
      next: (res) => {
        this.showTemplate = res;
        console.log(res);
      }
    })
  }
}