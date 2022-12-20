module.exports = {
	OK: 200, //                          * Normal
	CREATED: 201, //                     * Create new entity
	UPDATED: 200, //                     * PUT/PATCH Requests
	DELETED: 204, //                     * DELETE requests
	BAD_REQUEST: 400, //                 * A bad request
	UNAUTHORIZED: 401, //                * JWT Invalid or Refresh token invalid
	FORBIDDEN: 403, //                   * No permission access
	NOT_FOUND: 404, //                   * Endpoint not found
	DUPLICATED_ENTRY: 412, //            * Duplication in input (record/value)
	VALIDATION_ERROR: 418, //            * Input validation error (body/query/params) using express-sanitizer
	INVALID_OPERATION: 419, //           * Trying to do something when the current state doesn't allow it (ex: terminate a terminated alarm)
	ITEM_NOT_FOUND: 477, //              * Endpoint found but the requested resource isn't found
	INTERNAL_SERVER_ERROR: 500, //       ! Server error
	SERVICE_UNAVAILABLE: 503, //		 * Request can not be served right now
};
