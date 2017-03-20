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

      router.use((req, res, next) => {
        let regResult

        if (!!req.cookies && !!req.cookies["fs_reg_result"]) regResult = (<any>req).cookies["fs_reg_result"]
        if (!regResult || regResult.showRegResult) regResult = {
          message: "",
          error: {},
          showRegisterButton: true,
          showRegResult: false,
          isError: false
        }
        req['reg_result'] = regResult
        console.log('#reg_result:')
        console.log(regResult)

        next()
      })

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
                let data, message
                if (error) {
                  logger.error(err)
                  data = { categories: [], flowerList: [] }
                } else {
                  data = { categories: JSON.parse(categories), flowerList: JSON.parse(flowerList) }
                }
                res.cookie('fs_reg_result', req['reg_result'])
                data = { ...data, shopName, ...req['reg_result'] }
                console.log("#Rendering index for /:")
                console.log({ ...data, flowerList: "{...}" })
                res.render('index', data)
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

      router.get('/registration', (req: Request, res: Response, next: Function) => {
        request.get({ url: `http://${endpoints.getServiceAddress(`localhost:3003`)}/data/categories`, timeout: 4000 },
          (err, catRes, categories) => {
            request.get({ url: `http://${endpoints.getServiceAddress(`localhost:3003`)}/data/flowers`, timeout: 4000 },
              (error, flowerRes, flowerList) => {
                let data
                if (err) {
                  logger.error(err)
                  data = { categories: [], flowerList: [], registration: true, shopName, ...req['reg_result'] }
                } else {
                  data = { categories: JSON.parse(categories), flowerList: JSON.parse(flowerList), registration: true, shopName, ...req['reg_result'] }
                }
                console.log("#Rendering index for /registration:")
                console.log({ ...data, flowerList: "{...}" })
                res.render('index', data)
              })
          })
      });

      router.get('/registrationresults', (req: Request, res: Response, next: Function) => {
        request.get({ url: `http://${endpoints.getServiceAddress(`localhost:3003`)}/data/categories`, timeout: 4000 },
          (err, catRes, categories) => {
            request.get({ url: `http://${endpoints.getServiceAddress(`localhost:3003`)}/data/flowers`, timeout: 4000 },
              (error, flowerRes, flowerList) => {
                let data
                if (err) {
                  logger.error(err)
                  data = { categories: [], flowerList: [], registration: true, shopName, ...req['reg_result'] }
                } else {
                  data = { categories: JSON.parse(categories), flowerList: JSON.parse(flowerList), registrationresults: true, shopName, ...req['reg_result'] }
                }
                console.log("#Rendering index for /registrationresults:")
                console.log({ ...data, flowerList: "{...}" })
                res.render('index', data)
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
<<<<<<< HEAD
=======
                  //data.categories = data.categories.map(c => { c.Name = c.Name + "_molinio"; return c })
>>>>>>> master
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
