import { Request, Response } from "express";
import * as request from 'request';

import path = require('path');
import logger = require('morgan');
import bodyParser = require('body-parser');
import cookieParser = require('cookie-parser');
import express = require('express');

export default function Router() {
  return {
    async start({endpoints, app}) {

      app.set('views', path.join('./views'));
      app.set('view engine', 'hbs');

      app.use(logger('dev'));
      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({ extended: false }));
      app.use(cookieParser());
      app.use(express.static(path.join('./public')));

      const router = express.Router()



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
            request.get({ url: `http://${endpoints.getServiceAddress(`localhost:3003`)}/data/flowers`, timeout: 4000  },
              (error, flowerRes, flowerList) => {
                let data = { categories: JSON.parse(categories), flowerList: JSON.parse(flowerList) }
                res.render('index', data)
              })
          })
      });

      router.get('/checkout', (req: Request, res: Response, next: Function) => {
        request.get({ url: `http://${endpoints.getServiceAddress(`localhost:3003`)}/data/categories`, timeout: 4000  },
          (err, catRes, categories) => {
            request.get({ url: `http://${endpoints.getServiceAddress(`localhost:3003`)}/data/flowers`, timeout: 4000  },
              (error, flowerRes, flowerList) => {
                let data = { categories: JSON.parse(categories), flowerList: JSON.parse(flowerList), checkout:true }
                res.render('index', data)
              })
          })
      });

      router.get('/category/:catName', (req: Request, res: Response, next: Function) => {
        request.get({ url: `http://${endpoints.getServiceAddress(`localhost:3003`)}/data/categories`, timeout: 4000  },
          (err, catRes, categories) => {
            request.get({ url: `http://${endpoints.getServiceAddress(`localhost:3003`)}/data/flowers/` + req.params['catName'], timeout: 4000  },
              (error, flowerRes, flowerList) => {
                if (err) return console.log(err), res.status(500).json(err)
                let data = { categories: JSON.parse(categories), flowerList: JSON.parse(flowerList) }
                const activeCategory = data.categories.find(c => c.Name === req.params['catName']);
                if (activeCategory) activeCategory.Selected = 'active'
                res.render('index', data)
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


