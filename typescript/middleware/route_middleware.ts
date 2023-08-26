import * as Controller from '../controller';
import { ErrorEnum } from '../factory/error';


/**
 * Middleware 'checkRefill'
 * 
 * Controlla che il valore di token che un admin deve riassegnare a un utente abbia effettivamente
 * un valore numerico e maggiore di 0.
 * 
 * @param req La richiesta da parte del client
 * @param res La risposta da parte del server
 * @param next Il riferimento al middleware successivo
 */
export function checkRefill(req: any, res: any, next: any): void {
    if (typeof req.body.token != 'number' || req.body.token <= 0) next(ErrorEnum.MalformedPayload);
    else next();
}





/**
 * Middleware 'checkUserExistence'
 * 
 * Controlla che l'utente (user/owner) specificato nella richiesta del client esista effettivamente.
 * Per farlo invoca la funzione {@link checkUserExistence} del Controller.
 * 
 * @param req La richiesta da parte del client
 * @param res La risposta da parte del server
 * @param next Il riferimento al middleware successivo
 */
export function checkUserExistence(req: any, res: any, next: any) : void {
    Controller.checkUserExistence(req.body.owner, res).then((check) => {
        if(check) next();
        else next(ErrorEnum.UserNotFound);
    });
}


/**
 * Middleware 'checkAdmin'
 * 
 * Controlla che l'utente che effettua la chiamata sia effettivamente registrato come admin all'interno
 * del database.
 * Per farlo invoca le funzioni {@link checkUserExistence} e {@link getRole} del Controller.
 * 
 * @param req La richiesta da parte del client
 * @param res La risposta da parte del server
 * @param next Il riferimento al middleware successivo
 */
export function checkAdmin(req: any, res: any, next: any): void {
    Controller.checkUserExistence(req.body.sender_id, res).then((check) => {
        if(check) {
            Controller.getRole(req.body.sender_id, res).then((role: string) => {
                if(role == 'admin' && req.body.sender_role == 'admin') next()
                else next(ErrorEnum.Unauthorized);
            });
        } else next(ErrorEnum.UserNotFound);
    });
}