import * as Message from "./string_messages";

/**
 * Interfaccia 'ErrorObj'
 * 
 * Dichiara il metodo {@link getErrorObj} che viene implementato dalle classi successive.
 * Ogni classe si occupa di costruire un oggetto che riporterà i campi 'status' (status code
 * della risposta HTTP) e 'msg' (messaggio da ritornare al client nel corpo della risposta).
 *
 * @returns Oggetto da ritornare nel corpo della risposta
 */
interface ErrorObj {
    getErrorObj(): { status: number,  msg: string };
}

class NoAuthHeaderError implements ErrorObj {
    getErrorObj(): { status: number,  msg: string } {
        return {
            status: 400,
            msg: Message.noAuthHeader_message
        }
    }
}

class NoPayloadHeaderError implements ErrorObj {
    getErrorObj(): { status: number,  msg: string } {
        return {
            status: 400,
            msg: Message.noPayoadHeader_message
        }
    }
}

class MissingToken implements ErrorObj {
    getErrorObj(): { status: number,  msg: string } {
        return {
            status: 400,
            msg: Message.missingToken_message
        }
    }
}

class InvalidToken implements ErrorObj {
    getErrorObj(): { status: number,  msg: string } {
        return {
            status: 403,
            msg: Message.invalidToken_message
        }
    }
}

class MalformedPayloadError implements ErrorObj {
    getErrorObj(): { status: number,  msg: string } {
        return {
            status: 400,
            msg: Message.malformedPayload_message
        }
    }
}

class RouteNotFound implements ErrorObj {
    getErrorObj(): { status: number,  msg: string } {
        return {
            status: 404,
            msg: Message.routeNotFound_message
        }
    }
}

class UnauthorizedError implements ErrorObj {
    getErrorObj(): { status: number,  msg: string } {
        return {
            status: 401,
            msg: Message.unauthorized_message
        }
    }
}

class ForbiddenError implements ErrorObj {
    getErrorObj(): { status: number,  msg: string } {
        return {
            status: 403,
            msg: Message.Forbidden_message
        }
    }
}

class NotFoundError implements ErrorObj {
    getErrorObj(): { status: number,  msg: string } {
        return {
            status: 404,
            msg: Message.notFound_message
        }
    }
}

class InternalServerError implements ErrorObj {
    getErrorObj(): { status: number,  msg: string } {
        return {
            status: 500,
            msg: Message.internalServerError_message
        }
    }
}

class ServiceUnavailableError implements ErrorObj {
    getErrorObj(): { status: number,  msg: string } {
        return {
            status: 503,
            msg: Message.serviceUnavailable_message
        }
    }
}

class BadRequest implements ErrorObj {
    getErrorObj(): { status: number,  msg: string } {
        return {
            status: 400,
            msg: Message.badRequest_message
        }
    }
}


class DuplicateDatetimes implements ErrorObj {
    getErrorObj(): { status: number,  msg: string } {
        return {
            status: 400,
            msg: Message.duplicateDatetimes_message
        }
    }
}

class UserNotFound implements ErrorObj {
    getErrorObj(): { status: number,  msg: string } {
        return {
            status: 404,
            msg: Message.userNotFound_message
        }
    }
}

class StatusModel implements ErrorObj {
    getErrorObj(): { status: number,  msg: string } {
        return {
            status: 403,
            msg: Message.errorStatusModel_message
        }
    }
}
class InvalidDateFormat implements ErrorObj {
    getErrorObj(): { status : number,  msg : string } {
        return {
            status: 202,
            msg: Message.InvalidDateFormat_message
        }
    }
}
class ModelNotFound implements ErrorObj {
    getErrorObj(): { status: number,  msg: string } {
        return {
            status: 404,
            msg: Message.modelNotFound_message
        }
    }
}

class InsufficientBalance implements ErrorObj {
    getErrorObj(): { status: number,  msg: string } {
        return {
            status: 401,
            msg: Message.insufficientBalance_message
        }
    }
}

class UnplannedDatetimes implements ErrorObj {
    getErrorObj(): { status: number,  msg: string } {
        return {
            status: 400,
            msg: Message.unplannedDatetimes_message
        }
    }
}

class Rejected_request implements ErrorObj {
    getErrorObj(): { status: number,  msg: string } {
        return {
            status: 400,
            msg: Message.rejectedRequest_message
        }
    }
}

class OnlyOneBooking implements ErrorObj {
    getErrorObj(): { status: number,  msg: string } {
        return {
            status: 400,
            msg: Message.onlyOneBooking_message
        }
    }
}

class EdgesNotExist implements ErrorObj {
    getErrorObj(): { status: number,  msg: string } {
        return {
            status: 400,
            msg: Message.edgesNotExist_message
        }
    }
}


export enum ErrorEnum {
    MissingToken,
    InvalidToken,
    RouteNotFound,
    NoAuthHeader,
    NoPayloadHeader,
    MalformedPayload,
    DuplicateDatetimes,
    UserNotFound,
    ModelNotFound,
    InsufficientBalance,
    UnplannedDatetimes,
    AlreadyBookedDatetime,
    AlreadyBookedEvent,
    OnlyOneBooking,
    BadRequest,
    Unauthorized,
    Forbidden,
    NotFound,
    InternalServer,
    ServiceUnavailable,
    InvalidData,
    StatusModel,
    InvalidDateFormat,
    Rejected_request,
    EdgesNotExist,
}


/**
 * Funzione 'getError'
 * 
 * Funzione che viene invocata dagli strati middleware del servizio nel caso in cui non vengano
 * rispettate alcune condizioni di validità della richiesta HTTP o dello stato del sistema.
 *
 * @param type Il tipo di eccezione sollevata dai middleware
 * @returns Un oggetto diverso dell'interfaccia {@link ErrorObj} a seconda del parametro in input
 */
export function getError(type: ErrorEnum): ErrorObj{
    let retval: ErrorObj;
    switch (type){
        case ErrorEnum.OnlyOneBooking:
            retval = new OnlyOneBooking();
            break;
        case ErrorEnum.UnplannedDatetimes:
            retval = new UnplannedDatetimes();
            break;
        case ErrorEnum.InsufficientBalance:
            retval = new InsufficientBalance();
            break;
        case ErrorEnum.ModelNotFound:
            retval = new ModelNotFound();
            break;
            case ErrorEnum.InvalidDateFormat:
            retval = new InvalidDateFormat();
            break;
        case ErrorEnum.UserNotFound:
            retval = new UserNotFound();
            break;
        case ErrorEnum.StatusModel:
            retval = new StatusModel();
            break;
        case ErrorEnum.DuplicateDatetimes:
            retval = new DuplicateDatetimes();
            break;
        case ErrorEnum.RouteNotFound:
            retval = new RouteNotFound();
            break;
        case ErrorEnum.InvalidToken:
            retval = new InvalidToken();
            break;
        case ErrorEnum.MissingToken:
            retval = new MissingToken();
            break;
        case ErrorEnum.NoAuthHeader:
            retval = new NoAuthHeaderError();
            break;
        case ErrorEnum.NoPayloadHeader:
            retval = new NoPayloadHeaderError();
            break;
        case ErrorEnum.MalformedPayload:
            retval = new MalformedPayloadError();
            break;            
        case ErrorEnum.Unauthorized:
            retval = new UnauthorizedError();
            break;
        case ErrorEnum.Forbidden:
            retval = new ForbiddenError();
            break;
        case ErrorEnum.NotFound:
            retval = new NotFoundError();
            break;
        case ErrorEnum.InternalServer:
            retval = new InternalServerError();
            break;
        case ErrorEnum.ServiceUnavailable:
            retval = new ServiceUnavailableError();
            break;
        case ErrorEnum.Rejected_request:
            retval = new Rejected_request();
            break;
        case ErrorEnum.BadRequest:
            retval = new BadRequest();
            break;   
        case ErrorEnum.EdgesNotExist:
            retval = new EdgesNotExist();
            break;   
    }
    return retval;
}

