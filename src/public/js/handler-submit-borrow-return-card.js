function DoSubmit(){
    let data1=[]

    document.getElementsByName('borrowReturnCard').forEach(data=>{
        if(data.checked==true){
            data1.push(data.value)
        }
        
    })
    const xacNhan=confirm('xác nhận trả sách cho các phiếu trên')
    if(xacNhan==true){
        document.formSubmit.selectBorrowReturnCard.value=data1
    }
    else{
        document.formSubmit.selectBorrowReturnCard.value=""
    }
}
