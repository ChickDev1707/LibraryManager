function addBook(event) {
  console.log(event);
  event.preventDefault();
  var form = event.target;
  var input = $(form).children("input");
  $.ajax({
    method: $(form).attr("method"),
    url: $(form).attr("action"),
    data: $(form).serialize(),
    timeout: 60000,
    success: function (result) {
      if (result.success) {
        const elementId = `#${$(input[0]).val()}_amount`;
        $(`#${$(input[0]).val()}_remove`).removeAttr("disabled");
        console.log($(`#${$(input[0]).val()}_remove`));
        $(elementId).text(parseInt($(elementId).text()) + 1);
      }
    },
    error: function (err) {
      const result = { success: false, message: "Thêm không thành công!" };
      showToast(result);
    },
  });
  return false;
}

function removeBook(event) {
  event.preventDefault();
  var form = event.target;
  var input = $(form).children("input[name='bookHeadId']");
  const elementId = `#${$(input[0]).val()}_amount`;
  const rowId = `#${$(input[0]).val()}_row`;
  if (parseInt($(elementId).text()) == 1) return false;
  $.ajax({
    method: "DELETE",
    url: $(form).attr("action"),
    data: $(form).serialize(),
    timeout: 60000,
    success: function (result) {
      if (result.success) {
        if (result.removed) {
          console.log(rowId);

          $(rowId).remove();
          console.log(result.removed);
        } else $(elementId).text(parseInt($(elementId).text()) - 1);
      }
    },
    error: function (err) {
      const result = { success: false, message: "Xóa không thành công!" };
      showToast(result);
    },
  });
  return false;
}

function showToast(result) {
  let messageToast = document.getElementById("message-toast");
  messageToast.parentElement.style.zIndex = 9999;
  messageToast.classList.remove("d-none");
  var toast = new bootstrap.Toast(messageToast);
  changeToast({
    type: result.success ? "success" : "error",
    message: result.message,
  });
  toast.show();
}

function confirmOrder() {
  let bookHeadsInput = document.getElementById(
    "register-selected-book-heads-input"
  );
  const bookHeads = getBookHeads();
  if (bookHeads.length == 0)
    showToast({ success: false, message: "Phải chọn ít nhất một quyển sách!" });
  let bookHeadsString = JSON.stringify(bookHeads);
  bookHeadsInput.value = bookHeadsString;
}

function getBookHeads() {
  let bookHeads = [];
  let selectBookHeadCbs = document.querySelectorAll(".cb-select-book-head");
  for (let i = 0; i < selectBookHeadCbs.length; i++) {
    let checkbox = selectBookHeadCbs[i];
    if (checkbox.checked) bookHeads.push(checkbox.value);
  }
  return bookHeads;
}

function selectAll() {
  $(".cb-select-book-head").prop("checked", true);
}
