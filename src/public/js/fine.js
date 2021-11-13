function search(){
    var option = $("#search-book-option").val();
    var key = $("#search_book_string").val();
    $("table#readers_table tbody tr").each(
        function(){
            if(key=="")
                $(this).removeClass("d-none")
            else{
                if(option=="tatCa")
                {
                    if($(this).attr("maDocGia").toLocaleLowerCase()== key.toLocaleLowerCase()
                        ||$(this).attr("email").toLocaleLowerCase()== key.toLocaleLowerCase()
                        ||$(this).attr("hoTen").toLocaleLowerCase()== key.toLocaleLowerCase())
                    {
                        $(this).removeClass("d-none")
                    }
                    else
                        $(this).addClass("d-none")
                    
                }
                else if($(this).attr(option).toLocaleLowerCase()== key.toLocaleLowerCase()){
                    $(this).removeClass("d-none")
                }
                else{
                    $(this).addClass("d-none")
                }
            }
                
        }
    )
}


function payFine(readerJson){
    var reader = JSON.parse(readerJson)
    $("input#id").val(reader._id);
    $("input#email").val(reader.email);
    $("input#ho_ten").val(reader.ho_ten);
    $("input#tien_no").val(reader.tien_no);
    $("input#tien_thanh_toan").val(0);
    $("input#tien_thanh_toan").attr("max", reader.tien_no)
    $("input#con_lai").val(reader.tien_no)
}



function changePayMoney(event){
    var tienNo = $("input#tien_no").val();
    var thanhToan = $("input#tien_thanh_toan").val();
    $("input#con_lai").val(tienNo - thanhToan)
    
}

function submit(){
    var maDocGia = $("input#id").val();
    var tienNo = $("input#tien_no").val();
    var thanhToan = $("input#tien_thanh_toan").val();
    var ngayThu = $("input#ngay_thanh_toan").val();

    if(isNaN(parseFloat(thanhToan))||parseFloat(thanhToan)<=0 ) {
        $("#alert_container").append(
            `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                <strong>Số tiền thanh toán phải lơn hơn 0đ!</strong>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`
        )
        return;
    }
    else if(tienNo - thanhToan < 0){
        $("#alert_container").append(
            `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                <strong>Số tiền thanh toán không được vượt quá số tiền nợ!</strong>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`
        )
        return ;
    }else{
        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: "/librarian/fine",
            data: JSON.stringify({maDocGia, thanhToan, ngayThu }),
            dataType: 'json',
            cache: false,
            success: function (result) {
                $("#alert_container").append(
                    `<div class="alert alert-${result.success?'success':'danger'} alert-dismissible fade show " role="alert">
                        <strong>Thanh toán thành công!</strong>
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                     </div>`
                )

               if(result.success)
                    $(`table tbody td#tien_no_${maDocGia}`).html(Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(result.noMoi))


            },
            error: function (e) {
                console.log(e)
                $("#alert_container").append(
                    `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                        <strong>Thanh toán không thành công!</strong>
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>`
                 )
            }
        });
    }
}