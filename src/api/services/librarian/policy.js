const Policy = require("../../models/policy")

async function getReaderPolicies(){
  const minAge = await Policy.findOne({ten_quy_dinh: "tuoi_toi_thieu"})
  const maxAge = await Policy.findOne({ten_quy_dinh: "tuoi_toi_da"})
  const cardExpireLimit = await Policy.findOne({ten_quy_dinh: "thoi_han_the"})
  return {
    minAge: minAge != null? minAge.gia_tri: "", 
    maxAge: maxAge != null? maxAge.gia_tri: "",
    cardExpireLimit: cardExpireLimit != null? cardExpireLimit.gia_tri: ""
  }
}

async function updateReaderPolicies(policiesInput){
  await handleUpdateMinAgePolicy(policiesInput.minAge)
  await handleUpdateMaxAgePolicy(policiesInput.maxAge)
  await handleUpdateCardExpireLimitAgePolicy(policiesInput.cardExpireLimit)
}
async function handleUpdateMinAgePolicy(minAgeInput){
  let minAgePol = await Policy.findOne({ten_quy_dinh: "tuoi_toi_thieu"})
  if(minAgePol == null){
    minAgePol = new Policy({ten_quy_dinh: "tuoi_toi_thieu", gia_tri: minAgeInput})
  }else{
    minAgePol.gia_tri = minAgeInput
  }
  await minAgePol.save()
}
async function handleUpdateMaxAgePolicy(maxAgeInput){
  let maxAgePol = await Policy.findOne({ten_quy_dinh: "tuoi_toi_da"})
  if(maxAgePol == null){
    maxAgePol = new Policy({ten_quy_dinh: "tuoi_toi_da", gia_tri: maxAgeInput})
  }else{
    maxAgePol.gia_tri = maxAgeInput
  }
  await maxAgePol.save()
}
async function handleUpdateCardExpireLimitAgePolicy(cardExpireLimitInput){
  let cardExpireLimit = await Policy.findOne({ten_quy_dinh: "thoi_han_the"})
  if(cardExpireLimit == null){
    cardExpireLimit = new Policy({ten_quy_dinh: "thoi_han_the", gia_tri: cardExpireLimitInput})
  }else{
    cardExpireLimit.gia_tri = cardExpireLimitInput
  }
  await cardExpireLimit.save()
}
module.exports={
  getReaderPolicies,
  updateReaderPolicies
}