export interface contactStruct {
    id: number,
    name: string,
    lastname: string,
    photo: string,
    messages: string,
    date: string
}

export interface messageStruct {
    sender: number,
    received: number,
    message: string,
    date: string
}

export interface validationStruct {
    check: string,
    message: string
}

export interface loginStruct {
    token: string,
}

export interface userStruct {
    user_id: number,
    user_name: string,
    user_lastname: string,
    user_photo: string
}

export interface userImageStruct {
    photo: string
}