
const socket = io('http://localhost:3000/');     
socket.on('reader-new-notification', (notification) => {
  loadNotifications()
});
window.onload = function(){
  loadNotifications()
}
function loadNotifications(){
  let notificationCanvas = document.querySelector('#notification-canvas .offcanvas-body')
  notificationCanvas.innerHTML = ""
  // clear notifications
  fetch('http://localhost:3000/reader/api/notification')
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
function addNotificationFromData(notPanel, data){
  data.notifications.map(notification => {
    let notificationItem = createNotificationItem(notification)
    notPanel.appendChild(notificationItem)
  })
}

function createNotificationItem(notification){
  let item = createItem('a', 'wrapper-link')
  item.href = '/reader/borrow-cards'
  let notificationWrapper = document.createElement('div')
  let notIcon = getNotIconImg(notification.tieu_de)

  notificationWrapper.innerHTML=`
    <div class="notification">
      <div class="img-wrapper">
        <div class="img-con">
          ${notIcon}
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
function getTimeString(date){
  let utcDate = new Date(date)
  return utcDate.toUTCString()
}
function getNotIconImg(title){
  if(title == 'Đăng ký thành công') return '<img src="/public/assets/images/register/accepted.png" alt=""></img>'
  else if(title == 'Đăng ký thất bại') return '<img src="/public/assets/images/register/rejected.png" alt=""></img>'
}
function createItem(tagName, className, inner){
  let item = document.createElement(tagName)
  if(className) item.classList.add(className)
  if(inner) item.innerHTML = inner
  return item
}
$('#notification-btn').on("click", (function(){
  $.post('/reader/api/notification', {
    newNot: true
  })
  $(this).css('background-color', 'var(--primary)')
}))