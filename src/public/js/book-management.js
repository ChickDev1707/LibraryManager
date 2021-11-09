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
                                $("#alert_container").append(
                                        `<div class="alert alert-success  alert-dismissible fade show positon-relative" role="alert">
                                            <strong>${result.message}</strong>
                                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                        </div>`)
                        }else{
                                $("#alert_container").append(
                                        `<div class="alert alert-danger  alert-dismissible fade show positon-relative" role="alert">
                                            <strong>${result.message}</strong>
                                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                        </div>`
                                )
                        }
                        
                },
                error: function (e) {
                        $("#alert_container").append(
                                `<div class="alert alert-danger  alert-dismissible fade show positon-relative" role="alert">
                                    <strong>Xoá sách không thành công</strong>
                                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                </div>`
                        )
                }
        })
}

function changePreviewImage(){
        var file    = document.querySelectorAll('input#anh_bia')[0].files[0];
        var preview = document.querySelectorAll('img#preview-img')[0] ; 
        preview.src = URL.createObjectURL(file)
}

$.fn.isValid = function(){
        return this[0].checkValidity()
}

$(document).ready(function(){

        $("#tom_tat").on('propertychange input', function(e){
                $(this).height("auto");
                $(this).height($(this).prop("scrollHeight") + 5 + 'px');
        })        

        $('form.needs-validation#update_form').on("submit", function(event){
                if(!$(this).isValid())
                {
                        event.preventDefault();
                        $(this).addClass("was-validated")
                        return;
                }

                $.ajax({
                        method: "PUT",
                        url: $(this).attr('action'),
                        enctype: $(this).attr('enctype'),
                        data: new FormData(this),
                        cache: false,
                        contentType: false,
                        processData: false,
                        timeout: 60000,
                        success: function (result) {
                                if(result.success){
                                        $("#alert_container").append(
                                                `<div class="alert alert-success  alert-dismissible fade show positon-relative" role="alert">
                                                    <strong>${result.message}</strong>
                                                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                                </div>`)
                                }else{
                                        $("#alert_container").append(
                                                `<div class="alert alert-danger  alert-dismissible fade show positon-relative" role="alert">
                                                    <strong>${result.message}</strong>
                                                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                                </div>`
                                        )
                                }
                                
                        },
                        error: function (e) {
                                $("#alert_container").append(
                                        `<div class="alert alert-danger  alert-dismissible fade show positon-relative" role="alert">
                                            <strong>Cập nhật thông tin sách không thành công</strong>
                                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                        </div>`
                                )
                        }
                })
                event.preventDefault();
        })


        $("form.needs-validation#insert_form").on('submit',function(event){
                if(!$(this).isValid())
                {
                        event.preventDefault();
                        $(this).addClass("was-validated")
                        return;
                }
        })
})
 