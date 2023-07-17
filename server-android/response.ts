export default function getResponseBody(
  code: any,
  message: any,
  data: any = null,
) {
  return {
    code: code,
    data: data,
    message: message,
  };
}
