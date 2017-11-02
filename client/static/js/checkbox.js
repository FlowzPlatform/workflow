var ids= []
var name = []
var value = []
var element = []
$('checkbox').each(function () {
  ids.push(this.id)
})

var html = $("#form").find(".checkbox").html()

$("#form").find(".checkbox").html()
//   $("#form").find('#'+ids[i]).append('<label><input type="checkbox" id="checkbox1" value="' + value + '" name="'+ name + '[0]"/>' + value + '</label><br>')

$('input[name="checkbox1"]').each(function () {
  element.push(this)
})
for (var i = 0; i < ids.length; i++) {
  name.push($('#' + ids[i]).attr('name'))
  value.push($('#' + ids[i]).attr('value'))
}
for(var j=0;j<element.length;j++){
  for(var m=0; m < value.length; m++){
    if(j==m){
      element[j].value = value[m]
      element[j].setAttribute('name', name[m] + "[0]")
    }
  }
}

var checkbox_values = $('input[id="checkbox1"]').map(function(){
  return this.name;
}).get();
localStorage.setItem("checkbox_values",JSON.stringify(checkbox_values))
