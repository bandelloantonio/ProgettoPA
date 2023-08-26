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

class TokenRefill implements SuccessObj {
    getSuccessObj(): { status : number,  msg : string } {
        return {
            status: 200,
            msg: Message.tokenRefill_message
        }
    }
}


export enum SuccessEnum {
   
    CreatedModel,
    TokenRefill
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
            case SuccessEnum.TokenRefill:
            retval = new TokenRefill();
            break;
    }
            
    return retval;
}