
const FeeConfig = require("../services/payment_processor.service");
exports.getByFeeId = async (req,res)=>{
    const results = await FeeConfig.getByFeeId(req.params.feeId);
    if(results){
        
        res.status(200).send(results);
    }
        
    else
        res.status(404).send("No Record found");
};

exports.setupFees = async (req,res)=>{
    await FeeConfig.processFeeConfigSetup(req.body);
    res.status(200).send("fee setup processed successfully");
}

exports.getAll = async (req,res)=>{
    const results = await FeeConfig.getAll();
    console.log("consoller");

    console.log(results);
    if(results){
        
        res.status(200).send(results);
    }
        
    else
        res.status(404).send("No Record found");
}

exports.computeTransactionFee = async (req, res)=>{
    const result = await FeeConfig.computeTransactionFee(req.body);
    if(result){
        res.status(200).send(result);
    }else{
        res.status(400).send("Eror encountered while computing the transaction fee");
    }
}