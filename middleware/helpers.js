import { asyncHandler } from "./async.js";

export const setDocument = (id, model) =>
  asyncHandler(async (req, res, next) => {
    const query = { _id: req.body[id] };
    req.document = await model.findOne(query);
    if (!req.document) {
      return next(new Error("That id doesn't exists", "not-found", 404));
    }
    next();
  });

// const setUser = asyncHandler(async(req, res, next) => {
//   const user = await UserModel.findOne({_id: req.body.userId});
//   req.user = user;
//   next();
// })

// const setSubscriptionVoucher = asyncHandler(async (req, res, next) => {
//   const query = { _id: req.body.subscriptionVoucherId };
//   const result = await SubscriptionVoucherModel.findOne(query).populate({path: 'service'});
//   req.document = result;
//   if (!req.document) {
//     return next(new Error("That id doesn't exists", 'not-found', 404));
//   }
//   next();
// })

// const deleteTransaction = (model) => asyncHandler(async (req, res, next) => {
//   if(req.document.transactions) {
//     if (model === 'purchase' || model === 'invoice'){
//       req.document.transactions.map(async (transaction) => {
//         await stockTransaction.TransactionModel.deleteOne({_id: String(transaction)});
//       })
//     }
//     else {
//       req.document.transactions.map(async (transaction) => {
//         await balanceTransaction.TransactionModel.deleteOne({_id: String(transaction)});
//       })
//     }
//   }
//   next();
// })

// const referenceProducts = (model, id) => asyncHandler(async (req, res, next) => {
//   const result = await model.find({ product: req.body[id] });
//   if(result.length > 0) {
//     return next(HttpError.referenceError('This product has stocks assigned to it'))
//   }
//   else {
//     next();
//   }
// })

// const createTransaction = async (transaction, user, voucherId, session) => {
//   let responses;
//   let totalBalance;
//   if(transaction.type === 'payment' || transaction.type === 'receipt') {
//     if(transaction.type === 'receipt') {
//       totalBalance = { balance: transaction.total, credit: transaction.total };
//     }
//     else {
//       totalBalance = { balance: -(transaction.total), debit: transaction.total };
//     }
//     responses = await Promise.all([
//       balanceTransaction.TransactionModel.create(
//         [
//           {
//             narration: transaction.narration,
//             from: transaction.from,
//             to: transaction.to,
//             costCenter: transaction.costCenter,
//             amount: transaction.amount,
//             type: transaction.type,
//             tax: transaction.tax,
//             total: transaction.total,
//             voucher: voucherId,
//           },
//         ],
//         { session: session }
//       ),
//       Account.AccountModel.findOneAndUpdate(
//         { _id: transaction.from },
//         { $inc: { balance: -(transaction.total), debit: transaction.total } },
//         { session: session, new: true }
//       ),
//       Account.AccountModel.findOneAndUpdate(
//         { _id: transaction.to },
//         { $inc: { balance: transaction.total, credit: transaction.total } },
//         { session: session, new: true }
//       ),
//       CostCenter.findOneAndUpdate(
//         { _id: transaction.costCenter },
//         { $inc: totalBalance },
//         { session: session, new: true }
//       ),
//     ]);
//     if(transaction.type === 'receipt') {
//       await Account.AccountModel.findOneAndUpdate(
//         { _id: transaction.from },
//         { lastPaid: new Date() },
//         { session: session, new: true }
//       );
//     }
//     if(responses[1].balance <= 0) {
//       await Account.AccountModel.findOneAndUpdate(
//         { _id: responses[1]._id },
//         { lastNegativeBalance: null },
//         { session: session, new: true }
//       )
//     }
//     createLogs(user, 'Account', 'UPDATE', responses[1]._id, {
//       balance: responses[1].balance,
//       debit: responses[1].debit
//     });
//   }
//   else if (transaction.type === 'expense' || transaction.type === 'salary') {
//     responses = await Promise.all([
//       balanceTransaction.TransactionModel.create(
//         [
//           {
//             narration: transaction.narration,
//             from: transaction.from,
//             to: transaction.to,
//             costCenter: transaction.costCenter,
//             amount: transaction.amount,
//             type: transaction.type,
//             tax: transaction.tax,
//             total: transaction.total,
//             voucher: voucherId,
//           },
//         ],
//         { session: session }
//       ),
//       CostCenter.findOneAndUpdate(
//         { _id: transaction.costCenter },
//         { $inc: { balance: -(transaction.total), debit: transaction.total } },
//         { session: session, new: true }
//       ),
//       Account.AccountModel.findOneAndUpdate(
//         { _id: transaction.to },
//         { $inc: { balance: transaction.total, credit: transaction.total } },
//         { session: session, new: true }
//       ),
//       Account.AccountModel.findOneAndUpdate(
//         { _id: transaction.from },
//         { $inc: { balance: -(transaction.total), debit: transaction.total } },
//         { session: session, new: true }
//       ),
//     ]);
//     if(responses[1].balance <= 0) {
//       await Account.AccountModel.findOneAndUpdate(
//         { _id: responses[1]._id },
//         { lastNegativeBalance: null },
//         { session: session, new: true }
//       )
//     }
//     createLogs(user, 'accounts', 'UPDATE', responses[2]._id, {
//       balance: responses[2].balance,
//     });
//     createLogs(user, 'CostCenter', 'UPDATE', responses[1]._id, {
//       balance: responses[1].balance,
//     });
//   }
//   else {
//     responses = await Promise.all([
//       balanceTransaction.TransactionModel.create(
//         [
//           {
//             narration: transaction.narration,
//             to: transaction.to,
//             amount: transaction.amount,
//             type: transaction.type,
//             tax: transaction.tax,
//             total: transaction.total,
//             voucher: voucherId,
//           },
//         ],
//         { session: session }
//       ),
//       Account.AccountModel.findOneAndUpdate(
//         { _id: transaction.to },
//         { $inc: { balance: transaction.total } },
//         { session: session, new: true }
//       ),
//     ]);
//     if(responses[1].balance > 0) {
//       await Account.AccountModel.findOneAndUpdate(
//         { _id: responses[1]._id },
//         { lastNegativeBalance: new Date() },
//         { session: session, new: true }
//       )
//     }
//     createLogs(user, 'Account', 'UPDATE', responses[1]._id, {
//       balance: responses[1].balance,
//     });
//   }
//   createLogs(
//     user,
//     'transaction',
//     'CREATE',
//     responses[0][0]._id,
//     responses[0][0].toJSON()
//   );
//   return responses[0]._id;
// }

// const createStockTransaction = async (transaction, user, session) => {
//   try {
//     let account;
//     let balance;
//     if(transaction.type === 'invoice') {
//       account = transaction.to;
//       balance = transaction.totalPrice
//     }
//     else {
//       account = transaction.from;
//       balance = -(transaction.totalPrice);
//     }
//     const responses = await Promise.all([
//       stockTransaction.TransactionModel.create(
//         [
//           {
//             stocks: transaction.stocks,
//             from: transaction.from,
//             to: transaction.to,
//             logistic: transaction.logistic,
//             logisticPrice: transaction.logisticPrice,
//             price: transaction.price,
//             quantity: transaction.quantity,
//             totalPrice: transaction.totalPrice,
//             type: transaction.type,
//             voucher: transaction.voucher,
//           },
//         ],
//         { session: session }
//       ),
//       Account.AccountModel.findOneAndUpdate(
//         { _id: account },
//         { $inc: { balance: balance } },
//         { new: true, session: session }
//       ),
//     ]);
//     createLogs(
//       user,
//       "transaction",
//       "CREATE",
//       responses[0][0]._id,
//       responses[0][0].toJSON()
//     );
//     createLogs(user, 'Account', 'UPDATE', responses[1]._id, {
//       balance: responses[1].balance,
//     });
//     return responses[0][0]._id;
//   }
//   catch (err) {
//     console.log(
//       'msg: ' + err + ', code: ' + ' invalid-error' + ', status: ' + 500
//     );
//   }
// };

// const addStock = async (stock, user, session, obj) => {
//   let product = await ProductModel.findOne({ _id: stock.productId });
//   let prefixCode = product.code;
//   if(obj[prefixCode] !== undefined) {
//     code = obj[prefixCode];
//   }
//   else {
//     code = await generateStockCode(StockModel, `${prefixCode}S`);
//     obj[prefixCode] = code;
//   }
//   let result = [];
//   for(let i = 0; i < stock.quantity; i++) {
//     result.push(await StockModel.create([{
//       product: stock.productId,
//       account: stock.account,
//       buyingPrice: stock.buyingPrice,
//       logisticPrice: stock.logisticPrice,
//       totalPrice: stock.buyingPrice + stock.logisticPrice / stock.quantity,
//       currentPrice: stock.buyingPrice + stock.logisticPrice / stock.quantity,
//       vendor: stock.vendorId,
//       logistic: stock.logisticId,
//       productHealth: stock.productHealth,
//       show: stock.show,
//       code: `${code}`
//     }], {session: session}));
//     counter = parseInt(code.slice(`${prefixCode}S`.length));
//     code = `${prefixCode}S${counter + 1}`;
//     obj[prefixCode] = code;
//   }
//   return {
//     stocks: result,
//     obj: obj
//   };
// }

// const crossCheckWaitingList = async(productIds) => {
//   const session = await mongoose.startSession();
//   try {
//     for(let i = 0; i < productIds.length; i++) {
//       session.startTransaction();
//       let stock = await StockModel.findOne({product: productIds[i], status: 'INSTOCK'}).sort({ createdAt: 1}).limit(1);
//       const waitingList = await WaitingList.findOne({ $and: [{ product: productIds[i] }, { isNotified: false }]}).sort({ createdAt: -1 }).limit(1);
//       if(!waitingList) {
//         await session.commitTransaction();
//         continue;
//       }
//       else {
//         Notifications.create({
//           user: waitingList.user._id,
//           product: waitingList.product._id
//         })
//         await StockModel.findOneAndUpdate(
//           { _id: stock._id },
//           { status: "USERNOTIFIED", user: waitingList.user._id},
//           { new: true, sessions: session }
//         )
//         result = await WaitingList.findOneAndUpdate(
//           { _id: waitingList._id },
//           { isNotified: true },
//           { new: true, session: session }
//         );
//         await session.commitTransaction();
//       }
//     }
//     await session.endSession();
//     console.log("done");
//   }
//   catch (err) {
//     console.error(err);
//   }
// }

// const changeStockAccount = async (stock, toAccount, user, session) => {
//   const updatedStock = await StockModel.findOneAndUpdate(
//     {_id: stock.stockId},
//     {account: toAccount, status: "SOLD"},
//     {new: true, session: session}
//   );
//   createLogs(
//     user,
//     "Stock",
//     "CREATE",
//     updatedStock._id,
//     {
//       account: toAccount,
//       status: "SOLD"
//     }
//   )
// }

// const getCdsBack = async (accountId, session, warehouseId, user) => {
//   const result = await StockModel.find({account: accountId, status: 'RENTED'});
//   await Promise.all(result.map(async (stock) => {
//     await StockModel.findOneAndUpdate(
//       { _id: stock._id },
//       { user: null, status: 'INSTOCK' },
//       { new: true, session: session }
//     );
//     createLogs(
//       user,
//       'Stock',
//       'update',
//       stock._id,
//       { user: null, status: 'INSTOCk' }
//     );
//   }))
// }

// const getParent = async (accountId) => {
//   let account = await Account.AccountModel.findOne({ _id: accountId });
//   const parent = await account.getParent(['-children', '-path']);
//   account = account.toJSON();
//   account.parent = parent;
//   return account;
// };

// const calculateAverageRentTime = async (order, session) => {
//   const product = await ProductModel.findOne({ _id: order.swap.product._id });
//   let rentDate = await Order.find({stock: order.swap._id}).sort({createdAt: -1}).select('createdAt -_id');
//   if(rentDate.length > 0) {
//     rentDate = rentDate[0].createdAt;
//     let returnDate = await Order.findOne({_id: order._id}).select('createdAt -_id');
//     returnDate = returnDate.createdAt;
//     let Difference_In_Time = returnDate.getTime() - rentDate.getTime();
//     let Difference_In_Days = Math.round(Difference_In_Time / (1000 * 3600 * 24));
//     let totalRentTime = product.rents * product.averageRentTime;
//     const rents = product.rents;
//     await ProductModel.findOneAndUpdate(
//       { _id: order.swap.product._id },
//       {
//         $inc: { rents: 1 }, averageRentTime: (totalRentTime + Difference_In_Days) / rents
//       },
//       {
//         session: session,
//         new: true
//       }
//     );
//   }
//   else {

//   }
// }
