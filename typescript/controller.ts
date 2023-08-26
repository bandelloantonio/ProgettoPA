import { ErrorEnum, getError } from './factory/error';
import { SuccessEnum, getSuccess } from './factory/success';
import { User, Models, Nodes, Edges} from './model/model';
import Graph from 'node-dijkstra';


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
    const requiredTokens = calculateModelCost({ nodes: [], edges: [] }); // Passa le specifiche vuote o in base ai dati reali
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



export async function createModel(model: any, res: any): Promise<void> {
    try {
        const graphData = await getGraphData(model.id);
        const graph = new Graph(graphData);

        Models.create(model).then((item) => {
            User.decrement(['token'], { by: calculateModelCost(model), where: { email: model.owner } });
            
            const shortestPath = graph.path(graphData.nodes[0], graphData.nodes[1]); // Utilizza i primi due nodi come esempio, sostituisci con i nodi desiderati

            const new_res = getSuccess(SuccessEnum.CreatedModel).getSuccessObj();
            res.status(new_res.status).json({ message: new_res.msg, model: item });
        }).catch((error) => {
            controllerErrors(ErrorEnum.InternalServer, error, res);
        });
    } catch (error) {
        controllerErrors(ErrorEnum.InternalServer, error, res);
    }
}

async function getGraphData(modelId: number): Promise<any> {
    try {
        const nodes = await Nodes.findAll({ where: { model_id: modelId } });
        const edges = await Edges.findAll({ where: { model_id: modelId } });

        const nodeNames = nodes.map(node => node.getDataValue('node_name'));
        const formattedEdges = edges.map(edge => ({
            from: nodeNames[edge.getDataValue('source_node_id') - 1], // I nodi nel database partono da 1
            to: nodeNames[edge.getDataValue('target_node_id') - 1],   // Gli id dei nodi sono sequenziali e partano da 1
            weight: edge.getDataValue('cost')
        }));

        return {
            nodes: nodeNames,
            edges: formattedEdges
        };
    } catch (error) {
        throw error;
    }
}






/**
 * Funzione 'calculateModelCost'
 * 
 * Funzione che calcola il costo in token per creare un modello in base alle specifiche.
 * 
 * @param model L'oggetto che contiene le specifiche del modello da creare
 * @returns Il costo in token per creare il modello
 */
function calculateModelCost(model: any): number {
    const nodeCost = model.nodes.length * 0.15;
    const edgeCost = model.edges.length * 0.01;
    const totalCost = nodeCost + edgeCost;
    return totalCost;
}
