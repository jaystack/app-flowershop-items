import { Request, Response } from "express";
import * as request from 'request';
import * as config from 'config';
import { getServiceAddress } from 'system-endpoints';

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req: Request, res: Response, next: Function) {
  request.get({ url: `http://${getServiceAddress('localhost:3003')}/data/flowers`, timeout: 4000 },
    (err, catRes, categories) => {
      request.get({ url: getServiceAddress(config.get<string>("dataApi")) + "/data/flowers", timeout: 4000  },
        (err, flowerRes, flowerList) => {
          let data = { categories: JSON.parse(categories), flowerList: JSON.parse(flowerList) }
          res.render('index', data)
        })
    })
});

router.get('/checkout', function (req: Request, res: Response, next: Function) {
  request.get({ url: `http://${getServiceAddress('localhost:3003')}/data/flowers`, timeout: 4000  },
    (err, catRes, categories) => {
      request.get({ url: getServiceAddress(config.get<string>("dataApi")) + "/data/flowers", timeout: 4000  },
        (err, flowerRes, flowerList) => {
          let data = { categories: JSON.parse(categories), flowerList: JSON.parse(flowerList), checkout:true }
          res.render('index', data)
        })
    })
});

router.get('/category/:catName', function (req: Request, res: Response, next: Function) {
  request.get({ url: `http://${getServiceAddress('localhost:3003')}/data/flowers`, timeout: 4000  },
    (err, catRes, categories) => {
      request.get({ url: `http://${getServiceAddress('localhost:3003')}/data/flowers/` + req.params['catName'], timeout: 4000  },
        (err, flowerRes, flowerList) => {
          if(err) return console.log(err), res.status(500).json(err)
          let data = { categories: JSON.parse(categories), flowerList: JSON.parse(flowerList) }
          const activeCategory = data.categories.find(c => c.Name === req.params['catName']);
          if (activeCategory) activeCategory.Selected = 'active'
          res.render('index', data)
        })
    })
});



module.exports = router;
