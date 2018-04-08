// included globally in bin/www

let dictionary = {
    "unknown": {
        status: 500,
        code: -1,
        message: "An internal error occured"
    },
    "invalid_request": {
        status: 400,
        code: 100,
        message: "Invalid request"
    },
    "not_found": {
        status: 404,
        code: 101,
        message: "The resource was not found"
    },
    "user_not_found": {
        status: 404,
        code: 103,
        message: "User not found"
    },
    "unauthorized": {
        status: 401,
        code: 102,
        message: "You are not authorized to perform this action"
    },
    "login_failed": {
        status: 401,
        code: 103,
        message: "Login failed"
    },
    "session_expired": {
        status: 401,
        code: 104,
        message: "Session expired"
    },
    "forbidden": {
        status: 403,
        code: 105,
        message: "You cannot access this resource"
    },
    "email_taken": {
        status: 409,
        code: 110,
        message: "A user with this email address already exists"
    },
    "username_taken": {
        status: 409,
        code: 111,
        message: "A user with this username already exists"
    },
    "facebook_error": {
        status: 503,
        code: 150,
        message: "The Facebook API returned an error"
    },
    "facebook_permissions": {
        status: 400,
        code: 151,
        message: "The Facebook token hold insufficient permissions"
    },
    "pricing_modifiers_overlap": {
        status: 400,
        code: 220,
        message: "Pricing blocks should not overlap"
    },
    "wrong_file_extension": {
        status: 415,
        code: 221,
        message: "Wrong file extension"
    },
    "wrong_data_type": {
        status: 406,
        code: 222,
        message: "Bad imput format"
    },
    "update_failed": {
        status: 500,
        code: 223,
        message: "Update failed"
    }
}

module.exports = function (identifier, optionalMessage, optionalStatus) {
    let error;
    if (dictionary[identifier]) {
        error = dictionary[identifier]
    }
    else {
        error = dictionary["unknown"];
        error.message = identifier;
    }
    let message;
    if (optionalMessage) { message = error.message + ": " + optionalMessage; }
    else { message = error.message; }
    if (error.status !== undefined && optionalStatus != 0) { this.status = optionalStatus || error.status; }
    this.code = error.code;
    this.message = message;
}
