import { AfterViewInit, Component } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { HttpService } from 'src/app/services/http.service';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { templateService } from 'src/app/services/template.service';
import { CookieService } from 'ngx-cookie-service';
import { loginStruct } from 'src/app/interfaces/Interface';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})

export class LoginComponent implements AfterViewInit {
    icon!: SafeHtml
    iconLogin!: SafeHtml;
    messageLoginError: string = "";

    form!: FormGroup;

    constructor(private http: HttpService, private fb: FormBuilder, private templateService: templateService, private cookies: CookieService) {
        this.form = this.fb.group({
            "email": "",
            "password": ""
        })
    }
    

    public ngAfterViewInit() {
        this.http.getIcon("chat").subscribe((res) => {
            this.icon = this.http.sanitizerIcon(res); 
        })

        this.http.getIcon("login").subscribe((res) => {
            this.iconLogin = this.http.sanitizerIcon(res);
        })
    }

    public handleSubmit() {
        console.log(this.form.value);

        this.http.userLogin(this.form.value).subscribe({
            next: (res) => {
                const { token } = res;
                const result = Object.keys(res);

                if (result.length === 0) {
                    this.messageLoginError = "Los datos introducidos son incorrectos.";
                    return;
                }

                this.cookies.set("token", token);
                // console.log(res.token);
                location.reload();
            },
            error: (error) => {
                this.messageLoginError = error.error;
                console.log(error.error);
            }
        });
    }

    public handleChangeTemplate() {
        this.templateService.subject.next("register");
    }
}