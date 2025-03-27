const express=require('express');
const router=require.Router();
const admin=require('firebase-admin');
const auth=require('./auth').auth;
const servviceAccount=require('../service')