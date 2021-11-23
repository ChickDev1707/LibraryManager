FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginFileEncode,
    FilePondPluginImageResize,
    FilePondPluginImageEdit,
    FilePondPluginFileValidateType
)

FilePond.setOptions({
    allowMultiple: false,
    acceptedFileTypes: ['image/*'],
    labelIdle: `<i class="fas fa-upload"></i>Tải ảnh lên`,
    imagePreviewMaxHeight: 750,
    imageCropAspectRatio: '0.75:1',
    imageResizeTargetWidth: 562.5,
    imageResizeTargetHeight: 750,
    stylePanelLayout: 'compact ',
    styleButtonRemoveItemPosition: 'center top',
})

FilePond.parse(document.body)
