function search() {
    var option = $("#search-book-option").val();
    var key = $("#search_book_string").val();
    $("table#readers_table tbody tr").each(
        function () {
            if (key == "")
                $(this).removeClass("d-none")
            else {
                if (option == "tatCa") {
                    if ($(this).attr("maDocGia").toLocaleLowerCase() == key.toLocaleLowerCase()
                        || $(this).attr("email").toLocaleLowerCase() == key.toLocaleLowerCase()
                        || $(this).attr("hoTen").toLocaleLowerCase() == key.toLocaleLowerCase()) {
                        $(this).removeClass("d-none")
                    }
                    else
                        $(this).addClass("d-none")

                }
                else if ($(this).attr(option).toLocaleLowerCase() == key.toLocaleLowerCase()) {
                    $(this).removeClass("d-none")
                }
                else {
                    $(this).addClass("d-none")
                }
            }

        }
    )
}

function refresh() {
    $("#search_book_string").val('');
    $("table#readers_table tbody tr").each(
        function () {
            $(this).removeClass("d-none")
        }
    )
}

function payFine(readerJson) {
    var reader = JSON.parse(readerJson)
    $("input#id").val(reader._id);
    $("input#email").val(reader.email);
    $("input#ho_ten").val(reader.ho_ten);
    $("input#tien_no").val(reader.tien_no);
    $("input#tien_thanh_toan").val(0);
    $("input#tien_thanh_toan").attr("max", reader.tien_no)
    $("input#con_lai").val(reader.tien_no)
}



function changePayMoney(event) {
    var tienNo = $("input#tien_no").val();
    var thanhToan = $("input#tien_thanh_toan").val();
    $("input#con_lai").val(tienNo - thanhToan)

}

function checkDate(dateString) {
    var q = new Date();
    var m = q.getMonth();
    var d = q.getDate();
    var y = q.getFullYear();

    var toDate = new Date(y, m, d)
    var date = new Date(dateString + " GMT+0700");
    return date <= toDate
}

function submit() {
    var maDocGia = $("input#id").val();
    var tienNo = $("input#tien_no").val();
    var thanhToan = $("input#tien_thanh_toan").val();
    var ngayThu = $("input#ngay_thanh_toan").val();

    if (isNaN(parseInt(thanhToan)) || parseInt(thanhToan) <= 0) {
        const result = { success: false, message: "Số tiền thanh toán phải lơn hơn 0đ!" };
        showToast(result)
        return;
    } else if (!checkDate(ngayThu)) {
        let messageToast = document.getElementById('message-toast')
        var toast = new bootstrap.Toast(messageToast)
        changeToast({
            type: "error",
            message: "Ngày thanh toán nợ không hợp lệ, vui lòng kiểm tra lại!"
        })
        toast.show();
        return;
    }
    else if (parseInt(tienNo) - parseInt(thanhToan) < 0) {
        const result = { success: false, message: "Số tiền thanh toán không được vượt quá số tiền nợ!" };
        showToast(result)
        return;
    } else {
        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: "/librarian/fine",
            data: JSON.stringify({ maDocGia, thanhToan, ngayThu }),
            dataType: 'json',
            cache: false,
            success: function (result) {

                if (result.success) {
                    $(`table tbody td#tien_no_${maDocGia}`).html(Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(result.noMoi))
                    $('#payModal').modal('hide');
                }

                showToast(result)
            },
            error: function (e) {
                const result = { success: false, message: "Thanh toán nợ không thành công!" };
                showToast(result)
            }
        });
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

$(document).ready(function () {
    $('#message-toast').on('hidden.bs.toast', function () {
        $('#message-toast').addClass('d-none')
    })
})