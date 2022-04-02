const { stringify } = require("uuid");

const mongoose = require("../common/services/mongoose.service").mongoose;

const Schema = mongoose.Schema;
const feeConfigSchema = new Schema({
    FeeId:String,
    FeeLocale:String,
    FeeEntity:String,
    EntityProperty:String,
    FeeType:String,
    FeeValue:String,
    FeeCurrency:String,
    FeePriority:Number
});
feeConfigSchema.virtual('Id').get(function(){
    return this._id.toHexString();
});
feeConfigSchema.set("toJSON", {
    virtual:true
});

feeConfigSchema.findById = function(cb){
    return this.model("FeeConfig").find({Id:this.Id}, cb);
};
feeConfigSchema.findByFeeId = function(cb){
    return this.model("FeeConfig").find({FeeId:this.FeeId}, cb);
};
const supportedEntityTypes = ["CREDIT-CARD", "DEBIT-CARD", "BANK-ACCOUNT", "USSD", "WALLET-ID"];

const FeeConfig = mongoose.model("FeeConfig",feeConfigSchema,"feeConfig");
exports.findByFeeId = (feeId)=>{
    console.log(feeId);
    let rr = FeeConfig.find({FeeId:feeId});
    //console.log(rr);
    return rr;
    
};

exports.insertMany = (feeConfigs)=>{
    FeeConfig.insertMany(feeConfigs).then(function(){
        console.log(feeConfigs.length+" Fee configs inserted successfully");
    }).catch(function(err){
        console.log("error encountered and fee configs not inserted: "+err);
    });
};

exports.findAll = ()=>{
    return FeeConfig.find({});
}

exports.findByLocaleCurrencyEntity = async (locale, currency, entity)=>{
    const filter = {
        $and: [
            { $or: [ { FeeLocale: locale }, { FeeLocale : "*" } ] },
            {FeeCurrency:currency},
            { $or: [ { FeeEntity: entity.Type }, { FeeEntity : "*" } ] },
            { $or: [ { EntityProperty: entity.Id }, { EntityProperty : "*" }, { EntityProperty : entity.Issuer }, { EntityProperty : entity.Brand },{ EntityProperty : entity.Number },{ EntityProperty : entity.SixId } ] }
        ]
    };

    return FeeConfig.find(filter).sort("FeePriority");

}