export const handler = async (event) => {
  console.log("event ---> ", event);
  const url = new URL(event.rawPath, `http://${event.headers.host}`);

  url.protocol = "http:";
  url.hostname = "121.41.33.45";
  url.port = "31001";

  if (event.queryStringParameters) {
    Object.entries(event.queryStringParameters).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }
  console.log("Url ---> ", url);
  const httpMethod =
    event.httpMethod || event.requestContext.http.method || "UNKNOWN";
  const headers = {
    "content-type": "application/json",
  };

  console.log("Body ---> ", event.body);

  const response = await fetch(url.toString(), {
    method: httpMethod,
    headers: headers,
    body: event.body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Error response:", errorText);
    return {
      statusCode: response.status,
      body: JSON.stringify({ error: errorText }),
    };
  }

  return {
    statusCode: response.status,
    body: await response.json(),
  };
};
