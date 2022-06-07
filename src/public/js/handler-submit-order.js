function updateOrder(id, currentStatus, newStatus) {
  console.log(currentStatus);
  console.log(newStatus);
  $.ajax({
    method: "PUT",
    url: `order/${id}`,
    data: { current: currentStatus, new: newStatus },
    timeout: 60000,
    success: function (result) {
      $(`#row_${id}`).remove();
    },
    error: function (err) {
      console.log(err);
    },
  });
}
