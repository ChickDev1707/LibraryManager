function fnExportToExcel(type, fn, dl) {
    //file xlsx
    var elt = document.getElementById('reportTable');
    var wb = XLSX.utils.table_to_book(elt, { sheet: "sheet1" });
    return dl ?
        XLSX.write(wb, { bookType: type, bookSST: true, type: 'base64' }):
        XLSX.writeFile(wb, fn || ('Report.' + (type || 'xlsx')));
}





