var html2 = '<div class="exercise">';
var name = $("#form").find("#custom_input").attr('name');
var placeholder = $("#form").find("#custom_input").attr('placeholder');
var type = $("#form").find("#custom_input").attr('type');
var required = $("#form").find("#custom_input").attr('required');
var click = 0

var values = [];
var values_first = []
var textarea_values = []
var textarea_values_first = []
var def_html
var k=1
var p=1
var x=1
var y=1
var q=1
let n=1
let z=1
var itemsThatHasIdDuplicate_first = []
var DuplicateTextarea_first = []
var itemsThatHasIdDuplicate_first_default = []




values_default = $('input[id="custom_input_default"]').map(function(){
   return this.name;
}).get();

values_first_default = $('input[id="custom_input_default"]').map(function(){
   return this.name;
}).get();

for(var i=0;i<values_first_default.length;i++){
      values_first_default[i] = values_first_default[i] + "[0]"
}

itemsThatHasIdDuplicate_first_default = $('input[id="custom_input_default"]').filter(function () {
     return $('[id="' + this.id + '"]').length > 0;
});

for(var j=0;j<itemsThatHasIdDuplicate_first_default.length;j++){
   for(var m=0; m < values_first_default.length; m++){
     if(j==m){
     itemsThatHasIdDuplicate_first_default[j].name = values_first_default[m]
     }
   }
}

localStorage.setItem("input_names_default",JSON.stringify(values_first_default))



values = $('input[id="custom_input"]').map(function(){
   return this.name;
}).get();

values_first = $('input[id="custom_input"]').map(function(){
   return this.name;
}).get();

textarea_values = $('textarea[id="custom_textarea"]').map(function(){
   return this.name;
}).get();

textarea_values_first = $('textarea[id="custom_textarea"]').map(function(){
   return this.name;
}).get();



//for input fields
for(var i=0;i<values_first.length;i++){
      values_first[i] = values_first[i] + "[0]"
}

itemsThatHasIdDuplicate_first = $('input[id="custom_input"]').filter(function () {
     return $('[id="' + this.id + '"]').length > 0;
});


for(var j=0;j<itemsThatHasIdDuplicate_first.length;j++){
   for(var m=0;m < values_first.length;m++){
     if(j==m){
     itemsThatHasIdDuplicate_first[j].name = values_first[m]
     }
   }
}

localStorage.setItem("input_names",JSON.stringify(values_first))

//for textarea fields
for(var i=0;i<textarea_values_first.length;i++){
      textarea_values_first[i] = textarea_values_first[i] + "[0]"
}

DuplicateTextarea_first = $('textarea[id="custom_textarea"]').filter(function () {
     return $('[id="' + this.id + '"]').length > 0;
});

for(var j=0;j<DuplicateTextarea_first.length;j++){
   for(var m=0;m < textarea_values_first.length;m++){
     if(j==m){
     DuplicateTextarea_first[j].name = textarea_values_first[m]
     }
   }
}


localStorage.setItem("textarea_names",JSON.stringify(textarea_values_first))

$('#add_exercise').on('click', function() {

var radio_values = JSON.parse(localStorage.getItem("radio_values"))

var checkbox_values = JSON.parse(localStorage.getItem("checkbox_values"))

var select_values = JSON.parse(localStorage.getItem("select_values"))

if(click == 0){
  def_html = $("#exercises").html()
  localStorage.removeItem("new_html");
}
else{
  def_html = localStorage.getItem("new_html")
}
click++
let html_ = $( "#form" ).html();
let check = html_.search(html2)

if(check == -1){
  html_ = def_html
}

$('#hello').append(html_);
let id = $('#form').find($("fieldset")).attr("id")
new_id = id + n
n++
$("#hello").find($("fieldset:last-child")).attr("id",new_id);

//Replacing names of input fields with new names

 var itemsThatHasIdDuplicate = []
 values = JSON.parse(localStorage.getItem("input_names"))

for(var i=0;i<values.length;i++){
  var val_to_replace = parseInt(values[i].match(/[0-9]+/)[0], 10)
  values[i] = values[i].replace(val_to_replace,k)
  //values[i] = values[i] + "[" + k + "]"
}
k++

itemsThatHasIdDuplicate = $("#" + new_id).find("#custom_input").filter(function () {
    return $('[id="' + this.id + '"]').length > 1;
});

for(var j=0;j<itemsThatHasIdDuplicate.length;j++){
   for(var m=0;m < values.length;m++){
     if(j==m){
     itemsThatHasIdDuplicate[j].name = values[m]
     }
   }
}

//Replacing names of textarea fields with new names

 var DuplicateTextarea = []
 textarea_values = JSON.parse(localStorage.getItem("textarea_names"))

for(var i=0;i<textarea_values.length;i++){
  var val_to_replace = parseInt(textarea_values[i].match(/[0-9]+/)[0], 10)
  textarea_values[i] = textarea_values[i].replace(val_to_replace,p)
  //values[i] = values[i] + "[" + k + "]"
}
p++

DuplicateTextarea = $("#" + new_id).find("#custom_textarea").filter(function () {
    return $('[id="' + this.id + '"]').length > 1;
});

for(var j=0;j<DuplicateTextarea.length;j++){
   for(var m=0;m < textarea_values.length;m++){
     if(j==m){
     DuplicateTextarea[j].name = textarea_values[m]
     }
   }
}

  //Replacing names of radiobuttons with new names

 var DuplicateRadio= []
for(var i=0;i<radio_values.length;i++){
  var val_to_replace = parseInt(radio_values[i].match(/[0-9]+/)[0], 10)
  radio_values[i] = radio_values[i].replace(val_to_replace,x)
}
x++

DuplicateRadio = $("#" + new_id).find("#radio1").filter(function () {
    return $('[id="' + this.id + '"]').length > 1;
});

for(var j=0;j<DuplicateRadio.length;j++){
   for(var m=0;m < radio_values.length;m++){
     if(j==m){
     DuplicateRadio[j].name = radio_values[m]
     }
   }
}

//Replacing names of checkboxes with new names

var DuplicateCheckbox= []
for(var i=0;i<checkbox_values.length;i++){
var val_to_replace = parseInt(checkbox_values[i].match(/[0-9]+/)[0], 10)
checkbox_values[i] = checkbox_values[i].replace(val_to_replace,y)
}
y++

DuplicateCheckbox = $("#" + new_id).find("#checkbox1").filter(function () {
  return $('[id="' + this.id + '"]').length > 1;
});

for(var j=0;j<DuplicateCheckbox.length;j++){
 for(var m=0;m < checkbox_values.length;m++){
   if(j==m){
   DuplicateCheckbox[j].name = checkbox_values[m]
   }
 }
}

//Replacing names of select with new names

var DuplicateSelect= []
for(var i=0;i<select_values.length;i++){
var val_to_replace = parseInt(select_values[i].match(/[0-9]+/)[0], 10)
select_values[i] = select_values[i].replace(val_to_replace,z)
}
z++

DuplicateSelect = $("#" + new_id).find("#select1").filter(function () {
  return $('[id="' + this.id + '"]').length > 1;
});

for(var j=0;j<DuplicateSelect.length;j++){
 for(var m=0;m < select_values.length;m++){
   if(j==m){
   DuplicateSelect[j].name = select_values[m]
   }
 }
}


//Default input

var itemsThatHasIdDuplicate_default = []
 values_default = JSON.parse(localStorage.getItem("input_names_default"))

for(var i=0;i<values_default.length;i++){
  var val_to_replace = parseInt(values_default[i].match(/[0-9]+/)[0], 10)
  values_default[i] = values_default[i].replace(val_to_replace,q)
  //values[i] = values[i] + "[" + k + "]"
}
q++

itemsThatHasIdDuplicate_default = $("#" + new_id).find("#custom_input_default").filter(function () {
    return $('[id="' + this.id + '"]').length > 1;
});

for(var j=0;j<itemsThatHasIdDuplicate_default.length;j++){
   for(var m=0;m < values_default.length;m++){
     if(j==m){
     itemsThatHasIdDuplicate_default[j].name = values_default[m]
     }
   }
}



localStorage.setItem("new_html",$("#" + new_id).html())
var new2 = localStorage.getItem("new_html")
return false; //prevent form submission
});

$('#hello').on('click', '.remove', function() {
let var1 = $(this).parent().remove();
return false; //prevent form submission
});

$('.exercise').on('click', '.remove', function() {
let var1 = $(this).parent().remove();
return false; //prevent form submission
});
