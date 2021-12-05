function searchBook(){
        var searchKey = $('#search_bar_input').val().toLocaleLowerCase().trim();
        $("table#all-book-table tbody tr").each(
                function(){

                if(searchKey=="")
                        $(this).removeClass("d-none")
                else{
                        var r = 0;
                        $(this).children().each(function(){
                                if($(this).html().toLocaleLowerCase() == searchKey){
                                        $(this).parent().removeClass('d-none')
                                        r=1;
                                }              
                        })
                        if(!r)
                                $(this).addClass('d-none')                        
                }}
        )
}

function refresh(){
        console.log('object');
        $('#search_bar_input').val('')
        $("table#all-book-table tbody tr").removeClass("d-none")
}

function tab(index, id){
        if(index == 1)
        {
                $(`#update_form_${id} #info-title`).removeClass("d-none")
                $(`#update_form_${id} #child-title`).addClass("d-none")
                $(`#update_form_${id} #btn-tab2`).attr('disabled', false)
                $(`#update_form_${id} #btn-tab1`).attr('disabled', true)
                $(`#update_form_${id} .info_tabs`).removeClass("d-none")
                $(`#update_form_${id} .child_tab`).addClass("d-none")
                $(`#edit_modal_${id} .input-field`).attr("disabled", true);
                $(`button#btn-edit-${id}`).removeClass('d-none');
                $(`#btn-cancel-edit-${id}`).addClass('d-none')
                $(`#btn-submit-${id}`).addClass("d-none");
        }
        else{
            $(`#update_form_${id} #info-title`).addClass("d-none")
            $(`#update_form_${id} #child-title`).removeClass("d-none")
            $(`#update_form_${id} #btn-tab2`).attr('disabled', true)
            $(`#update_form_${id} #btn-tab1`).attr('disabled', false)
            $(`#update_form_${id} .info_tabs`).addClass("d-none")
            $(`#update_form_${id} .child_tab`).removeClass("d-none")
            $(`#btn-edit-${id}`).addClass('d-none')
            $(`#btn-cancel-edit-${id}`).addClass('d-none')
        }
}

function editInfo(id){
        $(`#edit_modal_${id} .input-field`).attr("disabled", false);
        $(`button#btn-edit-${id}`).addClass('d-none');
        $(`#btn-cancel-edit-${id}`).removeClass('d-none')
        $(`#btn-submit-${id}`).removeClass("d-none");
}

function cancelEdit(id){
        $(`#edit_modal_${id} .input-field`).attr("disabled", true);
        $(`button#btn-edit-${id}`).removeClass('d-none');
        $(`#btn-cancel-edit-${id}`).addClass('d-none')
        $(`#btn-submit-${id}`).addClass("d-none");
        $(`#anh_bia-${id} .filepond--file-action-button.filepond--action-remove-item`).trigger( "click" );
}

$.fn.isValid = function(){
    return this[0].checkValidity()
}


$(document).ready(function(){
    $(".modal").on("hide.bs.modal", function(){
        var id = $(this).attr('id').slice(11);
        cancelEdit(id);
        tab(1, id);
    })
})


function submitEdit(event){
        event.preventDefault();
        var form = event.target;
        if(!$(form).isValid())
        {
                event.preventDefault();
                $(form).addClass("was-validated")
                return;
        }
        $.ajax({
                method: $(form).attr('method'),
                url: $(form).attr('action'),
                data: $(form).serialize(),
                timeout: 60000,
                success: function (result) {
                        if(result.success){
                                var book = result.book;
                                var ngay = new Date(book.ngay_nhap)
                                $(`tr#row_${result.book._id} td.name`).html(book.ten_dau_sach);
                                $(`tr#row_${result.book._id} td.date`).html(ngay.toLocaleDateString('en-GB'));
                                $(`tr#row_${result.book._id} td.category`).html(book.the_loai.ten_the_loai);
                                $(`tr#row_${result.book._id} td.tac_gia`).html(book.tac_gia);
                                $(`tr#row_${result.book._id} td.nha_xuat_ban`).html(book.nha_xuat_ban);       
                                $(`tr#row_${result.book._id} td.nam_xuat_ban`).html(book.nam_xuat_ban);
                                $(`tr#row_${result.book._id} td.price`).html(book.gia);
                                $(`tr#row_${result.book._id} td.quantity`).html(book.so_luong);
                                $(`tr#row_${result.book._id} td.tom_tat`).html(book.tom_tat);
                                
                                
                                var url = 'url(' + result.anh_bia + ')'  
                                $("button.filepond--file-action-button.filepond--action-remove-item").click()
                                setTimeout(()=>{                 
                                        $(".filepond--root .filepond--drop-label").css("background-image", url)
                                }, 1500)
                                cancelEdit(book._id)

                        }

                        console.log(result);
                        showToast(result)
                        
                },
                error: function (err) {
                        const result = {success: false, message: "Cập nhật không thành công!" }
                        showToast(result)
                }
        })
        return false;
}

function saveNewBook(event){
        event.preventDefault();
        var form = event.target;

        if(!$(form).isValid())
        {
                $(form).addClass("was-validated")
                const result = {success: false, message: "Vui lòng điển đủ thông tin!" }
                showToast(result)
                return;
        };

        $.ajax({
                method: $(form).attr('method'),
                url: $(form).attr('action'),
                data: $(form).serialize(),
                timeout: 60000,
                success: function (result) {
                        if(result.success){
                                window.location.href = result.redirect
                        }         
                        showToast(result)
                },
                error: function (e) {
                        const result = {success: false, message: "Thêm không thành công!"}
                        showToast(result)
                }
        })

        return false;
}

function deleteBook(id){
        var isConfirm = confirm("Bạn có chắc chắn muốn xoá sách!")
        if(!isConfirm)
                return;
        $.ajax({
                type: "DELETE",
                contentType: "application/json",
                url: `/librarian/books/${id}`,
                dataType: 'json',
                cache: false,
                timeout: 6000,
                success: function (result) {
                    if(result.success){
                        $(`tr#row_${id}`).remove();   
                    }

                    showToast(result)
                        
                },
                error: function (e) {
                        const result = {success: false, message: "Xoá không thành công!"}
                        showToast(result)
                }
        })
}

function deleteChild(childId, id){
        $.ajax({
                method: "DELETE",
                url: `/librarian/books/${id}/${childId}`,
                cache: false,
                contentType: false,
                processData: false,
                timeout: 6000,
                success: function (result) {
                        if(result.success){
                                var book = result.newBook;
                                $(`#edit_modal_${id} #so_luong`).val(book.so_luong);
                                $(`tr#row_${id} td.quantity`).html(book.so_luong);
                                $(`#edit_modal_${id} tr#row_child_${childId}`).remove();
                        }
                
                        showToast(result)
                        
                },
                error: function (e) {
                        const result = {success: false, message: "Xoá không thành công!"}
                        showToast(result)
                }
        })

        return false;
}

function addChildBook(id){
    var so_luong = $(`#child_insert_input_${id}`).val();
    if(so_luong < 1){
        $("#errorToast div div.toast-body").html("Số lượng thêm mới phải lớn hơn 0");
        var toast = new bootstrap.Toast(errorToast);
        toast.show();
        return ;
    }
    $.ajax({
        type:'POST',
        url:`/librarian/books/${id}`,
        data: {"so_luong": so_luong},
        dataType: 'json',
        timeout: 6000,
        success: function (result) {
                if(result.success){
                    var book = result.newBook;
                    $(`#edit_modal_${book._id} #so_luong`).val(book.so_luong);
                    $(`tr#row_${book._id} td.quantity`).html(book.so_luong);
                    var lastRow = $(`#child_insert_row_${book._id}`)
                    result.newChild.forEach(sach=>{
                        lastRow.before(`
                                <tr id="row_child_${sach._id}">
                                        <td>${sach._id}</td>
                                        <td class="text-align-center">${sach.tinh_trang ?"Khả dụng": "Đã mượn"}</td>
                                        <td>
                                        <button 
                                                type="button" class="icon-btn danger" 
                                                onclick="deleteChild('${sach._id }', '${book._id }')" 
                                        >
                                                <i class='fas fa-trash-alt'></i>       
                                        </button>
                                        </td>
                                </tr>`)
                    })     
                }

                showToast(result)
                
        },
        error: function (e) {
                const result = {success: false, message: "Thêm không thành công!"}
                showToast(result)
        }

    })
    return false;
}

$(document).ready(function(){
        $(".filepond--root").on("FilePond:addfile", function(e){
               var id = e.target.id.split('-')[1];
               editInfo(id)
        })

        $('#message-toast').on('hidden.bs.toast', function () {
                $('#message-toast').addClass('d-none')
        })
})

function ExportToExcel(type, fn, dl) {
       
        var dataTable = $("#all-book-table").clone().removeAttr('id');
        dataTable = $(dataTable);
        dataTable.attr('id', "table-data-export");
        dataTable.addClass('d-none');
        dataTable.find('th.change-col').remove();
        dataTable.find('td.change-col').remove();
        $(dataTable.find('td.date')).each(function() {
                $( this ).text(  $( this ).text().split('/').reverse().join('-'))
        });
        dataTable.appendTo('div.table-responsive');
        
      

        var elt = document.getElementById('table-data-export');
        var wb = XLSX.utils.table_to_book(elt, { sheet: "sheet1", cellDates:true ,dateNF:'yyyy-mm-dd'});
        dataTable.remove();
        return dl ?
        XLSX.write(wb, { bookType: type, bookSST: true, type: 'base64' }):
        XLSX.writeFile(wb, fn || ('Manage book.' + (type || 'xlsx')));
        
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