import { ErrorEnum, getError } from './factory/error';
import { SuccessEnum, getSuccess } from './factory/success';
import { User} from './model/model';





let hashDecreaseToken: Map<number, number> = new Map();
hashDecreaseToken.set(1,1); 
hashDecreaseToken.set(2,2); 
hashDecreaseToken.set(3,4); 

/**
 * Funzione 'checkUserExistence'
 * 
 * Funzione che si occupa di controllare che un utente esista data la sua email.
 * 
 * @param email L'email dell'utente
 * @param res La risposta da parte del server
 * @returns True se l'utente esiste, False altrimenti
 */
export async function checkUserExistence(email: string, res: any): Promise<boolean>{
    let result: any;
    try{
        result = await User.findByPk(email, {raw: true});
    }catch(error){
        controllerErrors(ErrorEnum.InternalServer, error, res);
    }
    return result;
}


/**
 * Funzione 'getRole'
 * 
 * Funzione che si occupa di ritornare il ruolo di un utente, data la mail.
 * 
 * @param email L'email dell'utente
 * @param res La risposta da parte del server
 * @returns Il ruolo dell'utente
 */
export async function getRole(email: string, res: any): Promise<string> {
    let result: any;
    try{
        result = await User.findByPk(email, {raw: true});
    }catch(error){
        controllerErrors(ErrorEnum.InternalServer, error, res);
    }
    return result.role;
}


/**
 * Funzione 'refill'
 * 
 * Funzione che si occupa di ricaricare i token di un utente data la mail, assegnando loro
 * un nuovo valore.
 * 
 * @param owner L'email dell'utente
 * @param token La nuova quantità di token da assegnare
 * @param res La risposta da parte del server
 * @returns Il ruolo dell'utente
 */
export function refill(owner: string, token: number, res: any): void {
    User.update({token: token}, {where: {email: owner}}).then(() => {
        const new_res = getSuccess(SuccessEnum.TokenRefill).getSuccessObj();
        res.status(new_res.status).json({message:new_res.msg});
    }).catch((error) => {
        controllerErrors(ErrorEnum.InternalServer, error, res);
    });
}



/**
 * Funzione 'controllerErrors'
 * 
 * Funzione invocata dai metodi del Controller in caso di errori e che si occupa di invocare
 * il metodo {@link getError} della Factory di errori per costruire oggetti da ritornare al client
 * nel corpo della risposta.
 * 
 * @param enum_error Il tipo di errore da costruire
 * @param err L'effettivo errore sollevato
 * @param res La risposta da parte del server
 */
function controllerErrors(enum_error: ErrorEnum, err: Error, res: any) {
    const new_err = getError(enum_error).getErrorObj();
    console.log(err);
    res.status(new_err.status).json(new_err.msg);
}

