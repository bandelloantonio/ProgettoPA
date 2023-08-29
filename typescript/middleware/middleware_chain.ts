import * as RouteMiddleware from './route_middleware';
import * as RequestMiddleware from './request_middleware';


/**
 * "Catene di middleware"
 * 
 * Gli array seguenti definiscono quali middleware (e in che ordine) devono essere superati
 * affinchè la richiesta HTTP pervenga al controller.
*/

export const JWT = [
    RequestMiddleware.checkAuthHeader, 
    RequestMiddleware.checkToken, 
    RequestMiddleware.verifyAndAuthenticate
];

export const NONJWT = [
    RequestMiddleware.checkPayloadHeader,
    RequestMiddleware.checkJSONPayload
];


export const create_model = [
    RouteMiddleware.checkUserExistence,
    RouteMiddleware.checkPayload,
    RouteMiddleware.checkDatetimes,
    RouteMiddleware.checkUserBalance
];

export const model_status = [
    RouteMiddleware.checkModelExistence,
    RouteMiddleware.checkModelStatus,
    RouteMiddleware.checkDatetimes,
];

export const date_request = [
    RouteMiddleware.checkModelExistence,
    RouteMiddleware.checkModelStatus,
    RouteMiddleware.checkDatetimes,
];


export const refill = [
    RouteMiddleware.checkAdmin,
    RouteMiddleware.checkUserExistence,
    RouteMiddleware.checkRefill
];

export const any_other = [
    RequestMiddleware.notFound
]

export const error_handling =[
    RequestMiddleware.logErrors,
    RequestMiddleware.errorHandler
];
