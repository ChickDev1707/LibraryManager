
const socket = io('http://localhost:3000/');     
socket.on('reader-new-notification', (notification) => {
  loadNotifications()
});
window.onload = function(){
  loadNotifications()
}
function loadNotifications(){
  let notPanel = document.querySelector('#notificationPanel .offcanvas-body')
  notPanel.innerHTML = ""
  // clear notifications
  fetch('http://localhost:3000/reader/api/notification')
    .then(data => {
      return data.json()
    })
    .then(json => {
      if(json.notifications.length == 0){
        let noNotPanel = createNoNotificationPanel()
        notPanel.appendChild(noNotPanel)
      }else{
        addNotificationFromData(notPanel, json)
        if(json.newNot) $("#notification-btn").css('background-color', 'var(--new-not-color)')
      }
    })
  // has new not
}
function createNoNotificationPanel(){
  let inner = 
  ` <img src='/public/assets/images/no-notifications.png' alt='...'/>
    <h4>Không có thông báo<h4/>
    <p>Bạn sẽ thấy các thông báo về tác vụ quản lý hiển thị ở đây.</p>
  `
  return createItem('div', 'no-not-panel', inner)

}
function addNotificationFromData(notPanel, data){
  data.notifications.map(notification => {
    let notItem = createNotItem(notification)
    notPanel.appendChild(notItem)
  })
}

function createNotItem(notification){
  let item = createItem('a', 'not-item')
  item.href = '/reader/register-tickets'
  let noteWrapper = document.createElement('div')
  let notIcon = getNotIconImg(notification.tieu_de)

  noteWrapper.innerHTML=`
    <div class="title-wrapper">
      <div class="not-img">
        ${notIcon}
      </div>
      <span>${notification.tieu_de}</span>
    </div>
    <p class="content">${notification.noi_dung}</p>
    <p class="date">${getTimeString(notification.ngay)}</p>
  `
  item.appendChild(noteWrapper)
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