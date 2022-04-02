const FeeConfig = require("../models/feeConfigs.model");
const getFee = async (feeId)=>{
    const rr = await FeeConfig.findByFeeId(feeId);
    
    return rr[0];
}

exports.getByFeeId = async (feeId)=>{
    
    return await getFee(feeId);
};

const ObjFeeConfig = {
    FeeId:String,
    FeeLocale:String,
    FeeEntity:String,
    EntityProperty:String,
    FeeType:String,
    FeeValue:String,
    FeeCurrency:String,
    FeePriority:Number
}

exports.getAll = async ()=>{
    console.log("find all method");
    let rr =  await FeeConfig.findAll();
    console.log("find all method");
    console.log(rr);
    return rr;
}



const getByLocaleCurrencyEntity = async (locale, currency, entity)=>{
    const result = await FeeConfig.findByLocaleCurrencyEntity(locale,currency,entity);
    return result[0];
     
}

const computeFeePrecedence = (feeConfig)=>
{
    if(feeConfig.FeeLocale == "*" && feeConfig.FeeEntity == "*" && feeConfig.EntityProperty == "*")
    {
        feeConfig.FeePriority = 4;

    }
    else if(feeConfig.FeeLocale != "*" && feeConfig.FeeEntity != "*" && feeConfig.EntityProperty != "*")
    {
        feeConfig.FeePriority = 1;
    }
    else if ((feeConfig.FeeLocale == "*" && feeConfig.FeeEntity == "*" && feeConfig.EntityProperty != "*") ||
        (feeConfig.FeeLocale == "*" && feeConfig.FeeEntity != "*" && feeConfig.EntityProperty == "*") ||
        (feeConfig.FeeLocale != "*" && feeConfig.FeeEntity == "*" && feeConfig.EntityProperty == "*")
        )
    {
        feeConfig.FeePriority = 3;
    }
    else if ((feeConfig.FeeLocale == "*" && feeConfig.FeeEntity != "*" && feeConfig.EntityProperty != "*") ||
       (feeConfig.FeeLocale != "*" && feeConfig.FeeEntity == "*" && feeConfig.EntityProperty != "*") ||
       (feeConfig.FeeLocale != "*" && feeConfig.FeeEntity != "*" && feeConfig.EntityProperty == "*")
       )
    {
        feeConfig.FeePriority = 2;
    }
    return feeConfig;

}

exports.processFeeConfigSetup = async (feeSetupRequest) => {
    const configsSplits = feeSetupRequest.FeeConfigurationSpec.split("\n");
    const feeConfigs = [];
    for(let config of configsSplits){
        const ffConfig = {};
        const spConfig =config.split(" ");
        ffConfig.FeeId = spConfig[0];
        const f = await getFee(ffConfig.FeeId);
        console.log(f);
        if(f != null)
        {
            //this already exists
            continue;
        }
        ffConfig.FeeCurrency = spConfig[1].trim();
        ffConfig.FeeCurrency = spConfig[1].trim();
        ffConfig.FeeLocale = spConfig[2].trim();
        //var entity = spConfig[3].trim().substring(0, spConfig[3].trim().indexOf("("));
        ffConfig.FeeEntity = spConfig[3].trim().substring(0, spConfig[3].trim().indexOf("("));
        ffConfig.EntityProperty = spConfig[3].trim().substring(spConfig[3].trim().indexOf("(") + 1);
        ffConfig.EntityProperty = ffConfig.EntityProperty.replace(")","");
        ffConfig.FeeType = spConfig[6].trim();
        ffConfig.FeeValue = spConfig[7].trim();
        //console.log(ffConfig);
        //ffConfig =  computeFeePrecedence(ffConfig);
        feeConfigs.push(computeFeePrecedence(ffConfig));
    }

    if(feeConfigs.length > 0){
        await FeeConfig.insertMany(feeConfigs);
    }
}

exports.computeTransactionFee = async (transaction) =>
{
    var response = {};
    var locale = "";
    if(transaction.CurrencyCountry == transaction.PaymentEntity.Country)
    {
        locale = "LOCL";
    }
    else
    {
        locale = "INTL";
    }
    var feeConfig = await getByLocaleCurrencyEntity(locale, transaction.Currency, transaction.PaymentEntity);
    if(feeConfig != null)
    {
        response = { AppliedFeeID :feeConfig.FeeId};
        if(feeConfig.FeeType == "FLAT")
        {
            response.AppliedFeeValue = feeConfig.FeeValue;

        }else if(feeConfig.FeeType == "PERC")
        {
            response.AppliedFeeValue = parseFloat(feeConfig.FeeValue) * transaction.Amount / 100;
        }else if(feeConfig.FeeType== "FLAT_PERC")
        {
            var rates = feeConfig.FeeValue.split(":");
            if (rates == null || rates.Length == 0)
                return null;


            response.AppliedFeeValue = parseFloat(rates[0]) + ( Convert.ToDecimal(rates[1]) * transaction.Amount / 100);
        }
        response.ChargeAmount = transaction.Customer.BearsFee ? transaction.Amount +  response.AppliedFeeValue : transaction.Amount;
        response.SettlementAmount = response.ChargeAmount - response.AppliedFeeValue;
        return response;
    }
    else
    {
        return null;
    }
    return null;
}