function DoSubmit(){
    let data1=[]
    document.getElementsByName('data').forEach(data=>{
        if(data.checked==true){
            data1.push(data.value)
        }
    })
    document.myform.hide.value=data1
    
}