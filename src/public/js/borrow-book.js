function addBook(book){
    const bookBorrow = JSON.parse(book)
    const borrowTable = document.getElementById("borrow_table").getElementsByTagName('tbody')[0];

    if(document.getElementById(`bookID_${bookBorrow._id}`)!=null)
        return
    
    const index = borrowTable.rows.length;
    var newRow =  borrowTable.insertRow(index-1);
    newRow.id = `bookID_${bookBorrow._id}`
    var content =  
    `<tr >
        <td >
            <img height="100" width="100" class="rounded" src="${bookBorrow.anh_bia}"/>
        </td>
        <td scope="col" class="book_id" value="${bookBorrow._id}" >${bookBorrow._id}</td>
        <td scope="col" class="text-wrap">${bookBorrow.ten_dau_sach}</td>
        <td scope="col" class="text-wrap">${bookBorrow.gia}</td>
        <td><button class="btn btn-danger" onclick="deleteBook('${bookBorrow._id}')">Xoá</button></td> 
    </tr>`
    newRow.innerHTML = content;

    $(`table#add_table button#add_${bookBorrow._id}`).prop("disabled", true);

}

function deleteBook(id){
    $(`tr#bookID_${id}`).remove();
    $(`table#add_table button#add_${id}`).prop("disabled", false);
}

function search(){
    var option = $("#search-book-option").val();
    var key = $("#search_book_string").val();
    $("table#add_table tbody tr").each(
        function(){
            if(key=="")
                $(this).removeClass("d-none")
            else{
                if(option=="cahai")
                {
                    if($(this).attr("masach").toLocaleLowerCase()== key.toLocaleLowerCase()
                        ||$(this).attr("tensach").toLocaleLowerCase()== key.toLocaleLowerCase())
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

function submit(){
    var ids = []
    $("#borrow_table tbody td.book_id").each(function() {
        ids.push($(this).attr("value"))
    })

    if(ids.length <=0)
    {
        $("#alert_container").append(
            `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                <strong>Vui lòng chọn sách!</strong>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`
        )
        return ;
    }

    var ma_doc_gia = $("#reader_id").val();
    if(ma_doc_gia == "")
    {
        $("#alert_container").append(
            `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                <strong>Vui lòng nhập thông tin độc giả!</strong>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`
        )
        return ;
    }

    var ngay_muon = $("#ngay_muon").val();
    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: "/librarian/borrow",
        data: JSON.stringify({ma_sach: ids, ma_doc_gia: ma_doc_gia, ngay_muon:ngay_muon}),
        dataType: 'json',
        cache: false,
        success: function (result) {
            result.nSuccess.map((item)=>{
                deleteBook(item.dau_sach)
                $("#alert_container").append(
                    `<div class="alert alert-success alert-dismissible fade show " role="alert">
                        <strong>${item.message}!</strong>
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>`
                 )
            })

            result.nErrors.map((item)=>{
                $("#alert_container").append(
                    `<div class="alert alert-danger alert-dismissible fade show role="alert">
                        <strong>${item.message}!</strong>
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>`
                )
            })
        },
        error: function (e) {
            $("#alert_container").append(
                `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                    <strong>Mượn không thành công!</strong>
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>`
             )
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
        $("#alert_container").append(
            `<div class="alert alert-danger  alert-dismissible fade show positon-relative" role="alert">
                <strong>Vui lòng chọn phiếu cần xác nhận!:</strong>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`)

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
                result.nSuccess.forEach(id => {
                    console.log(id)
                    console.log($(`input[value="${id}"].confirm_input`))
                    $(`input[value="${id}"].confirm_input`).prop('checked', false);
                    $(`input[value="${id}"].confirm_input`).prop('disabled', true);
                    $(`td.status#sts_${id}`).html("Đã nhận sách");
                    $(`td.date_borow#date_borow_${id}`).html(new Date(ngayMuon).toLocaleDateString('en-GB'));

                    $("#alert_container").append(
                        `<div class="alert alert-success  alert-dismissible fade show positon-relative" role="alert">
                            <strong>Xác nhận thành công phiếu có mã:</strong>
                            <div class="text-wrap">${id}</div>
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>`)
                });
                
                result.nErrors.forEach(item=>{
                    $("#alert_container").append(
                        `<div class="alert alert-danger alert-dismissible fade show positon-relative"  role="alert">
                            <strong>Xác nhận không thành công phiếu có mã:</strong><br>
                            <div class="text-wrap" >${item}</div>
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>`
                        )
                })
            },
            error: function (e) {
                $("#alert_container").append(
                    `<div class="alert alert-danger alert-dismissible fade show  role="alert">
                        <strong>Xác nhận không thành công!</strong>
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>`
                 )
            }
        });
}
