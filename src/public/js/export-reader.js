
function fnExportToExcel(type, fn, dl) {
    //file xlsx
    console.log(type)
    var elt = document.getElementById('tableReader');
    var wb = XLSX.utils.table_to_book(elt, { sheet: "sheet1" });
    return dl ?
        XLSX.write(wb, { bookType: type, bookSST: true, type: 'base64' }):
        XLSX.writeFile(wb, fn || ('Report.' + (type || 'xlsx')));
}

