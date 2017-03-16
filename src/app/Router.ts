import { Request, Response } from "express";
import * as request from 'request';

import path = require('path');
import morgan = require('morgan');
import bodyParser = require('body-parser');
import cookieParser = require('cookie-parser');
import express = require('express');

export default function Router() {
  return {
    async start({ endpoints, app, logger }) {

      app.set('views', path.join('./views'));
      app.set('view engine', 'hbs');

      app.use(morgan('dev'));
      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({ extended: false }));
      app.use(cookieParser());
      app.use(express.static(path.join('./public')));

      const router = express.Router()

      const shopName = 'Flower Shop'

      if (app.get('env') === 'development') {
        app.use((err: any, req: Request, res: Response, next: Function) => {
          res.status(err.status || 500);
          res.render('error', {
            message: err.message,
            error: err,
          });
        });
      }

      app.use((err: any, req: Request, res: Response, next: Function) => {
        res.status(err.status || 500);
        res.render('error', {
          message: err.message,
          error: {},
        });
      });

      router.get('/', (req: Request, res: Response, next: Function) => {
        request.get({ url: `http://${endpoints.getServiceAddress(`localhost:3003`)}/data/categories`, timeout: 4000 },
          (err, catRes, categories) => {
            request.get({ url: `http://${endpoints.getServiceAddress(`localhost:3003`)}/data/flowers`, timeout: 4000 },
              (error, flowerRes, flowerList) => {
                try {
                  let data = { categories: JSON.parse(categories), flowerList: JSON.parse(flowerList), shopName }
                  //data.categories = data.categories.map(c => { c.Name = c.Name + "_molinio"; return c })
                  res.render('index', data)
                } catch (err) {
                  logger.error(err)
                  res.render('index', { categories: [], flowerList: [], shopName })
                }
              })
          })
      });

      router.get('/checkout', (req: Request, res: Response, next: Function) => {
        request.get({ url: `http://${endpoints.getServiceAddress(`localhost:3003`)}/data/categories`, timeout: 4000 },
          (err, catRes, categories) => {
            request.get({ url: `http://${endpoints.getServiceAddress(`localhost:3003`)}/data/flowers`, timeout: 4000 },
              (error, flowerRes, flowerList) => {
                try {
                  let data = { categories: JSON.parse(categories), flowerList: JSON.parse(flowerList), checkout: true, shopName }
                  res.render('index', data)
                } catch (err) {
                  logger.error(err)
                  res.render('index', { categories: [], flowerList: [], shopName })
                }
              })
          })
      });

      router.get('/category/:catName', (req: Request, res: Response, next: Function) => {
        request.get({ url: `http://${endpoints.getServiceAddress(`localhost:3003`)}/data/categories`, timeout: 4000 },
          (err, catRes, categories) => {
            request.get({ url: `http://${endpoints.getServiceAddress(`localhost:3003`)}/data/flowers/` + req.params['catName'], timeout: 4000 },
              (error, flowerRes, flowerList) => {
                if (err) return console.log(err), res.status(500).json(err)
                try {
                  let data = { categories: JSON.parse(categories), flowerList: JSON.parse(flowerList), shopName }
                  //data.categories = data.categories.map(c => { c.Name = c.Name + "_molinio"; return c })
                  const activeCategory = data.categories.find(c => c.Name === req.params['catName']);
                  if (activeCategory) activeCategory.Selected = 'active'
                  res.render('index', data)
                } catch (err) {
                  logger.error(err)
                  res.render('index', { categories: [], flowerList: [], shopName })
                }
              })
          })
      });

      app.use('/', router);

      app.use((req: Request, res: Response, next: Function) => {
        let err: any = new Error('Not Found');
        err.status = 404;
        next(err);
      });
    }
  }
}
