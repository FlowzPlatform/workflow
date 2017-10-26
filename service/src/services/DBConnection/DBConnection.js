// let async = require('asyncawait/async');
// let await = require('asyncawait/await');
// var axios = require('axios');
// var fs = require('fs');
// var path = require('path');
// var db = './db.json';
// var file = require(db);
// let dbapi;

// if (file.mongo.isdefault == 'true') {
//     console.log('***************inside mongo api****************');
//     dbapi = require('./mongoapi')
// } else if (file.rethink.isdefault == 'true') {
//     console.log('***************inside rethink api**************');
//     dbapi = require('./rethinkapi')
// } else if (file.elastic.isdefault == 'true') {
//   console.log('***************inside elastic api**************');
//   dbapi = require('./elasticapi')
// }

// var chokidar = require('chokidar');

// let readfile = async (function(){
//     fs.readFile(__dirname+ '/db.json', function (err, data) {
//         if (err) return console.log(err);
//         console.log('reading file' + data)
//         let check = JSON.parse(data)
//         if (check.mongo.isdefault == 'true') {
//             // console.log('***************inside mongo api****************');
//             dbapi = require('./mongoapi')
//             dbapi.choose();
//         } else if (check.rethink.isdefault == 'true') {
//             // console.log('***************inside rethink api**************');
//             dbapi = require('./rethinkapi')
//             dbapi.choose();
//         } else if (check.elastic.isdefault == 'true') {
//             // console.log('***************inside rethink api**************');
//             dbapi = require('./elasticapi')
//             dbapi.choose();
//         } 
//     });
// })
 
// // One-liner for current directory, ignores .dotfiles 
// chokidar.watch('.', {ignored: /(^|[\/\\])\../}).on('change',async (function(path) {
//   console.log('File', path, 'has been changed');
//   delete require.cache[require.resolve('../schema/schema.class')];
//   delete require.cache[require.resolve('../instance/instance.class')];
//   delete require.cache[require.resolve('./mongoapi')];
//   delete require.cache[require.resolve('./rethinkapi')];
//   delete require.cache[require.resolve('./elasticapi')];
//   await(readfile);
// }))
// //console.log(api.get())
// module.exports = dbapi;