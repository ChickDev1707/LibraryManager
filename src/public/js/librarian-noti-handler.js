const socket = io('http://localhost:3000/');     
socket.on('librarian-new-notification', (notification) => {
  loadNotifications()
});
window.onload = function(){
  loadNotifications()
}
function loadNotifications(){
  let notificationCanvas = document.querySelector('#notification-canvas .offcanvas-body')
  notificationCanvas.innerHTML = ""
  // clear notifications
  fetch('http://localhost:3000/librarian/api/notification')
    .then(data => {
      return data.json()
    })
    .then(json => {
      if(json.notifications.length == 0){
        let emptyNotificationPanel = createEmptyNotificationPanel()
        notificationCanvas.appendChild(emptyNotificationPanel)
      }else{
        addNotificationFromData(notificationCanvas, json)
        if(json.newNot) $("#notification-btn").css('background-color', 'var(--new-not-color)')
      }
    })
  // has new not
}
function createEmptyNotificationPanel(){
  let inner = 
  ` <img src='/public/assets/images/no-notifications.png' alt='...'/>
    <h4>Không có thông báo<h4/>
    <p>Bạn sẽ thấy các thông báo về tác vụ quản lý hiển thị ở đây.</p>
  `
  return createItem('div', 'empty-notification-panel', inner)

}
function addNotificationFromData(notificationCanvas, data){
  data.notifications.map(notification => {
    let notificationItem = createNotificationItem(notification)
    notificationCanvas.appendChild(notificationItem)
  })
}

function createNotificationItem(notification){
  let item = createItem('a', 'wrapper-link')
  item.href = '/librarian/confirm-register-borrow'
  let notificationWrapper = document.createElement('div')
  
  notificationWrapper.innerHTML=`
    <div class="notification">
      <div class="img-wrapper">
        <div class="img-con">
          <img src="/public/assets/images/register/comment.png" alt="">
        </div>
      </div>
      <div class="content-con">
        <p class="title">${notification.tieu_de}</p>
        <p class="hide-overflow-text">${notification.noi_dung}</p>
        <small>${getTimeString(notification.ngay)}</small>
      </div>
    </div>
  `
  item.appendChild(notificationWrapper)
  return item
}
function createItem(tagName, className, inner){
  let item = document.createElement(tagName)
  if(className) item.classList.add(className)
  if(inner) item.innerHTML = inner
  return item
}
$('#notification-btn').on("click", (function(){
  $.post('/librarian/api/notification', {
    newNot: true
  })
  $(this).css('background-color', 'var(--primary)')
}))
function getTimeString(date){
  let utcDate = new Date(date)
  return utcDate.toUTCString()
}