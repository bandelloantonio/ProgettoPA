import * as Message from "./string_messages";



/**
 * Interfaccia 'SuccessObj'
 * 
 * Dichiara il metodo {@link getSuccessObj} che viene implementato dalle classi successive.
 * Ogni classe si occupa di costruire un oggetto che riporterà i campi 'status' (status code
 * della risposta HTTP) e 'msg' (messaggio da ritornare al client nel corpo della risposta).
 *
 * @returns Oggetto da ritornare nel corpo della risposta
 */
interface  SuccessObj {
    getSuccessObj(): { status : number,  msg : string };
}

class CreatedModel implements SuccessObj {
    getSuccessObj(): { status : number,  msg : string } {
        return {
            status: 201,
            msg: Message.createdModel_message
        }
    }
}


class InvalidDateFormat implements SuccessObj {
    getSuccessObj(): { status : number,  msg : string } {
        return {
            status: 200,
            msg: Message.InvalidDateFormat_message
        }
    }
}


class Positive implements SuccessObj {
    getSuccessObj(): { status : number,  msg : string } {
        return {
            status: 201,
            msg: Message.positive_message
        }
    }
}

class TokenRefill implements SuccessObj {
    getSuccessObj(): { status : number,  msg : string } {
        return {
            status: 200,
            msg: Message.tokenRefill_message
        }
    }
}

class SaveModel implements SuccessObj {
    getSuccessObj(): { status : number,  msg : string } {
        return {
            status: 200,
            msg: Message.saveModel_message
        }
    }
}

export enum SuccessEnum {
   
    CreatedModel,
    TokenRefill,
    Positive,
    InvalidDateFormat,
    SaveModel,
}


/**
 * Funzione 'getSuccess'
 * 
 * Funzione che viene invocata dal controller nel momento in cui si conclude un'azione con successo.
 *
 * @param type Il tipo di 'successo' ottenuto dal Controller
 * @returns Un oggetto diverso dell'interfaccia {@link SuccessObj} a seconda del parametro in input
 */
export function getSuccess(type: SuccessEnum): SuccessObj{
    let retval: SuccessObj = null;
    switch (type){
            case SuccessEnum.CreatedModel:
            retval = new CreatedModel();
            break;
            case SuccessEnum.InvalidDateFormat:
            retval = new InvalidDateFormat();
            break;
            case SuccessEnum.Positive:
            retval = new Positive();
            break;
            case SuccessEnum.SaveModel:
            retval = new SaveModel();
            break;
            case SuccessEnum.TokenRefill:
            retval = new TokenRefill();
            break;
    }
            
    return retval;
}