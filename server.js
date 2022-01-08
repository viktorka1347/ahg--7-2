/* eslint-disable import/no-unresolved */
import { createServer } from 'http';
import Koa from 'koa';
import koaBody from 'koa-body';

import { join } from 'path';
import {
  existsSync, mkdirSync, readdirSync, unlinkSync,
} from 'fs';

import koaStatic from 'koa-static';

const images = [];

const fileDir = join(__dirname, '/public');
if (!existsSync(fileDir)) {
  mkdirSync(fileDir);
}

const app = new Koa();

app.use(koaStatic(fileDir));

app.use(
  koaBody({
    formidable: { uploadDir: fileDir },
    urlencoded: true,
    multipart: true,
  }),
);

app.use(async (ctx, next) => {
  const origin = ctx.request.get('Origin');

  if (!origin) {
    return next();
  }

  const headers = { 'Access-Control-Allow-Origin': '*' };

  if (ctx.request.method !== 'OPTIONS') {
    ctx.response.set({ ...headers });
    try {
      return next();
    } catch (e) {
      e.headers = { ...e.headers, ...headers };
      throw e;
    }
  }

  if (ctx.request.get('Access-Control-Request-Method')) {
    ctx.response.set({
      ...headers,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
    });
    if (ctx.request.get('Access-Control-Request-Headers')) {
      ctx.response.set(
        'Access-Control-Allow-Headers',
        ctx.request.get('Access-Control-Allow-Request-Headers'),
      );
    }
    ctx.response.status = 204;
  }

  return null;
});

app.use(async (ctx, next) => {
  if (ctx.request.method !== 'GET') {
    return next();
  }

  const { method } = ctx.request.query;

  switch (method) {
    case 'allImages':
      ctx.response.body = JSON.stringify(images);
      return null;

    default:
      ctx.response.status = 400;
      return null;
  }
});

app.use(async (ctx, next) => {
  if (ctx.request.method !== 'POST') {
    return next();
  }

  const { method, id } = ctx.request.body;

  let index;

  switch (method) {
    case 'addImages':
      index = images.length ? images[images.length - 1].id + 1 : 1;

      readdirSync(fileDir).forEach((fileName) => {
        if (images.findIndex(({ name }) => name === fileName) < 0) {
          images.push({
            id: index,
            name: fileName,
          });
        }
      });

      ctx.response.body = JSON.stringify(images);
      return null;

    case 'deleteImage':
      index = images.findIndex((image) => image.id === +id);

      if (index < 0) {
        ctx.response.status = 404;
        return null;
      }

      unlinkSync(`${fileDir}/${images[index].name}`);
      images.splice(index, 1);

      ctx.response.body = JSON.stringify(images);
      return null;

    default:
      ctx.response.status = 400;
      return null;
  }
});

app.use(async (ctx) => {
  ctx.response.status = 405;
});

const port = process.env.PORT || 7070;
createServer(app.callback()).listen(port);
