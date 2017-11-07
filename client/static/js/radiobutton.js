var ids= []
var name = []
var value = []
var element = []
$('radiobutton').each(function () {
  ids.push(this.id)
})
var html = $("#form").find(".radiobutton").html()


$("#form").find(".radiobutton").html()
// $("#form").find('#'+ids[i]).append('<input type="radio" id="radio1" value="'+ value + '" name="'+ name + '[0]"/><label for="radio">' + value + '</label><br>')

$('input[name="radio1"]').each(function () {
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

var radio_values = $('input[id="radio1"]').map(function(){
  return this.name;
}).get();
localStorage.setItem("radio_values",JSON.stringify(radio_values))
