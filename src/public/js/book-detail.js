$(function(){
    $("div.rating.reader i").each(function (i, object) {
        $(this).click(function () {
            $('#voteStart').val(i+1)
            for (var j = 0; j < 5; j++) {
                var id = "star" + (j + 1).toString();
                if (j <= i) {
                    var element = document.getElementById(id);
                    element.classList.remove("fa-star-o");
                    element.classList.add("fa-star");
                    element.classList.add("yellowstar");
                } else {
                    var element = document.getElementById(id);
                    element.classList.remove("fa-star");
                    element.classList.remove("yellowstar");
                    element.classList.add("fa-star-o");
                }
            }
        })
    })

    $('.js-edit-comment').each(function(i,obj){
        $(this).click(function(){
            var idComment = obj.getAttribute('data-id-comment')
            var voteStart = obj.getAttribute('data-vote-star')
            var content = obj.getAttribute('data-noi-dung')
            var form = document.getElementById('form-comment')
            var path = form.getAttribute('action')
            console.log(idComment)
            console.log(voteStart)
            console.log(content)

            $('#form-comment').attr('action', path+ '?_method=PUT')
            $('#form-comment h4').text("Chỉnh sửa nhận xét")
            $('#voteStart').val(voteStart)
            $('#commentId').val(idComment)
            $('#form-comment textarea').text(content)
            for (let i = 0; i < voteStart; i++) {
                var idStar = "star"+(i+1);
                console.log(idStar)
                var star = document.getElementById(idStar)
                star.classList.remove("fa-star-o")
                star.classList.add("fa-star")
                star.classList.add("yellowstar")
            }
        })
    })
})


Validator({
    form : '#form-comment',
    formGroupSelector : '.input-item',
    errorSelector : '.errorMessage',
    rules : [
        Validator.isRequire('#comment')
    ]
});