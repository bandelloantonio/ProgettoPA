import * as Controller from '../controller';
import { ErrorEnum, getError } from '../factory/error';









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
 * Middleware 'checkUserBalance'
 * 
 * Controlla che l'utente (owner) specificato nella richiesta di creazione di un evento abbia una
 * quantità di token sufficienti a completare l'inserimento
 * Per farlo invoca la funzione {@link checkUserBalance} del Controller.
 * 
 * @param req La richiesta da parte del client
 * @param res La risposta da parte del server
 * @param next Il riferimento al middleware successivo
 */
export function checkUserBalance(req: any, res: any, next: any): void {
    Controller.checkBalance(req.body.owner, req.body.modality, res).then((check) => {
        if(check) next();
        else next(ErrorEnum.InsufficientBalance);
    })
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


/**
 * Middleware 'checkPayload'
 * 
 * Controlla che la richiesta di creazione di un nuovo modello contenga dati ben formati.
 * Verifica che i campi necessari siano presenti e rispettino il formato corretto.
 * 
 * @param req La richiesta da parte del client
 * @param res La risposta da parte del server
 * @param next Il riferimento al middleware successivo
 */
export function checkPayload(req: any, res: any, next: any): void {
    const { nodes, edges } = req.body;

    // Verifica che tutti i campi richiesti siano presenti
    if ( !nodes || !edges) {
        return next(getError(ErrorEnum.MalformedPayload));
    }

    // Verifica che i campi 'nodes' e 'edges' siano array non vuoti
    if (!Array.isArray(nodes) || nodes.length === 0 || !Array.isArray(edges) || edges.length === 0) {
        return next(getError(ErrorEnum.InvalidData));
    }

    // Altri controlli sui campi nodes ed edges se necessario

    // Se tutte le verifiche passano, passa al middleware successivo
    next();
}


/**
 * Middleware 'checkDatetimes'
 * 
 * Controlla che la richiesta di creazione di un evento riporti nel corpo un vettore di datetimes
 * (stringhe contenenti data, orario e fuso per ognuno degli slot disposti allo svolgimento dell'evento)
 * le quali devono rispettare un pattern prestabilito. Si avvale della funzione {@link checkDatetime}.
 * Inoltre, controlla che nel vettore non ci siano datetime duplicati; per far ciò crea un Set a partire
 * dal vettore e valuta le dimensioni delle due strutture, se quest'ultime non coincidono si evince
 * che nell'array di partenza sono presenti duplicati in quanto un Set non accetta 'doppioni'.
 * 
 * @param req La richiesta da parte del client
 * @param res La risposta da parte del server
 * @param next Il riferimento al middleware successivo
 */
export function checkDatetimes(req: any, res: any, next: any) : void {
    const array: string[] = req.body.datetimes.filter(checkDatetime);
    if (array.length == 0) {
        if(new Set(req.body.datetimes).size !== req.body.datetimes.length) next(ErrorEnum.DuplicateDatetimes);
        else next();
    }
    else next(ErrorEnum.MalformedPayload);
}

/**
 * Funzione 'checkDatetime'
 * 
 * Invocata dal middleware {@link checkDatetimes}, si occupa di validare la stringa datetime, 
 * quest'ultima deve rispettare il pattern descritto tramite Regular Expression ed essere convertibile
 * in un oggetto di tipo Date.
 * 
 * @param datetime La stringa di cui valutare la correttezza
 * @returns True se la stringa rappresenta un datetime valido, False altrimenti
 */
function checkDatetime(datetime: string): boolean {
    const check = new RegExp(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
    return (!check.test(datetime) || !Date.parse(datetime));
}