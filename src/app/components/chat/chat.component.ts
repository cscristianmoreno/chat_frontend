import { Component, ViewChild, ElementRef, Renderer2, OnInit, Injectable, ViewChildren, HostListener, OnDestroy } from '@angular/core'
import { contactStruct, messageStruct, userImageStruct, userStruct } from 'src/app/interfaces/Interface';
// import { CONTACTS, MESSAGES } from 'src/data';
import { ChangeDetectorRef } from "@angular/core"; 
import { HttpService } from 'src/app/services/http.service';
import { BehaviorSubject } from 'rxjs';
import { SocketService } from 'src/app/services/socket.service';
import { UserService } from 'src/app/services/user.service';
import { AddContact, SearchContact } from './functions/contacts';
import { GetMessages } from './functions/messages';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.css'],
    // changeDetection: ChangeDetectionStrategy.OnPush
})

@Injectable({
    providedIn: "root"
})

export class ChatComponent implements OnInit, OnDestroy {
    chatProfile!: string;
    chatName!: string;
    chatIndex: number = -1;
    chatUserId: number = -1;
    search: string = "";

    user!: userStruct;

    token!: string;

    private contactUserSubject = new BehaviorSubject<contactStruct[]>([]);
    readonly contactUser$ = this.contactUserSubject.asObservable();

    // Used for view contacts.
    private contactSubject = new BehaviorSubject<contactStruct[]>([]);
    readonly contacts$ = this.contactSubject.asObservable();

    // Used for view all message open in chat.
    private messageSubject = new BehaviorSubject<messageStruct[]>([]);
    readonly messages$ = this.messageSubject.asObservable();

    // Used for view avatar profile in load ended.
    private photoSubject = new BehaviorSubject<string>("");
    readonly photo$ = this.photoSubject.asObservable();

    // // Used for view all users a non friend's..
    private searchSubject = new BehaviorSubject<contactStruct[]>([]);
    readonly search$ = this.searchSubject.asObservable();

    // Used for verify responsive mode.
    private responsiveSubject = new BehaviorSubject<number>(0);
    readonly responsive$ = this.responsiveSubject.asObservable();


    @ViewChild("idElementInput") idElementInput!: ElementRef;
    @ViewChild("idChatInformationContainer") idChatInformationContainer!: ElementRef;
    @ViewChildren("idElementContacts") idElementContacts!: ElementRef;
    @ViewChild("idElementMenu") idElementMenu!: ElementRef;
    @ViewChild("idElementChatUserContainer") idElementChatUserContainer!: ElementRef;
    
    
    constructor(private service: HttpService, private renderer2: Renderer2, private readonly socket: SocketService, private readonly data: UserService) {
    }

    @HostListener("window: resize", ["$event"])
    public eventResize(event: Event) {
        console.log(window.innerWidth);
        this.responsiveSubject.next(window.innerWidth);
    }
    
    public ngOnInit() {
        this.responsiveSubject.next(window.innerWidth);
        this.user = this.data.user;

        this.contactUser$.subscribe({
            next: (res) => {
                this.contactSubject.next(res);
            },
            error: (error) => {
                console.log(error);
            }
        })

        // Send message if contact exists. 
        this.socket.client.on("message", (data: messageStruct) => {
            this.contactUser$.subscribe((res) => {                
                this.updateContactsPosition(res, data);
            })

        })

        // Generated new contact received message if contact not exists.
        this.socket.client.on("new", (data: messageStruct) => {
            this.service.getDataByIndex("/contacts", this.user.user_id).subscribe({
                next: (res: contactStruct[]) => {
                    this.contactUserSubject.next(res);
                    this.updateContactsPosition(res, data);
                },
                error: (error) => {
                    console.log(error);
                }
            })
        })

        this.service.getDataByIndex("/contacts", this.user.user_id).subscribe({
            next: (res: contactStruct[]) => {
                this.contactUserSubject.next(res);
            },
            error: (error) => {
                console.log(error);
            }
        })

        this.service.getDataByIndex("/avatar", this.user.user_id).subscribe({
            next: (res: userImageStruct) => {
                this.photoSubject.next(res.photo);
            },
            error: (error) => {
                console.log(error);
            }
        })

        // this.service.getServerDate().subscribe({

        // })
    }

    public ngOnDestroy() {
        this.contactUserSubject.unsubscribe();
        this.photoSubject.unsubscribe();
        this.messageSubject.unsubscribe();
        this.contactSubject.unsubscribe();
        this.searchSubject.unsubscribe();
    }

    public async handleSelectChat(id: number) {
        // const socket = io("http://localhost:4000");

        // socket.emit("test");

        this.chatIndex = id;

        if (this.responsiveSubject.value < 988) {
            const element: ElementRef = this.renderer2.selectRootElement(this.idElementMenu);
            this.renderer2.addClass(element.nativeElement, "class_chat_menu_container_hidden");
        }

        const contacts: contactStruct[] = this.contactUserSubject.value;
        
        if (this.search.length) {
            return;
        }

        this.chatProfile = contacts[id].photo;
        this.chatName = `${contacts[id].name} ${contacts[id].lastname}`;
        this.chatUserId = contacts[id].id;

        const { element } = this.chatElementByIndex(contacts, contacts[id].id);

        this.countMessages(element, 1);

        const messages = new GetMessages(this.service);
        const msg = await messages.get(this.user.user_id, contacts[id].id);

        this.messageSubject.next(msg);
        this.chatPositionLastMessage();
    }

    // public getLastMessage(id: number) {
    //     let message: string[] = [];
        
    //     this.contacts$.subscribe((res) => {
    //         message = res[id].messages;
    //     })

    //     return message[message.length - 1];
    // }

    public handleSendMessage() {
        
        const idElementInput: ElementRef = this.renderer2.selectRootElement(this.idElementInput);
        const msg = idElementInput.nativeElement.value;

        const idElementChatUserContainer: ElementRef = this.renderer2.selectRootElement(this.idElementChatUserContainer);
        idElementChatUserContainer.nativeElement.scrollTop = 0;
        
        if (!msg.length) {
            return;
        }

        const contacts: contactStruct[] = this.contactUserSubject.value;

        const idReceived: number = contacts[this.chatIndex].id;

        const message: messageStruct = {
            sender: this.user.user_id,
            received: idReceived,
            message: msg,
            date: new Date().toLocaleString()
        }
        
        this.service.sendMessages(message).subscribe({
            next: () => {
                this.socket.sendMessage(message);
                this.chatPositionLastMessage();
                this.updateContactsPosition(contacts, message);
            },
            error: (error) => {
                console.log(error);
            }
        })
    }

    public nextMessage(message: messageStruct) {
        this.messageSubject.next([...this.messageSubject.value, message]);
        this.idElementInput.nativeElement.value = "";
    }

    public chatPositionLastMessage() {
        const element: ElementRef = this.renderer2.selectRootElement(this.idChatInformationContainer);
        
        const mutation = new MutationObserver((mute) => {
            element.nativeElement.scrollTop = element.nativeElement.scrollHeight;
        })

        mutation.observe(element.nativeElement, {
            childList: true
        });
    }

    public messageDate(date: string) {
        if (!date) {
            return;
        }

        return date.split(" ").pop();
    }

    public updateContactsPosition(res: contactStruct[], data: messageStruct) {
        /* Update array item position to first element */
        const index = (this.user.user_id === data.sender) ? data.received : data.sender;

        /* Search array position element in userID */
        const { element, lastPos } = this.chatElementByIndex(res, index)

        /* Get actually contact position if received new message */
        
        res[lastPos].messages = data.message;
        res[lastPos].date = new Date().toLocaleTimeString();
        const array = res.splice(lastPos, 1);
        res.splice(0, 0, array[0]);

        this.contactSubject.next(res);

        /* Get actually position in chat selected  */
        if  (this.chatIndex !== -1) {
            const { pos } = this.chatElementByIndex(res, this.chatUserId);
            
            this.chatIndex = pos;
        }
        
        if (index !== data.received && res[this.chatIndex]?.id !== data.sender) {
            
            this.countMessages(element);
            return;
        }

        this.nextMessage(data);
        
        // if (this.chatIndex === pos) {
        //     this.chatIndex = 0;
        // }
    }

    public chatElementByIndex(res: contactStruct[], id: number) {

        const pos = res.findIndex((str: contactStruct) => str.id === id);
        const lastPos = res.findIndex((str: contactStruct) => str.id === id);
        

        const contacts = this.renderer2.selectRootElement(this.idElementContacts);
        const element: ElementRef = contacts._results[pos];

        return {
            element: element.nativeElement,
            pos: pos,
            lastPos: lastPos
        };
    }

    public countMessages(element: any, reset?: number) {
        
        
        let number: number;
        number = parseInt(element.getAttribute("data-messages")) + 1; 

        
        if (reset) {
            number = 0;
            this.renderer2.removeClass(element.lastChild, "class_chat_user_information_messages_number_display");
        }
        else {
            this.renderer2.addClass(element.lastChild, "class_chat_user_information_messages_number_display");
        }
        
        this.renderer2.setAttribute(element, "data-messages", `${number}`);
        element.lastChild.innerHTML = element.getAttribute("data-messages");
            
    }

    public async searchContact(ev: any) {
        this.search = ev.target.value;

        this.contactUser$.subscribe({
            next: (res) => {
                let contacts: contactStruct[];
                contacts = res.filter((str) => str.name.toLowerCase().includes(this.search.toLowerCase()) || str.lastname.toLowerCase().includes(this.search.toLowerCase()));
                this.contactSubject.next(contacts);
                // res = [];
            },
            error: (error) => {
                console.log(error);
            }
        })

        if (this.search.length === 0) {
            this.searchSubject.next([]);
            return;
        }
        
        const search = new SearchContact(this.service, this.user.user_id);
        const contacts: contactStruct[] = await search.contacts(this.search);
        
        if (!contacts.length) {
            return;
        }

        this.searchSubject.next(contacts);
    }

    public addContact(contact: contactStruct) {
        new AddContact(contact, this.user.user_id, this.service);

        this.contactUserSubject.next([...this.contactUserSubject.value, contact]);
    }

    public openMenuResponsive() {
        const element: ElementRef = this.renderer2.selectRootElement(this.idElementMenu);
        this.renderer2.removeClass(element.nativeElement, "class_chat_menu_container_hidden");
    }

    public logout() {
        this.data.logout();
    }
}
