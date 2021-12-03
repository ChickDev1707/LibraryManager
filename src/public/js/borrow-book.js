
function deleteBook(id){
    $(`tr#dau_sach_${id}`).remove();
    $(`table#add_table button#add_${id}`).prop("disabled", false);
}

function submit(){
    var dau_sach = [];
    var ma_sach= [];
    $("#borrow_table tbody td.dau_sach").each(function() {
        dau_sach.push($(this).attr("value"))
    })

    $("#borrow_table tbody td.ma_sach").each(function() {
        ma_sach.push($(this).attr("value"))
    })

    if(dau_sach.length <=0 || ma_sach.length <=0)
    {  
        const result = { success: false, message:"Vui lòng chọn sách trước khi tạo phiếu!"   };
        showToast(result);
        return ;
    }

    var ma_doc_gia = $("#reader_id").val();
    if(ma_doc_gia == "")
    {
        const result = { success: false, message:"Vui lòng nhập thông tin độc giả để tạo phiếu!"  };
        showToast(result);
        return ;
    }

    var ngay_muon = $("#ngay_muon").val();
    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: "/librarian/borrow",
        data: JSON.stringify({dau_sach: dau_sach,ma_sach: ma_sach ,ma_doc_gia: ma_doc_gia, ngay_muon:ngay_muon}),
        dataType: 'json',
        cache: false,
        success: function (result) {
            $("table#result_table tbody").empty();
            result.nSuccess.map((item)=>{
                var row = `
                <tr>
                    <td scope="col">${item.ten_dau_sach}</td>
                    <td scope="col">${item.ma_sach}</td>
                    <td scope="col">Thành công</td>
                    <td scope="col">${item.message}</td>
                </tr>`

                $("table#result_table tbody").append(row)
                deleteBook(item.dau_sach)
            })

            result.nErrors.map((item)=>{
                var row = `
                <tr>
                    <td scope="col">${item.ten_dau_sach}</td>
                    <td scope="col">${item.ma_sach}</td>
                    <td scope="col">Không thành công</td>
                    <td scope="col">${item.message}</td>
                </tr>`

                $("table#result_table tbody").append(row)
                deleteBook(item.dau_sach)
            })

            $('#result_modal').modal('show')
        },
        error: function (e) {
            const result = { success: false, message:"Không thành công!"  };
            showToast(result);
        }
    });
}


function subConfirm(){
    var ids = []
    $("input.confirm_input:checked").each(function() {
        ids.push($(this).val())
    })

    if(ids.length == 0)
    {
        const result = { success: false, message:"Vui lòng chọn phiếu đăng ký cần xác nhận lấy sách!" };
        showToast(result);
        return ;
    }   

    var ngayMuon = $("#ngay_muon").val()
    $.ajax({
            type: "POST",
            contentType: "application/json",
            url: "/librarian/borrow/confirm",
            data: JSON.stringify({dsMaPhieu: ids, ngayMuon:ngayMuon}),
            dataType: 'json',
            cache: false,
            timeout: 60000,
            success: function (result) {
                console.log(result)
                if(result.nErrors==0 && result.nSuccess==0){
                    const result = { success: false, message: result.message };
                    showToast(result);
                    return ;
                }
                
                result.nSuccess.forEach(id => {
                    $(`input[value="${id}"].confirm_input`).prop('checked', false);
                    $(`input[value="${id}"].confirm_input`).prop('disabled', true);
                    $(`td.status#sts_${id}`).html("Đã nhận sách");
                    $(`td.date_borow#date_borow_${id}`).html(new Date(ngayMuon).toLocaleDateString('en-GB'));

                    
                });
               
                if(result.nSuccess.length > 0){
                    const result = { success: true, message: `Xác nhận thành công phiếu có mã:\n${result.nSuccess.join(',\n')}` };
                    showToast(result);
                }
                
                if(result.nErrors.length > 0){
                    const result = { success: false, message: `Xác nhận không thành công phiếu có mã:\n${result.nSuccess.join(',\n')}` };
                    showToast(result);
                }

               
               
                
            },
            error: function (e) {
                const result = { success: false, message: `Xác nhận không thành công!` };
                showToast(result);
                return ;
            }
        });
}

function addBorrowBook(event){
    event.preventDefault();
   
    var form = event.target;
    var formData = new FormData(form);
    var ma_sach = formData.get('ma_sach');
    var ma_doc_gia = formData.get('ma_doc_gia');

    if($(`td#ma_quyen_sach_${ma_sach}`).length > 0)
    {
        const result = { success: false, message: "Sách này đã được thêm!" };
        showToast(result);
        return false;
    }
    else{
        $.ajax({
            method:  "GET",
            url: $(form).attr('action'),
            data: {ma_sach: ma_sach, ma_doc_gia: ma_doc_gia},      
            timeout: 6000,
            success: function (result) {
                if(result.success){
                    var bookBorrow = result.book;
                    if($(`tr#dau_sach_${bookBorrow._id}`).length > 0)
                    {
                        const result = { success: false, message: "Đầu sách này đã được thêm!" }
                        showToast(result)
                        return false;
                    }else{
                        var content =  
                            `<tr id="dau_sach_${bookBorrow._id}">
                                <td class="align-middle">
                                    <img height="142" width="100" class="rounded" src="${bookBorrow.anh_bia}"/>
                                </td>
                                <td scope="col" class="align-middle text-wrap" >${bookBorrow.ten_dau_sach}</td>
                                <td scope="col" 
                                    class="align-middle text-wrap dau_sach" 
                                    value="${bookBorrow._id}" 
                                >${bookBorrow._id}</td>
                                <td scope="col" class="align-middle text-wrap ma_sach" 
                                    id="ma_quyen_sach_${bookBorrow.cac_quyen_sach[0]._id}"
                                    value="${bookBorrow.cac_quyen_sach[0]._id}"
                                >
                                    ${bookBorrow.cac_quyen_sach[0]._id}
                                </td>
                                <td scope="col" class="align-middle text-wrap" >${bookBorrow.gia}</td>
                                <td class="align-middle text-wrap">
                                    <button class="icon-button delete-button" onclick="deleteBook('${bookBorrow._id}')">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                </td> 
                            </tr>`

                        $("#row_add_button").before(content);
                    }
                   
                }
                showToast(result)
            },
            error: function (e) {
                const result = { success: false, message: "Thêm sách không thành công!" };
                showToast(result);
            }
        })

        return false;
    }
    
}


function showToast(result){
    let messageToast = document.getElementById('message-toast');
    messageToast.parentElement.style.zIndex = 9999;
    messageToast.classList.remove('d-none');
    var toast = new bootstrap.Toast(messageToast)
    changeToast({
            type: result.success?"success":"error",
            message: result.message 
    })
    toast.show();
}

$(document).ready(function(){
    $('#message-toast').on('hidden.bs.toast', function () {
            $('#message-toast').addClass('d-none')
    })
})