
function confirmRegister(){
  let bookHeadsInput = document.getElementById('register-selected-book-heads-input')
  let bookHeadsString = JSON.stringify(getBookHeads())
  bookHeadsInput.value = bookHeadsString

  console.log("reader not")
  // notification
  let msg = "abc"
  let data = {
    date: Date.now(),
    content: msg
  }
  if(msg.trim() !== '') {
    socket.emit("send-notification", JSON.stringify(data));
  }
}

function confirmDelete(){
  let bookHeadsInput = document.getElementById('delete-selected-book-heads-input')
  let bookHeadsString = JSON.stringify(getBookHeads())
  bookHeadsInput.value = bookHeadsString
}
function getBookHeads(){
  let bookHeads = []
  let selectBookHeadCbs = document.querySelectorAll('.cb-select-book-head')
  for(let i = 0 ;i< selectBookHeadCbs.length; i++){
    let checkbox = selectBookHeadCbs[i]
    if(checkbox.checked) bookHeads.push(checkbox.value)
  }
  return bookHeads
}

var selectAll = (function(){
  var selected = false;
  return function(){
    let selectBookHeadCbs = document.querySelectorAll('.cb-select-book-head')
    if(!selected){
      changeCheckBoxesState(selectBookHeadCbs, true)
      selected = true;
    }else{
      changeCheckBoxesState(selectBookHeadCbs, false)
      selected = false;
    }
  }
})()
function changeCheckBoxesState(checkboxes, state){
  for(let i = 0; i<checkboxes.length; i++){
    checkboxes[i].checked = state;
  }
}