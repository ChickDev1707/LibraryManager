$( function() {
    $( "#searchBox" ).autocomplete({
      source: function(req, res){
          $.ajax({
              url:"autocomplete/",
              dataType: "jsonp",
              type:"GET",
              data:req,
              success: function(data){
                  console.log(data)
                  res(data)
              },
              error: function(err){
                  console.log(err.status)
              }
          })
      }
    });
  } );