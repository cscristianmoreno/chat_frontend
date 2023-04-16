import { contactStruct } from "src/app/interfaces/Interface";
import { HttpService } from "src/app/services/http.service";
import { lastValueFrom } from "rxjs";

export class AddContact {
    constructor(private contact: contactStruct, private id: number, private http: HttpService) {
        this.http.addContact(this.contact, this.id).subscribe({
            next: () => {
            },
            error: (error) => {
                throw new Error(error.error);
            },
        });
    }
}

export class SearchContact {
    constructor(private http: HttpService, private id: number) {
    }

    async contacts(search: string) {
        try {
            const result: contactStruct[] = await lastValueFrom(this.http.searchContact(search, this.id));
            return result;
        }
        catch(error: any) {
            throw new Error(error);
        }
    }
}