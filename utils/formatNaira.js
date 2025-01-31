const formatNaira =(amount)=>{
  if(isNaN(amount)){
    return "Invalid Amount"
  }

  return new Intl.NumberFormat('en-NG', {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);

}

module.exports = formatNaira;