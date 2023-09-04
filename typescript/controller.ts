import {  Op } from 'sequelize';
import { ErrorEnum, getError } from './factory/error';
import { SuccessEnum, getSuccess } from './factory/success';
import { User, Models, UpdateRequest} from './model/model';
import Graph = require("node-dijkstra");


const models: any[] = []; 

// Inizializza l'oggetto Dijkstra
const dijkstraGraph = new Graph();








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
 * Funzione 'checkUpdate'
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
export async function checkUpdate(email: string, modality: number, res: any): Promise<boolean>{
  let result: any;
  try{
      result = await User.findByPk(email, {raw: true});
  }catch(error){
      controllerErrors(ErrorEnum.InternalServer, error, res);
  }
  const requiredTokens = calculateCostsUpdate(result.edges);// Passa le specifiche vuote o in base ai dati reali
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
export async function createModel(req: { body: { id : any ; email: any; nodes: any; edges: any; nome: any; created_at: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message: string; model?: { id: any; nome: any; email: any; nodes: number; edges: number; status: string; created_at: any; }; }): void; new(): any; }; }; }) {

    const { id, email, nodes, edges, nome, created_at } = req.body;
  
    // Verifica dei parametri richiesti
    if (!nome || !email || nodes === undefined || edges === undefined) {
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
    }

      // Aggiungi i pesi degli archi al grafo
    for (let i = 1; i < nodes; i++) {
      const edgeKey = `${i}-${i + 1}`;
      graph[i][i + 1] = edges[edgeKey];
      graph[i + 1][i] = edges[edgeKey]; // Nel caso di un grafo non diretto
    }
  
  
    // Aggiungi il grafo all'oggetto Dijkstra (assumendo che dijkstraGraph sia già inizializzato)
    dijkstraGraph.addNode(email, graph);
  
    // Crea il modello
    const model = {
      id,
      nome,
      email,
      nodes,
      edges,
      status: 'approved',
      created_at,
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
function calculateCosts(nodes: number, edges: number) {
    const nodeCost = nodes * 0.15;
    const edgeCost = edges * 0.01;
    const totalCost = nodeCost + edgeCost;
    return totalCost;
  }


  /**
 * Funzione 'calculateCosts'
 * 
 * Calcola il costo totale in base al numero di archi aggiornati
 * 
 * @param {number} edges Il numero di archi nel grafo
 * @returns {number} Il costo totale calcolato
 */
function calculateCostsUpdate( edges: number) {
  
  const edgeCost = edges * 0.05;
 
  return edgeCost;
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







/**
 * Funzione 'update_weight'
 * 
 * Gestisce l'approvazione o il rifiuto di una richiesta di aggiornamento del modello.
 * 
 * @param {string} nome Il nome del modello
 * @param {string} email L'email dell'utente che fa la richiesta
 * @param {object} req L'oggetto della richiesta HTTP
 * @returns {object} Un oggetto con lo stato e il messaggio del risultato dell'operazione
 */
export async function update_weight(nome, res, email, req) {
  const userEmailFromRequest = email;
  const modelNameFromRequest = nome;

  // Verifica se esiste già una richiesta in fase "pending" per questo modello
  const existingPendingRequest = await UpdateRequest.findOne({
    where: {
      nome: modelNameFromRequest,
      status_update: 'pending'
    }
  });

  if (existingPendingRequest) {
    // Esiste già una richiesta in fase "pending" per questo modello
    const error = new Error('Request refused');
    controllerErrors(ErrorEnum.Rejected_request, error, res);
  } else {

    const model = await Models.findOne({
      where: { nome: modelNameFromRequest },
      
    });
    

   
        if (model.user_email === userEmailFromRequest) {

          const updateData = req.body.edges;
          const alpha = parseFloat(process.env.ALPHA);

          for (const edge in updateData) {
            if (updateData.hasOwnProperty(edge)) {
              const weight = updateData[edge];
              const previousWeight = model.edges[edge];

               // Calcola il nuovo peso secondo la formula della media esponenziale
              const newWeight = alpha * previousWeight + (1 - alpha) * weight;

              // Aggiorna il peso dell'arco nel modello
              model.edges[edge] = newWeight;
              
              // Verifica se l'arco esiste nel modello
              if (arcExist(model, edge)) {
                // L'arco esiste, puoi aggiornare il peso
                model.edges[edge] = weight;
              } else {
                // L'arco non esiste, gestisci l'errore
                const error = new Error(`L'arco ${edge} non esiste nel modello`);
                controllerErrors(ErrorEnum.EdgesNotExist, error, res);
                return;
              }
            }
          }

          
          // Salva il modello aggiornato nel database
          await model.save();

          // Aggiorna lo stato del modello a "approved"
          model.status = 'approved';
          await model.save();

          const successRes = getSuccess(SuccessEnum.SaveModel).getSuccessObj();
          res.status(successRes.status).json({ message: successRes.msg, model: model });

        } else {

          const updateData = req.body.edges;

          for (const edge in updateData) {
            if (updateData.hasOwnProperty(edge)) {
              const weight = updateData[edge];

              // Verifica se l'arco esiste nel modello
              if (arcExist(model, edge)) {
                // L'arco esiste, puoi aggiornare il peso
                model.edges[edge] = weight;
              } else {
                // L'arco non esiste, gestisci l'errore
                const error = new Error(`L'arco ${edge} non esiste nel modello`);
                controllerErrors(ErrorEnum.EdgesNotExist, error, res);
                return;
              }
            }
          }

          // Salva il modello aggiornato nel database
          await model.save();

          const successRes = getSuccess(SuccessEnum.SaveModel).getSuccessObj();
          res.status(successRes.status).json({ message: successRes.msg, model: model });

          // Aggiorna lo stato del modello a "pending"
          model.status = 'pending';
          await model.save();
        }
      }
    } 


  /**
  * Funzione 'arcExist'
  * 
  * Verifica se un arco specificato esiste nell'oggetto "edges" di un modello.
  * 
  * @param {object} model Il modello da controllare
  * @param {string} edge Il nome dell'arco da verificare
  * @returns {boolean} True se l'arco esiste, altrimenti False
  */
  function arcExist(model: any, edge: string): boolean {
    // Verifica se l'arco specificato esiste nell'oggetto "edges" del modello
    return model.edges.hasOwnProperty(edge);
  }



 /**
 * Funzione 'approveUpdateRequest'
 * 
 * Gestisce l'approvazione di una richiesta di aggiornamento del modello.
 * 
 * @param {object} body Il corpo della richiesta
 * @param {object} res L'oggetto di risposta HTTP
 * @param {object} req L'oggetto di richiesta HTTP
 */
export async function approveUpdateRequest(body: any, res, req) {
  const requestId = req.params.requestId;

  // Trova la richiesta di aggiornamento nel database
  const updateRequest = await UpdateRequest.findByPk(requestId);

  if (!updateRequest) {
    // La richiesta di aggiornamento non esiste
    const error = new Error('Update request not found');
    controllerErrors(ErrorEnum.ModelNotFound, error, res);
    return;
  }

  // Trova il modello che desideri aggiornare nel database
  const modelIdToUpdate = updateRequest.model_id;
  const updatedModel = await Models.findByPk(modelIdToUpdate);

  if (!updatedModel) {
    // Il modello da aggiornare non esiste
    const error = new Error('Model to update not found');
    controllerErrors(ErrorEnum.ModelNotFound, error, res);
    return;
  }

  // Esegui l'aggiornamento del modello in base ai dati dell'aggiornamento
  const updateData = updateRequest.data; // Sostituisci con la struttura dati corretta

  // Modifica lo stato del modello a 'approved'
  updatedModel.status = 'approved';
  await updatedModel.save();

  const successRes = getSuccess(SuccessEnum.SaveModel).getSuccessObj();
  res.status(successRes.status).json({ message: successRes.msg, model: updatedModel });
}




/**
 * Funzione 'rejectedUpdateRequest'
 * 
 * Gestisce il rifiuto di una richiesta di aggiornamento del modello.
 * 
 * @param {object} body Il corpo della richiesta
 * @param {object} res L'oggetto di risposta HTTP
 * @param {object} req L'oggetto di richiesta HTTP
 */
export async function rejectedUpdateRequest(body: any, res, req) {
  const requestId = req.params.requestId;

  // Trova la richiesta di aggiornamento nel database
  const updateRequest = await UpdateRequest.findByPk(requestId);

  if (!updateRequest) {
    // La richiesta di aggiornamento non esiste
    const error = new Error('Update request not found');
    controllerErrors(ErrorEnum.ModelNotFound, error, res);
    return;
  }

  // Trova il modello che desideri aggiornare nel database
  const modelIdToUpdate = updateRequest.model_id;
  const updatedModel = await Models.findByPk(modelIdToUpdate);

  if (!updatedModel) {
    // Il modello da aggiornare non esiste
    const error = new Error('Model to update not found');
    controllerErrors(ErrorEnum.ModelNotFound, error, res);
    return;
  }

  // Esegui l'aggiornamento del modello in base ai dati dell'aggiornamento
  const updateData = updateRequest.data; // Sostituisci con la struttura dati corretta

  // Modifica lo stato del modello a 'rejected'
  updatedModel.status = 'rejected';
  await updatedModel.save();

  const successRes = getSuccess(SuccessEnum.SaveModel).getSuccessObj();
  res.status(successRes.status).json({ message: successRes.msg, model: updatedModel });
}









/**
 * Funzione 'executeModel'
 * 
 * Esegue un modello fornito un nodo di partenza e uno di arrivo.
 * 
 * @param {string} startNode Il nodo di partenza
 * @param {string} goalNode Il nodo di arrivo
 * @returns {object} Un oggetto con il percorso e il costo associato
 */
export async function executeModel(startNode: any, modelNameOrId: any, goalNode: any, email : string) {
  try {

    const userEmailFromRequest = email;

    // Esegui la ricerca del modello tramite il nome o l'ID fornito
    const model = await Models.findOne({
      where: {
        [Op.or]: [
          { nome: modelNameOrId }, // Sostituisci "nome" con il nome del campo nel tuo database
          { id: modelNameOrId },   // Sostituisci "id" con il nome del campo nel tuo database
        ],
      },
    });

    if (!model) {
      // Il modello non è stato trovato
      return { error: "Modello non trovato" };
    }

    const startTime = Date.now();

    // Esegui il calcolo del percorso ottimo utilizzando il modello e i nodi di partenza e arrivo
    const optimalPath = calculateOptimalPath(model, startNode, goalNode);

    const endTime = Date.now();
    const executionTime = endTime - startTime;

    if (!optimalPath) {
      // Nessun percorso trovato
      return { error: "Nessun percorso trovato" };
    }

    // Estrai i nodi e gli archi dal modello
    const nodes = model.node; 
    const edges = model.edges; 

    // Calcola il costo totale del percorso utilizzando calculateTokenCost
    const numberOfNodes = nodes.length;
    const numberOfEdges = edges.length;
    const tokenCost = calculateCosts(numberOfNodes, numberOfEdges);

    // Verifica se il credito dell'utente è sufficiente per coprire il costo totale
    const user = await User.findOne({
      where: {
        email: userEmailFromRequest, 
      },
    });

    if (!user) {
      // Utente non trovato
      return { error: 'Utente non trovato' };
    }

    if (user.token < tokenCost) {
      // Il credito dell'utente non è sufficiente
      return { error: 'Credito insufficiente' };
    }

    // Sottrai il costo dal credito dell'utente
    user.token -= tokenCost;
    await user.save();

    // Ritorna il percorso e il costo associato
    return { path: optimalPath, cost: tokenCost, executionTime: executionTime };
  } catch (error) {
    console.error("Errore durante l'esecuzione del modello:", error);
    return { error: 'Errore durante l\'esecuzione del modello' };
  }
}



/**
 * Funzione per calcolare il percorso ottimo
 * 
 * @param {object} graphs I grafi
 * @param {string} startNode Il nodo di partenza
 * @param {string} goalNode Il nodo di arrivo
 * @returns {array} Il percorso ottimo
 */
function calculateOptimalPath(graphs, startNode, goalNode) {
  const route = new Graph();
  
  // Aggiungi i nodi e gli archi dai tuoi grafi
  for (const graph of graphs) {
    const { node, edges } = graph;
    route.addNode(node, edges);
  }
  
  // Esegui il calcolo del percorso
  const optimalPath = route.path(startNode, goalNode);
  
  return optimalPath;
}


/**
 * Funzione 'calculateCosts'
 * 
 * Calcola il costo totale in base al percorso ottimo considerando i pesi degli archi.
 * 
 * @param {string[]} path Il percorso ottimo nel grafo
 * @param {object} model Il modello del grafo con pesi sugli archi
 * @returns {number} Il costo totale calcolato
 */
function pathCost(path, model) {
  let totalCost = 0;
  
  // Calcola il costo sommando i pesi degli archi nel percorso ottimo
  for (let i = 0; i < path.length - 1; i++) {
    const fromNode = path[i];
    const toNode = path[i + 1];
    
    // Assicurati che il model contenga informazioni sui pesi degli archi tra fromNode e toNode
    if (model.edges[fromNode] && model.edges[fromNode][toNode]) {
      totalCost += model.edges[fromNode][toNode]; // Aggiungi il peso dell'arco al costo totale
    } else {
      totalCost += Number.POSITIVE_INFINITY;
    }
  }
  
  return totalCost;
}