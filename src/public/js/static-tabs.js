
let navBtns = document.querySelectorAll('.tabs .nav-btn button')
navBtns[0].classList = 'nav-btn-active'

let navContentPanels = document.querySelectorAll('.tabs .nav-content .content')
for(let i = 0; i< navBtns.length; i++){
  let btn = navBtns[i]
  btn.addEventListener('click', function(e){
    let navIndex = Number(e.target.getAttribute('data-nav-index'))
    hideAllContentPanels(navContentPanels)
    navContentPanels[i].style.display = "block"

    changeBtnsActiveStatus(navBtns, i)
    // showActiveBtn(e.target)
  })
}
function hideAllContentPanels(panels){
  for(let i = 0; i< panels.length; i++){
    panels[i].style.display = "none"
  }
}
function changeBtnsActiveStatus(btns, selected){
  for(let i = 0; i< btns.length; i++){
    if(i == selected){
      btns[i].classList = 'nav-btn-active'

    }else{
      btns[i].classList = 'nav-btn-normal'
    }
  }
}