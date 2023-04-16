import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validator, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpService } from 'src/app/services/http.service';
import { templateService } from 'src/app/services/template.service';

import { FIELD_MESSAGE_ERRORS } from '../validation/Validation';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent implements AfterViewInit {
    form!: FormGroup;

    icon!: SafeHtml;
    iconRegister!: SafeHtml;

    @ViewChild("idElementImage") idElementImage!: ElementRef;

    constructor(private fb: FormBuilder, private http: HttpService, private renderer2: Renderer2, private cdr: ChangeDetectorRef, private sanitizer: DomSanitizer, 
        private templateService: templateService) {
        this.form = this.fb.group({
            name: ["", [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(15)
            ]],
            lastname: ["", [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(15)
            ]],
            email: ["", [
                Validators.required,
                Validators.email,
                Validators.minLength(3),
                Validators.maxLength(32)
            ]],
            password: ["", [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(15)
            ]],
            repeatPassword: ["", [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(15)
            ]],
            photo: ["", [
                Validators.required
            ]]
        })
    }

    public ngAfterViewInit() {
        this.http.getIcon("register").subscribe({
            next: (res) => {
                this.icon = this.http.sanitizerIcon(res);
            }
        })


        this.http.getIcon("login").subscribe({
            next: (res) => {
                this.iconRegister = this.http.sanitizerIcon(res);
            }
        })
    }

    public async handleSubmit() {
        if (this.form.invalid) {
            const values = Object.keys(this.form.controls);

            values.forEach((field) => {
                const control = this.form.get(field);

                control?.markAsTouched({ onlySelf: true});
            })
            return;
        }

        const image: ElementRef = this.renderer2.selectRootElement(this.idElementImage);
        
        const file: File = image.nativeElement.files[0];
        
        
        if (typeof file === "undefined") {
            return;
        }
        
        await new Promise((resolve, reject) => {
            const reader: FileReader = new FileReader();
            reader.readAsDataURL(file);
            
            reader.onloadend = (event) => {
                this.form.addControl("file", this.fb.control(reader.result));
                resolve(true);
            }
        })

        this.http.userRegister(this.form.value).subscribe({
            next: (res) => {
                console.log(res);
            },
            error: (error) => {
                console.log(error);
            }
        });
    }

    public checkFieldValidation(field: string) {
        let message: string =  "";

        const check = this.form.get(field);

        if (field === "repeatPassword") {
            const pw = this.form.get("password");

            if (check?.value !== pw?.value) {
                message = "Las contraseñas no coinciden.";
            }
        }

        if (check?.invalid && (check?.dirty || check?.touched)) {
            if (check?.errors?.["required"]) {
                message = "Este campo es requerido."
            }
            else if (check?.errors?.["minlength"]) {
                message = `Este campo requiere ${check?.errors?.["minlength"].requiredLength} carácteres.`
            }
            else if (check?.errors?.["maxlength"]) {
                message = `Este campo no puede superar los ${check?.errors?.["maxlength"].requiredLength} carácteres.`
            }
            else if (check?.errors?.["email"]) {
                message = `Este campo debe ser un correo electrónico.`
            }
        }


        const element = `<span style="color: red">${message}</span>`;

        return this.sanitizer.bypassSecurityTrustHtml(element);
    }

    public handleChangeTemplate() {
        this.templateService.subject.next("login");
    }
}
