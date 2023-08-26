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


// Creazione di un nuovo modello
app.post('/create-model', Middleware.JWT, Middleware.create_model, Middleware.create_model, function (req: any, res: any) {
    Controller.createModel(req.body, res);
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