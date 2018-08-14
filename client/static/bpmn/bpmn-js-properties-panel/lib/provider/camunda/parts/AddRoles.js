'use strict';

let $ = require('jquery')
var entryFactory = require('../../../factory/EntryFactory'),
  cmdHelper = require('../../../helper/CmdHelper'),
  is = require('bpmn-js/lib/util/ModelUtil').is,
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;
let nameProps = require('../../bpmn/parts/NameProps');
  /**
   * Generate a form field specific textField using entryFactory.
   *
   * @param  {string} options.id
   * @param  {string} options.label
   * @param  {string} options.modelProperty
   * @param  {function} options.validate
   *
   * @return {Object} an entryFactory.textField object
   */
module.exports = function (group, element, translate, options) {
    // Get all roles
    let arr_roles = ["flow"]
    if(options.cdata){
      console.log('options.cdata: ', options.cdata)
      if(options.cdata.roles){
        let roles = options.cdata.roles.split(',')
        for (let index = 0; index < roles.length; index++) {
          arr_roles.push(roles[index])
        }

        // Get all process
        let process = []
        for (let index = 0; index < options.cdata.json.processList.length; index++) {
          if (options.cdata.json.processList[index].name != undefined) {
            process.push({ name:  options.cdata.json.processList[index].name, type: options.cdata.json.processList[index].type})
          }
        }

        console.log("arr_roles", arr_roles.length)
        console.log("process", process.length)
        //id : camunda-addRoles
        
        setTimeout(() => {
          let x = document.getElementById('camunda-addRoles')
          var t = document.createTextNode("This is a paragraph.");    // Create a text node

          let tab1 = null
          tab1 = document.getElementsByClassName('tab1')
          console.log('tab1tab1tab1tab1tab1tab1: ', tab1)

          if(tab1.length == 0){
            var div1 = document.createElement('div');
            var para1 = document.createElement('p');
            var table1 = document.createElement('table');
            table1.setAttribute('id', 'tab1');
            para1.appendChild(table1);
            div1.appendChild(para1);
            document.body.appendChild(div1);
            var p1 = ``;
            var d = new Date();

            for (var i = 0; i < arr_roles.length; i++) {
              p1 += `<th>` + arr_roles[i] + `</th>`
            }

            for (var i = 0; i < process.length; i++) {
              console.log('process: ', process[i].type)
              if(process[i].type !== 'start' || process[i].type !== 'endevent' || process[i].type !== 'intermediatethrowevent'){
                p1 += `<tr><td>` + process[i].name
                for (var j = 1; j < arr_roles.length; j++) {
                  p1 += `</td> <td>R: <input type="checkbox" id="` + process[i].type + `"><br /> W: <input type="checkbox" id="` + process[i].type + `"></td>`
                }
                p1 += `<tr>`
              }
            }

            
            
            
            $("<table class='tab1'>" + p1 + "</table></br>" + "<button style=\"margin-top: -55px; width:50px; left: 130px \" onclick='savePermission()'>save</button>").insertAfter(x);  

            $("#tab1").css({"border": "1px solid blue","border - collapse": "collapse"});
            $("th").css({ "border": "1px solid blue", "padding": "5px"});
            $("td").css({ "border": "1px solid blue", "padding": "5px", "text - align": "center"});
          }

          
          // let obj_save = {
          //   "roles" : arr_roles,
          //   "process" : process,
          //   "permission" : {
          //     //array store permission
          //   } 
          //   }
          // }
          // x.appendChild(t); 
        }, 1000);

        
        var bo = getBusinessObject(element);
        console.log({bo})
        if (!bo) {
          return;
        }

        if (is(element, 'bpmn:Process') || is(element, 'bpmn:Participant') && bo.get('processRef')) {
          var versionTagEntry = entryFactory.textField({
            id: 'addRoles',
            label: translate('Add Roles'),
            modelProperty: 'addedRoles'
          });
          group.entries.push(versionTagEntry);
        }
      } else {

        // let roles = options.cdata.roles.split(',')
        // for (let index = 0; index < roles.length; index++) {
        //   arr_roles.push(roles[index])
        // }

        // Get all process
        let process = []
        for (let index = 0; index < options.cdata.json.processList.length; index++) {
          if (options.cdata.json.processList[index].name != undefined) {
            process.push({ name:  options.cdata.json.processList[index].name, type: options.cdata.json.processList[index].type})
          }
        }

        console.log("arr_roles", arr_roles.length)
        console.log("process", process.length)
        //id : camunda-addRoles
        
        setTimeout(() => {
          let x = document.getElementById('camunda-addRoles')
          var t = document.createTextNode("This is a paragraph.");    // Create a text node

          let tab1 = null
          tab1 = document.getElementsByClassName('tab1')
          console.log('tab1tab1tab1tab1tab1tab1: ', tab1)

          if(tab1.length == 0){
            var div1 = document.createElement('div');
            var para1 = document.createElement('p');
            var table1 = document.createElement('table');
            table1.setAttribute('id', 'tab1');
            para1.appendChild(table1);
            div1.appendChild(para1);
            document.body.appendChild(div1);
            var p1 = ``;
            var d = new Date();

            for (var i = 0; i < arr_roles.length; i++) {
              p1 += `<th>` + arr_roles[i] + `</th>`
            }

            for (var i = 0; i < process.length; i++) {
              console.log('process: ', process[i].type)
              if(process[i].type !== 'start' || process[i].type !== 'endevent' || process[i].type !== 'intermediatethrowevent'){
                p1 += `<tr><td>` + process[i].name
                for (var j = 1; j < arr_roles.length; j++) {
                  p1 += `</td> <td>R: <input type="checkbox" id="` + process[i].type + `"><br /> W: <input type="checkbox" id="` + process[i].type + `"></td>`
                }
                p1 += `<tr>`
              }
            }

            
            
            
            $("<table class='tab1'>" + p1 + "</table></br>" + "<button style=\"margin-top: -55px; width:50px; left: 130px \" onclick='savePermission()'>save</button>").insertAfter(x);  

            $("#tab1").css({"border": "1px solid blue","border - collapse": "collapse"});
            $("th").css({ "border": "1px solid blue", "padding": "5px"});
            $("td").css({ "border": "1px solid blue", "padding": "5px", "text - align": "center"});
          }

          
          // let obj_save = {
          //   "roles" : arr_roles,
          //   "process" : process,
          //   "permission" : {
          //     //array store permission
          //   } 
          //   }
          // }
          // x.appendChild(t); 
        }, 1000);

        
        var bo = getBusinessObject(element);
        console.log({bo})
        if (!bo) {
          return;
        }

        if (is(element, 'bpmn:Process') || is(element, 'bpmn:Participant') && bo.get('processRef')) {
          var versionTagEntry = entryFactory.textField({
            id: 'addRoles',
            label: translate('Add Roles'),
            modelProperty: 'addedRoles'
          });
          group.entries.push(versionTagEntry);
        }
      }
    } else {

    }
    
};

