window.onload = function(){
  const params = new URLSearchParams(window.location.search)
  if(params.get('message')){
    let messageToast = document.getElementById('message-toast')
    var toast = new bootstrap.Toast(messageToast)
    changeToast({
      type: params.get('type'),
      message: params.get('message')
    })
    toast.show()
  }
}
function changeToast(data){
  clearToastIcons()
  showToastIcon(data.type)
  changeToastTitle(data.type)
  changeToastContent(data.message)
}
function clearToastIcons(){
  let icons = document.querySelectorAll('#message-toast .header .icon i')
  for(let i = 0; i<icons.length; i++){
    icons[i].style.display = "none"
  }
}
function showToastIcon(type){
  let icon = document.querySelector(`#message-toast .header .icon .${type}`)
  icon.style.display = "block"
}
function changeToastTitle(type){
  let toastTypeData = getToastTypeData(type)

  let toastTitle = document.querySelector('#message-toast .header .title')
  toastTitle.style.color = toastTypeData.color
  let toastTypeText = toastTitle.querySelector('strong')
  toastTypeText.innerText = toastTypeData.text
  let toastHeader = document.querySelector('#message-toast .header')
  toastHeader.style['border-top']= `3px solid ${toastTypeData.color}`
}
function changeToastContent(message){
  let toastBody = document.querySelector('#message-toast .toast-body')
  toastBody.innerText = message
}
function getToastTypeData(type){
  let toastTypeData = {
    success: {
      color: 'var(--green-primary)',
      text: 'Thành công'
    },
    error: {
      color: 'var(--red-primary)',
      text: 'Thất bại'
    },
    warning: {
      color: 'var(--orange-primary)',
      text: 'Cảnh báo'
    },
    info: {
      color: 'var(--blue-primary)',
      text: 'Thông báo'
    },
  }
  return toastTypeData[type]
}
