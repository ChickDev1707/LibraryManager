
const socket = io('http://localhost:3000/');
        
socket.on('new-notification', (data) => {
  let notification = JSON.parse(data)
  console.log(notification)
});
function createNotificationItem(notification){
  let item = document.createElement('div')
  let contentText = document.createElement('p')
  contentText.innerText = notification.content
  let dateText = document.createElement('p')
  dateText.innerText = notification.date
  item.appendChild(contentText)
  item.appendChild(dateText)
  return item
}