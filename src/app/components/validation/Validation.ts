import { validationStruct } from "src/app/interfaces/Interface";

export const FIELD_MESSAGE_ERRORS: validationStruct[] = [
    { check: "required", message: "Este campo es requerido." },
    { check: "min", message: "Este campo require 3 carácteres." },
    { check: "max", message: "Este campo no puede superar los 15 carácteres." },
    { check: "email", message: "Este campo no puede superar los 15 carácteres." },
]