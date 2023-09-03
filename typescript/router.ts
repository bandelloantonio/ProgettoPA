const express = require('express')
import * as Controller from './controller';
import { ErrorEnum, getError } from './factory/error';
import * as Middleware from './middleware/middleware_chain'

const app = express();

app.use(express.json());

app.use((err: Error, req: any, res: any, next: any) => {
    if (err instanceof SyntaxError) {
        const new_err = getError(ErrorEnum.MalformedPayload).getErrorObj();
        res.status(new_err.status).json(new_err.msg);
    }
    next();
});


/**
 * Richiesta che consente di creare un modello (Autenticazione JWT)
 */
app.post('/create-model', Middleware.JWT, Middleware.create_model, Middleware.create_model, function (req: any, res: any) {
    Controller.createModel(req.body, res);
});


/** 
 * Richiesta che permette di verificare lo stato di un modello ovvero se vi è una richiesta in fase di pending.
 */ 
app.post('/model_status', Middleware.NONJWT, Middleware.model_status, Middleware.error_handling, function (req: any, res: any) {
    Controller.getModelStatus(req.body);
});


/** 
 * Richiesta che permette di dare la possibilità di aggiornare un modello cambiando il peso per uno o più archi
 */ 
app.put('/update_weight', Middleware.JWT, Middleware.update_weight, Middleware.error_handling, function (req: any, res: any) {
    Controller.getDateRequest(req.body);
});




/** 
 * Richiesta che permette di dare la possibilità di approvare un modello aggiornato cambiando il peso per uno o più archi
 */ 
app.put('/approve_update_request', Middleware.NONJWT, Middleware.approve_update_request, Middleware.error_handling, function (req: any, res: any) {
    Controller.approveUpdateRequest(req.body,res,req);
});


/** 
 * Richiesta che permette di dare la possibilità di aggiornare un modello cambiando il peso per uno o più archi
 */ 
app.put('/rejected_update_request', Middleware.NONJWT, Middleware.rejected_update_request, Middleware.error_handling, function (req: any, res: any) {
    Controller.rejectedUpdateRequest(req.body,res,req);
});


/** 
 * Richiesta che permette di eseguire un modello fornendo un nodo di partenza ed uno di arrivo
 */ 
app.put('/execute_model', Middleware.NONJWT, Middleware.execute_model, Middleware.error_handling, function (req: any, res: any) {
    const email = req.body.email; 
    Controller.executeModel(req.body,res,req,email);
});


/** 
 * Richiesta che permette di v restituire l’elenco degli aggiornamenti effettuati nel 
 * corso del tempo filtrando opzionalmente per data (inferiore a, superiore a, compresa tra) 
 * distinguendo per stato ovvero accettato / rigettato
 */ 
app.post('/date_request', Middleware.NONJWT, Middleware.date_request, Middleware.error_handling, function (req: any, res: any) {
    Controller.getDateRequest(req.body);
});

/** 
 * Richiesta che permette di v restituire l’elenco degli aggiornamenti che sono in stato 
 * di pending relative a un'utente che si autentica mediante token JWT
 */ 
app.post('/pending_requests', Middleware.JWT, Middleware.pending_request, Middleware.error_handling, function (req: any, res: any) {
    Controller.getModelStatus(req.body)
});

/** 
 * Richiesta che permette ad un utente admin di ricaricare i token di un certo utente (Autenticazione JWT)
 */ 
app.post('/refill', Middleware.JWT, Middleware.refill, Middleware.error_handling, function (req: any, res: any) {
    Controller.refill(req.body.owner, req.body.token, res);
});


/** 
 * Gestione delle rotte non previste
 */ 
app.get('*', Middleware.any_other, Middleware.error_handling);
app.post('*', Middleware.any_other, Middleware.error_handling);





app.listen(8080)