import { Request, Response } from "express";
import * as request from 'request';
import * as config from 'config';

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req: Request, res: Response, next: Function) {
  request.get({ url: config.get<string>("dataApi") + "/data/categories" },
    (err, catRes, categories) => {
      request.get({ url: config.get<string>("dataApi") + "/data/flowers" },
        (err, flowerRes, flowerList) => {
          let data = { categories: JSON.parse(categories), flowerList: JSON.parse(flowerList) }
          res.render('index', data)
        })
    })
});

router.get('/checkout', function (req: Request, res: Response, next: Function) {
  request.get({ url: config.get<string>("dataApi") + "/data/categories" },
    (err, catRes, categories) => {
      request.get({ url: config.get<string>("dataApi") + "/data/flowers" },
        (err, flowerRes, flowerList) => {
          let data = { categories: JSON.parse(categories), flowerList: JSON.parse(flowerList), checkout:true }
          res.render('index', data)
        })
    })
});

router.get('/category/:catName', function (req: Request, res: Response, next: Function) {
  request.get({ url: config.get<string>("dataApi") + "/data/categories" },
    (err, catRes, categories) => {
      request.get({ url: config.get<string>("dataApi") + "/data/flowers/" + req.params['catName'] },
        (err, flowerRes, flowerList) => {
          let data = { categories: JSON.parse(categories), flowerList: JSON.parse(flowerList) }
          const activeCategory = data.categories.find(c => c.Name === req.params['catName']);
          if (activeCategory) activeCategory.Selected = 'active'
          res.render('index', data)
        })
    })
});



module.exports = router;
