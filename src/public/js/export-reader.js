function ExportToExcel(type, fn, dl) {
    // XLSX.WorkSheet=XLSX.utils.table_to_sheet(this.table.nativeElement, {dateNF:'mm/dd/yyyy;@',cellDates:true, raw: true});
    var elt = document.getElementById('exportTableReader');
    var wb = XLSX.utils.table_to_book(elt, { sheet: "sheet1" ,dateNF:'mm/dd/yyyy',cellDates:true});
    return dl ?
      XLSX.write(wb, { bookType: type, bookSST: true, type: 'base64' }):
      XLSX.writeFile(wb, fn || ('Manage reader.' + (type || 'xlsx')));
 }