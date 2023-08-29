import { Model, Op } from 'sequelize';
import { ErrorEnum, getError } from './factory/error';
import { SuccessEnum, getSuccess } from './factory/success';
import { User, Models, UpdateRequest} from './model/model';
import * as Dijkstra from 'node-dijkstra';



const models: any[] = []; // Array per i modelli

// Inizializza l'oggetto Dijkstra
const dijkstraGraph = new Dijkstra()








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
 * Funzione 'checkBalance'
 * 
 * Funzione che si occupa di controllare che un utente, data la sua mail, abbia una quantità di token 
 * sufficienti a creare il model con la modalità specificata. 
 * Si avvale della Mappa {@link hashDecreaseToken} per associare modalità a costo (in token).
 * 
 * @param email L'email dell'utente
 * @param modality La modalità dell'evento
 * @param res La risposta da parte del server
 * @returns True se l'utente ha abbastanza token, False altrimenti
 */
export async function checkBalance(email: string, modality: number, res: any): Promise<boolean>{
    let result: any;
    try{
        result = await User.findByPk(email, {raw: true});
    }catch(error){
        controllerErrors(ErrorEnum.InternalServer, error, res);
    }
    const requiredTokens = calculateCosts(result.nodes, result.edges);// Passa le specifiche vuote o in base ai dati reali
    if(result.token >= requiredTokens) return true;
    else return false;
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


/**
 * Funzione 'createModel'
 * 
 * Funzione che si occupa di creare un evento date le sue specifiche.
 * Se la creazione va a buon fine vengono decrementati i token dell'owner in base ai costi definiti
 * nella mappa {@link hashDecreaseToken}.
 * 
 * @param {object} req L'oggetto richiesta HTTP
 * @param res La risposta da parte del server
 * @param {object} res L'oggetto risposta HTTP
 */
export async function createModel(req, res) {

    const { name, nodes, edges, user_id } = req.body;
  
    // Verifica dei parametri richiesti
    if (!name || nodes === undefined || edges === undefined || !user_id) {
      const errorRes = getSuccess(SuccessEnum.CreatedModel).getSuccessObj();
      return  res.status(errorRes.status).json({message:errorRes.msg});
    }
  
    // Verifica che nodes e edges siano numeri positivi
    if (typeof nodes !== 'number' || typeof edges !== 'number' || nodes < 0 || edges < 0) {
      const errorRes = getSuccess(SuccessEnum.Positive).getSuccessObj();
      return res.status(errorRes.status).json({ message: errorRes.msg });
    }
  
    // Calcolo dei costi utilizzando la funzione esterna
    const totalCost = calculateCosts(nodes, edges);
 
    // Creare il grafo con il numero di nodi ed archi
    const graph = {};
    for (let i = 0; i < nodes; i++) {
      graph[i] = {};
      for (let j = 0; j < nodes; j++) {
        if (i !== j) {
          graph[i][j] = edges; // Assegna un peso fittizio agli archi
        }
      }
    }
  
    // Aggiungi il grafo all'oggetto Dijkstra (assumendo che dijkstraGraph sia già inizializzato)
    dijkstraGraph.addNode(name, graph);
  
    // Crea il modello
    const model = {
      id: models.length + 1,
      name,
      nodes,
      edges,
      user_id
    };
    models.push(model);
  
  
    const successRes = getSuccess(SuccessEnum.CreatedModel).getSuccessObj();
  res.status(successRes.status).json({ message: successRes.msg, model: model });

}


/**
 * Funzione 'calculateCosts'
 * 
 * Calcola il costo totale in base al numero di nodi e archi.
 * 
 * @param {number} nodes Il numero di nodi nel grafo
 * @param {number} edges Il numero di archi nel grafo
 * @returns {number} Il costo totale calcolato
 */
function calculateCosts(nodes, edges) {
    const nodeCost = nodes * 0.15;
    const edgeCost = edges * 0.01;
    const totalCost = nodeCost + edgeCost;
    return totalCost;
  }


  /**
 * Funzione 'checkModelExistence'
 * 
 * Funzione che si occupa di controllare che un modello esista, dato l'id.
 * 
 * @param model_id L'id del modello
 * @param res La risposta da parte del server
 * @returns True se l'evento esiste, False altrimenti
 */
export async function checkModelExistence(model_id: number, res: any): Promise<boolean> {
  let result: any;
  try{
      result = await Models.findByPk(model_id, {raw: true});
  }catch(error){
      controllerErrors(ErrorEnum.InternalServer, error, res);
  }
  return !!result; // Ritorna true se il risultato è definito, altrimenti false
}


/**
* Funzione 'getModelStatus'
* 
* Funzione che si occupa di ritornare tutte le informazioni dei modelli con stato "pending".
* 
* @param res La risposta da parte del server
* @returns Un array contenente le informazioni dei modelli con stato "pending"
*/
export async function getModelStatus(res: any): Promise<any[]> {
 let pendingModels: any[] = [];

 try {
   // Cerca i modelli con stato "pending" nella tabella update_models
   const updateModels = await UpdateRequest.findAll({ where: { status: 'pending' }, raw: true });

   if (updateModels) {
     pendingModels = pendingModels.concat(updateModels);
   }

   // Cerca i modelli con stato "pending" nella tabella models
   const models = await Models.findAll({ where: { status: 'pending' }, raw: true });

   if (models) {
     pendingModels = pendingModels.concat(models);
   }

   return pendingModels;

 } catch (error) {
   controllerErrors(ErrorEnum.InternalServer, error, res);
   return [];
 }
}



/**
 * Funzione 'getDateRequest'
 * 
 * Funzione che si occupa di ottenere gli aggiornamenti di un modello in base ai parametri di data e stato forniti.
 * 
 * @param model_id L'id del modello
 * @param start_date Data di inizio (opzionale)
 * @param end_date Data di fine (opzionale)
 * @param filtro Filtro temporale ("after", "before", "between")
 * @param res La risposta da parte del server
 * @returns Un array contenente gli aggiornamenti filtrati
 */
export async function getDateRequest(model_id: number, start_date?: string, end_date?: string, filtro?: string, res?: any): Promise<any[]> {
  try {
    let whereClause = { model_id };

    // Verifica se il formato delle date è valido e applica i filtri
    if (start_date) {
      if (!isValidDateFormat(start_date)) {
        return handleInvalidDateFormat(res);
      }
      if (filtro === "after") {
        whereClause['created_at'] = { [Op.gte]: start_date };
      }
    }
    if (end_date) {
      if (!isValidDateFormat(end_date)) {
        return handleInvalidDateFormat(res);
      }
      if (filtro === "before") {
        whereClause['created_at'] = { [Op.lte]: end_date };
      }
    }
    if (start_date && end_date && filtro === "between") {
      if (!isValidDateFormat(start_date) || !isValidDateFormat(end_date)) {
        return handleInvalidDateFormat(res);
      }
      whereClause['created_at'] = { [Op.between]: [start_date, end_date] };
    }
    if (filtro) {
      whereClause['status_update'] = filtro;
    }

    // Esegui la query per ottenere gli aggiornamenti filtrati
    const updates = await UpdateRequest.findAll({ where: whereClause });

    return updates;
  } catch (error) {
    console.error(error);
    if (res) {
      controllerErrors(ErrorEnum.InternalServer, error, res); // Utilizza la funzione controllerErrors per gestire l'errore
    }
    return [];
  }
}

/**
 * Funzione 'isValidDateFormat'
 * 
 * Verifica se il formato della data è valido (YYYY-MM-DD).
 * 
 * @param date La data da verificare
 * @returns True se il formato è valido, False altrimenti
 */
function isValidDateFormat(date: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  return regex.test(date);
}

/**
 * Funzione 'handleInvalidDateFormat'
 * 
 * Gestisce l'errore per formato data non valido. Crea un nuovo oggetto errore e lo passa alla
 * funzione 'controllerErrors' per la gestione dell'errore.
 * 
 * @param res La risposta da parte del server
 * @returns Un array vuoto
 */
function handleInvalidDateFormat(res: any) {
  const error = new Error('Invalid date format'); // Creazione di un nuovo oggetto errore
  controllerErrors(ErrorEnum.InvalidDateFormat, error, res); // Passaggio dell'oggetto errore alla funzione controllerErrors
  return [];
}