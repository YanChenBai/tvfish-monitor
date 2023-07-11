function getResponseBody(code, message, data = null) {
  return {
    code: code,
    data: data,
    message: message,
  };
}

module.exports = getResponseBody;
