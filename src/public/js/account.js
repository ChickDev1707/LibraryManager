function editProfile() {
    $("input.info").attr('disabled', false);
    $("select.info").attr('disabled', false);
    $("textarea.info").attr('disabled', false);
    $("button.btn-save-info").removeClass("d-none");
    $("label.btn-upload").removeClass("d-none")
    $("button#btn-edit-pro").addClass('d-none');
    $("button#btn-cancel-edit-pro").removeClass('d-none');

}

function cancelEditProfile(saved) {
    $("input.info").attr('disabled', true);
    $("select.info").attr('disabled', true);
    $("textarea.info").attr('disabled', true);
    $("button.btn-save-info").addClass("d-none");
    $("label.btn-upload").addClass("d-none")
    $("button#btn-edit-pro").removeClass('d-none');
    $("button#btn-cancel-edit-pro").addClass('d-none');
    var url = $("#preview_image").attr("defaultSrc");
    $("#preview_image").attr('src', url);
}

function editPassword() {
    $("input.pass").attr('disabled', false);
    $("button.btn-save-pass").removeClass("d-none");
    $("button#btn-edit-pass").addClass('d-none');
    $("button#btn-cancel-edit-pass").removeClass('d-none');
}

function cancelEditPass() {
    $("input.pass").attr('disabled', true);
    $("button.btn-save-pass").addClass("d-none");
    $("button.btn-cancel-edit-pass").empty();
    $("button#btn-edit-pass").removeClass('d-none');
    $("button#btn-cancel-edit-pass").addClass('d-none');
}

$(document).ready(function () {

    $('#update_info_form').on("submit", function (event) {
        event.preventDefault();
        $.ajax({
            method: $(this).attr('method'),
            url: $(this).attr('action'),
            data: $(this).serialize(),
            timeout: 60000,
            success: function (result) {
                let messageToast = document.getElementById('message-toast')
                var toast = new bootstrap.Toast(messageToast)
                changeToast({
                    type: result.success ? "success" : "error",
                    message: result.success ? "Cập nhật thành công!" : result.message
                })
                toast.show();
                cancelEditProfile();

            },
            error: function (e) {
                let messageToast = document.getElementById('message-toast')
                var toast = new bootstrap.Toast(messageToast)
                changeToast({
                    type: "error",
                    message: "Cập nhật không thành công!"
                })
                toast.show();
            }
        })

    })

    $('#update_avatar_form').on("submit", function (event) {
        event.preventDefault();
        $.ajax({
            method: $(this).attr('method'),
            url: $(this).attr('action'),
            data: $(this).serialize(),
            timeout: 60000,
            success: function (result) {
                if (result.success) {
                    var url = 'url(' + result.anh_bia + ')'
                    $("button.filepond--file-action-button.filepond--action-remove-item").click()
                    setTimeout(() => {
                        $(".filepond--root .filepond--drop-label").css("background-image", url)
                    }, 1500)
                }

                let messageToast = document.getElementById('message-toast')
                var toast = new bootstrap.Toast(messageToast)
                changeToast({
                    type: result.success ? "success" : "error",
                    message: result.success ? "Cập nhật thành công!" : result.message
                })
                toast.show();

            },
            error: function (e) {
                let messageToast = document.getElementById('message-toast')
                var toast = new bootstrap.Toast(messageToast)
                changeToast({
                    type: "error",
                    message: "Cập nhật không thành công!"
                })
                toast.show();
            }
        })

    })

    $('#update_pass_form').on("submit", function (event) {
        event.preventDefault();
        var pass = $("input#newPass").val();
        var rePass = $("input#rePass").val();
        if (pass != rePass) {
            let messageToast = document.getElementById('message-toast')
            var toast = new bootstrap.Toast(messageToast)
            changeToast({
                type: "error",
                message: "Mật khẩu không trùng khớp!"
            })
            toast.show();
            return;
        }
        $.ajax({
            method: "PUT",
            url: $(this).attr('action'),
            data: $(this).serialize(),
            timeout: 60000,
            success: function (result) {
                if (result.success) {
                    cancelEditPass();
                    $("input#currentPass").val("");
                    $("input#newPass").val("");
                    $("input#rePass").val("");
                }

                let messageToast = document.getElementById('message-toast')
                var toast = new bootstrap.Toast(messageToast)
                changeToast({
                    type: result.success ? "success" : "error",
                    message: result.success ? "Cập nhật thành công!" : result.message
                })
                toast.show();

            },
            error: function (e) {
                let messageToast = document.getElementById('message-toast')
                var toast = new bootstrap.Toast(messageToast)
                changeToast({
                    type: "error",
                    message: "Cập nhật không thành công!"
                })
                toast.show();
            }
        })

    })


    $(".filepond--root").on("FilePond:addfile", function (e) {
        $(".btn-save-avatar").removeClass('d-none')
    })

    $(".filepond--root").on("FilePond:removefile", function (e) {
        $(".btn-save-avatar").addClass('d-none')
    })
})
