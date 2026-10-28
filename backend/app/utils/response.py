from flask import jsonify


def api_success(data=None, message="Operation successful", status_code=200, **kwargs):
    """Standardized JSON success response."""
    payload = {
        "success": True,
        "message": message,
        "data": data if data is not None else {},
    }
    payload.update(kwargs)
    return jsonify(payload), status_code


def api_error(message="An error occurred", status_code=400, errors=None, **kwargs):
    """Standardized JSON error response."""
    payload = {
        "success": False,
        "message": message,
        "errors": errors if errors is not None else [],
    }
    payload.update(kwargs)
    return jsonify(payload), status_code
