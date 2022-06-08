function changePayment(event) {
  var $box = $(event.target);
  if ($box.is(":checked")) {
    var group = "input:checkbox[name='" + $box.attr("name") + "']";
    $(group).prop("checked", false);
    $box.prop("checked", true);
  } else {
    $box.prop("checked", true);
  }
}

function updateAddress(event) {
  const value = event.target.value;
  const name = eve
  $("input#address").val(value);
}

$( document ).ready(function() {
    getProvinces();
});

function getProvinces(){
  $.ajax({
    method: "GET",
    url: `https://provinces.open-api.vn/api/`,
    timeout: 60000,
    success: function (res) {
      res.forEach(province => {
        const provinceValue = JSON.stringify({code: province.code, name: province.name})
         $('#province_select').append(`
          <option value='${provinceValue}' code="${province.code}">
            ${province.name}
          </option>`);
      });
    },
    error: function (err) {
      console.log(err);
    },
  });
}

function changeProvince(event){
  console.log(event.target.value)
  const province = JSON.parse(event.target.value)
  getDistrict(province.code);
  $("#text_province").val(province.name)
}

function getDistrict(provinceCode){
    $.ajax({
    method: "GET",
    url: `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`,
    timeout: 60000,
    success: function (res) {
      console.log(res)
      const districts = res.districts
      $('#district_select').empty()
      $('#district_select').append(`<option value='${-1}'>Quận/Huyện</option>`);
      districts.forEach(district => {
        const districtValue = JSON.stringify({code: district.code, name: district.name})
        $('#district_select').append(`
          <option value='${districtValue}'>
            ${district.name}
          </option>`);
      });
    },
    error: function (err) {
      console.log(err);
    },
  });
}

function changeDistrict(event){
  const district = JSON.parse(event.target.value)
  getWard(district.code);
  $("#text_district").val(district.name)
}

function getWard(districtCode){
  console.log(districtCode)
  $.ajax({
    method: "GET",
    url: `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`,
    timeout: 60000,
    success: function (res) {
      const wards = res.wards
      $('#ward_select').empty()
      $('#ward_select').append(`<option value='${-1}'>Xã/Phường</option>`);
      wards.forEach(ward => {
        const wardValue = JSON.stringify({code: ward.code, name: ward.name})
        $('#ward_select').append(`
          <option value='${wardValue}'>
            ${ward.name}
          </option>`);
      });
    },
    error: function (err) {
      console.log(err);
    },
  });
}

function changeWard(event){
  const ward = JSON.parse(event.target.value)
  $("#text_ward").val(ward.name)
}

function submitOrder(event){
  console.log(event)
  const ward = $("#text_ward").val()
  const district = $("#text_district").val()
  const province = $("#text_province").val()
  if(!ward || !district || !province){
    event.preventDefault();
    const result = { success: false, message: "Vui lòng điền đúng địa chỉ nhận hàng" }
    showToast(result)
  }  
}

function showToast(result) {
  let messageToast = document.getElementById('message-toast');
  messageToast.parentElement.style.zIndex = 9999;
  messageToast.classList.remove('d-none');
  var toast = new bootstrap.Toast(messageToast)
  changeToast({
    type: result.success ? "success" : "error",
    message: result.message
  })
  toast.show();
}