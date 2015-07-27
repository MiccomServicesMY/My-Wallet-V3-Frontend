'use strict';

var Bitcoin = require('bitcoinjs-lib');
var Helpers = {};
Math.log2 = function(x) { return Math.log(x) / Math.LN2;};

Helpers.isString = function (str){
  return typeof str == 'string' || str instanceof String;
};
Helpers.isKey = function (bitcoinKey){
  return bitcoinKey instanceof Bitcoin.ECKey;
};
Helpers.isBitcoinAddress = function(candidate) {
  try {
    Bitcoin.Address.fromBase58Check(candidate);
    return true;
  }
  catch (e) { return false; };
};
Helpers.isBitcoinPrivateKey = function(candidate) {
  try {
    Bitcoin.ECKey.fromWIF(candidate);
    return true;
  }
  catch (e) { return false; };
};
Helpers.isAlphaNum = function (str){
  return /^[\-+,._\w\d\s]+$/.test(str);
};
Helpers.isHex = function (str){
// "F12a3" === "F12a3".match(/^[A-Fa-f0-9]+/)[0];
  return /^[A-Fa-f0-9]+$/.test(str);
};
Helpers.isNumber = function (num){
  return typeof num == 'number' && !isNaN(num);
};
Helpers.isNotNumber = function (num){
  return !Helpers.isNumber(num)
};
Helpers.isBoolean = function (value){
  return typeof(value) === "boolean";
};
Helpers.isValidLabel = function (text){
  return Helpers.isString(text);
};
Helpers.isInRange = function (val, min, max){
  return min <= val && val < max;
};
Helpers.add = function (x,y){
  return x + y;
};
// Return a memoized version of function f
Helpers.memoize = function (f){
  var cache = {};
  return function() {
    var key = arguments.length + Array.prototype.join.call(arguments, ",");
    if (key in cache) return cache[key];
    else return cache[key] = f.apply(this, arguments);
  };
};
// Return an async version of f that it will run after miliseconds
// no matter how many times you call the new function, it will run only once
Helpers.asyncOnce = function (f, milliseconds, before){
  var timer = null;
  return function() {
    before && before()
    if (timer) {
      clearTimeout(timer);
      timer = null;
    };
    var myArgs = arguments;
    timer = setTimeout(function(){f.apply(this, myArgs);}, milliseconds);
  };
};

// merges the properties of two objects
Helpers.merge = function (o, p) {
  var prop = undefined;
  for(prop in p) {
    if (o.hasOwnProperty[prop]) continue;
    o[prop] = p[prop];
  }
  return o;
};

Function.prototype.compose = function(g) {
     var fn = this;
     return function() {
         return fn.call(this, g.apply(this, arguments));
   };
};

////////////////////////////////////////////////////////////////////////////////
// password scorer
Helpers.scorePassword = function (password){

  if (!Helpers.isString(password)) {return 0};

  var patternsList = [
     [0.25, /^[\d\s]+$/]
    ,[0.25, /^[a-z\s]+\d$/]
    ,[0.25, /^[A-Z\s]+\d$/]
    ,[0.5, /^[a-zA-Z\s]+\d$/]
    ,[0.5, /^[a-z\s]+\d+$/]
    ,[0.25, /^[a-z\s]+$/]
    ,[0.25, /^[A-Z\s]+$/]
    ,[0.25, /^[A-Z][a-z\s]+$/]
    ,[0.25, /^[A-Z][a-z\s]+\d$/]
    ,[0.5, /^[A-Z][a-z\s]+\d+$/]
    ,[0.25, /^[a-z\s]+[._!\- @*#]$/]
    ,[0.25, /^[A-Z\s]+[._!\- @*#]$/]
    ,[0.5, /^[a-zA-Z\s]+[._!\- @*#]$/]
    ,[0.25, /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+$/]
    ,[1, /^.*$/]
  ];

  var hasDigits = function(str) { return /[0-9]/.test(str);};
  var hasLowerCase = function(str) { return /[a-z]/.test(str);};
  var hasUpperCase = function(str) { return /[A-Z]/.test(str);};
  var hasPunctuation = function(str) { return /[-!$%^&*()_+|~=`{}\[\]:";'<>?@,.\/]/.test(str);};

  var base = function(str) {
    var tuples = [[10,hasDigits(str)],[26,hasLowerCase(str)],[26,hasUpperCase(str)],[31,hasPunctuation(str)]]
    var bases = tuples.filter(function(t){return t[1]}).map(function(t){return t[0]});
    var b = bases.reduce(Helpers.add, 0);
    var ret = b === 0 ? 1 : b;
    return ret;
  };

  var entropy = function (str) {
    return Math.log2(Math.pow(base(password),password.length));
  };

  var quality = function (str) {
    var pats = patternsList.filter(function(p){return p[1].test(str);}).map(function(p){return p[0]});
    return Math.min.apply(Math, pats);
  };

  var entropyWeighted = function(str) {
    return quality(str)*entropy(str);
  };

  return entropyWeighted(password);

};
////////////////////////////////////////////////////////////////////////////////


module.exports = Helpers;