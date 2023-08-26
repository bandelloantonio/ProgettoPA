/**
 * File contente i messaggi da ritornare nel corpo della risposta.
*/

export const noAuthHeader_message: string = "Bad Request - No authorization header";
export const noPayoadHeader_message: string = "Bad Request - No JSON payload header";
export const missingToken_message: string = "Bad Request - Missing JWT Token";
export const invalidToken_message: string = "Forbidden - Invalid JWT Token";
export const malformedPayload_message: string = "Bad Request - Malformed payload";
export const routeNotFound_message: string = "Not Found - Route not found";
export const unauthorized_message: string = "ERROR - Unauthorized";
export const Forbidden_message: string = "ERROR - Forbidden";
export const notFound_message: string = "ERROR - Not found";
export const internalServerError_message: string = "ERROR - Internal server error";
export const serviceUnavailable_message: string = "ERROR - Service unavailable";
export const badRequest_message: string = "ERROR - Bad request";
export const errorEventClosed_message: string = "Forbidden - Event bookings are closed";
export const duplicateDatetimes_message: string = "Bad Request - Duplicate datetimes";
export const userNotFound_message: string = "Not Found - User not found";
export const eventNotFound_message: string = "Not Found - Event not found";
export const insufficientBalance_message: string = "Unauthorized - Insufficient token balance";
export const unplannedDatetimes_message: string = "Bad Request - Specified unplanned datetimes";
export const bookedEvent_message: string = "Forbidden - Couldn't delete an already booked event";
export const alreadyBookedDatetime_message: string = "Forbidden - Datetime already booked";
export const alreadyBookedEvent_message: string = "Forbidden - You already booked this event";
export const onlyOneBooking_message: string = "Bad Request - Too many preferences in payload";

/**
 * 
 * i messaggi delle varie classi 
 */
