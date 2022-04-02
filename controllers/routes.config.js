const PaymentsController = require("../controllers/payments.controllers");
const Config = require("../common/config/env.config");
exports.routeConfigs = (app)=>{
    app.get("/payments/:feeId",[
        PaymentsController.getByFeeId
    ]);
    app.get("/payments/allfees",[
        PaymentsController.getAll
    ]);
    app.post("/payments/fees",[
        PaymentsController.setupFees
    ]);
    app.post("/payments/compute-transaction-fee",[
        PaymentsController.computeTransactionFee
    ]);
} 

