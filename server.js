'use strict';
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pg = require('pg');
const superagent = require('superagent');
const methodoverride = require('method-override');
const app = express();

const client = new pg.Client(process.env.DATABASE_URL);

const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(methodoverride('_method'));
app.use(express.static('./public'));
app.set('view engine', 'ejs');


app.get('/',getDigimons);

function getDigimons (req,res){
  const url = 'https://digimon-api.herokuapp.com/api/digimon';

  superagent.get(url).then((vals)=>{
    res.render('index',{digimons:vals.body});

  });
}

app.post('/favorite',addFavDigimon);

function addFavDigimon (req,res){
  const SQL = 'INSERT INTO digimons VALUES ($1,$2,$3);';
  const values =[req.body.name,req.body.img,req.body.level];
  console.log(req.body.name);
  console.log(req.body.img);
  
  
  client.query(SQL,values).then(vals =>{
    let digi = new Digimons(vals);
    console.log(digi);
    res.redirect('favorite',{favDigi:digi.row[0]});

  }).catch(err => errorHandler(err,req,res));

}


app.get('/favorite',showFav);

function showFav(req,res){
  const SQL = 'SELECT * FROM digimons;';

  client.query(SQL).then(vals=>{
    res.render('favorite',{favDigimons:vals.row[0]});

  });
}


app.get('/details/:digi_id:',showDigiInfo);

function showDigiInfo(req,res){
  const SQL = 'SELECT * FROM digimons WHERE id=$1;';
  const digiVal = [req.params.id];

  client.query(SQL,digiVal).then(val =>{
    res.render('detail',{digiInformation:val.row[0]});

  }).catch((err => errorHandler(err,req,res)));

}


function Digimons (data){
  this.name = data.name;
  this.img = data.img;
  this.level = data.level;

}


function errorHandler(error,req,res){
  res.status(404);

}

client.connect().then(()=>{

  app.listen(PORT,console.log(`running on ${PORT}`));

});




