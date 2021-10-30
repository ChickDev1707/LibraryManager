function DoSubmit(){
    let data1=[]
    document.getElementsByName('borrowReturnCard').forEach(data=>{
        if(data.checked==true){
            data1.push(data.value)
        }
        
    })
    document.formSubmit.selectBorrowReturnCard.value=data1
    
}