import { Observable } from "rxjs";
import { map } from "rxjs/operators";
// import parseUrl from "parseurl";
// import url from "url";

// console.log(url.parse("/hello/:world"));

import { createServer } from "http";

const createRequestObservable = request =>
  new Observable(observer => {
    let data = "";
    request.on("data", chunk => {
      data += chunk.toString();
    });

    request.on("end", () => {
      const context = {
        url: request.url,
        method: request.method,
        headers: request.headers,
        status: 200
      };
      const body = data.length > 0 ? JSON.parse(data) : undefined;
      if (body) {
        context.body = body;
      }

      observer.next(context);
      observer.complete();
    });

    request.on("error", err => {
      observer.error(err);
    });
  });

function setHeader(header, value) {
  return context =>
    context.pipe(
      map(ctx => {
        const { headers } = ctx;

        return {
          ...ctx,
          headers: {
            ...headers,
            [header]: value
          }
        };
      })
    );
}

function send(data) {
  return context => context.pipe(map(ctx => ({ ...ctx, data })));
}

function json(data) {
  return context => context.pipe();
}

const server = createServer((request, response) => {
  const request$ = createRequestObservable(request);

  request$.subscribe(ctx => console.log(ctx));

  response.end();
});

server.listen(3000);
