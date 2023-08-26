require('dotenv').config();
import * as jwt from 'jsonwebtoken';
import { getError, ErrorEnum } from '../factory/error';

/**
 * Middleware 'checkAuthHeader'
 * 
 * Controlla che la richiesta HTTP abbia un Authorization Header.
 * 
 * @param req La richiesta da parte del client
 * @param res La risposta da parte del server
 * @param next Il riferimento al middleware successivo
 */
export function checkAuthHeader (req: any, res: any, next: any): void{
    if (req.headers.authorization) next();
    else next(ErrorEnum.NoAuthHeader);
}

/**
 * Middleware 'checkPayloadHeader'
 * 
 * Controlla che la richiesta HTTP abbia un Content-Type all'interno dell'header che specifichi 
 * il tipo di contenuto 'application/json'.
 * 
 * @param req La richiesta da parte del client
 * @param res La risposta da parte del server
 * @param next Il riferimento al middleware successivo
 */
export function checkPayloadHeader(req: any, res: any, next: any): void{
    if (req.headers["content-type"] == 'application/json') next();
    else next(ErrorEnum.NoPayloadHeader);
}

/**
 * Middleware 'checkToken'
 * 
 * Controlla che nell'header compaia il JWT TOKEN.
 * 
 * @param req La richiesta da parte del client
 * @param res La risposta da parte del server
 * @param next Il riferimento al middleware successivo
 */
export function checkToken(req: any, res: any, next: any): void{
    const bearerHeader: string = req.headers.authorization;
    if (typeof bearerHeader !== 'undefined'){
        const bearerToken: string = bearerHeader.split(' ')[1];
        req.token = bearerToken;
        next();
    } else next(ErrorEnum.MissingToken);
}

/**
 * Middleware 'verifyAndAuthenticate'
 * 
 * Verifica che il TOKEN riporti una chiave di autenticazione che corrisponda
 * alla chiave segreta registrata tra le variabili d'ambiente.
 * 
 * @param req La richiesta da parte del client
 * @param res La risposta da parte del server
 * @param next Il riferimento al middleware successivo
 */
export function verifyAndAuthenticate(req: any, res: any, next: any): void{
    try {
        const decoded: string | jwt.JwtPayload  = jwt.verify(req.token, process.env.KEY);
        if (decoded != null) {
            req.body = decoded;
            next();
        }
    } catch (error) { 
        next(ErrorEnum.InvalidToken); 
    }
}

/**
 * Middleware 'checkJSONPayload'
 * 
 * Controlla che nel corpo della richiesta HTTP compaia un JSON ben formattato.
 * 
 * @param req La richiesta da parte del client
 * @param res La risposta da parte del server
 * @param next Il riferimento al middleware successivo
 */
 export function checkJSONPayload(req: any, res: any, next: any): void{
    try {
        req.body = JSON.parse(JSON.stringify(req.body));
        next();
    } catch (error) { 
        next(ErrorEnum.MalformedPayload)
    }
}

/**
 * Middleware 'notFound'
 * 
 * Si occupa delle richieste in cui viene specificata una rotta non predisposta dal servizio.
 * 
 * @param req La richiesta da parte del client
 * @param res La risposta da parte del server
 * @param next Il riferimento al middleware successivo
 */
export function notFound(req: any, res: any, next: any) {
    next(ErrorEnum.RouteNotFound);
}

/**
 * Middleware 'logErrors'
 * 
 * Invocato dagli strati middleware precedenti, si occupa di stampare a schermo l'oggetto
 * creato dalla Factory {@link getError} degli errori.
 * 
 * @param err L'errore generato dagli strati middleware precedenti
 * @param req La richiesta da parte del client
 * @param res La risposta da parte del server
 * @param next Il riferimento al middleware successivo
 */
export function logErrors(err: any, req: any, res: any, next: any): void {
    const new_err = getError(err).getErrorObj();
    console.log(new_err);
    next(new_err);
}

/**
 * Middleware 'errorHandler'
 * 
 * Invocato dagli strati middleware precedenti, si occupa di ritornare nel corpo della
 * risposta l'oggetto creato dalla Factory {@link getError} degli errori e ricevuto 
 * dal middleware {@link logErrors}.
 * 
 * @param err L'errore generato dagli strati middleware precedenti
 * @param req La richiesta da parte del client
 * @param res La risposta da parte del server
 * @param next Il riferimento al middleware successivo
 */
export function errorHandler(err: any, req: any, res: any, next: any): void { 
    res.status(err.status).json(err.msg);
}