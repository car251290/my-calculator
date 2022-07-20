import React, { useState, useEffect } from "react";
import ReactTable from 'react-table';
import Apis from "./Component/fetchapi/Apis";
import './App.css';
import _ from 'lodash';

const calculateResults = (incomingData) => {
   // Calculate points per transaction evert month
  const months = ["January","February","March","April","May","June","August","September","October","November","December"];
  const pointsperTransaction = incomingData.map(transaction => {
    let points = 0;
    let over100 = transaction.amt - 100;
      // A customer receives 2 points for every dollar spent over $100 in each transaction    
    if( over100 > 0) {
      points += (over100 *2);

    }
    // plus 1 point for every dollar spent over $50 in each transaction
    if(transaction.amt>50){
      points += 50;
    }
    const month = new Date(transaction.transaction).getMonth();
    return {
      ...transaction,points,month
    };

  });
  let byCustemer = {};
  let totalPointsByCustemer = {};
  pointsperTransaction.forEach(pointsperTransaction => {
    let {custid,name,month,points} = pointsperTransaction;

    if(!byCustemer[custid]) {
      totalPointsByCustemer[name]=0;

    }
    totalPointsByCustemer[name] += points;
    if(byCustemer[custid][month]){
      byCustemer[custid][month].points+= points;
      byCustemer[custid][month].monthNumber = month;
      byCustemer[custid][month].numtransactions++;
    } 
    else {
      byCustemer[custid][month]= {
        custid,
        name,
        monthNumber:month,
        month:month[month],
        numtransactions:1,
        points
      }
    }
  });
  let total = [];
  for(var custkey in byCustemer){
    totalPointsByCustemer.push({
      name:custkey,
      points:totalPointsByCustemer[custkey]
    });
  }
  return {
    summaryByCustomer : total,
  pointsperTransaction,
  totalPointsByCustemer :totalPointsByCustemer

  };

};


const App = () =>  {
  const [TransactionData,setTransactionData]= useState(null);
  const columns = [
    {
      Header:'Customer',
      accessor: 'name'      
    },    
    {
      Header:'Month',
      accessor: 'month'
    },
    {
      Header: "# of Transactions",
      accessor: 'numTransactions'
    },
    {
      Header:'Reward Points',
      accessor: 'points'
    }
  ];
  const totalsByColumns = [
    {
      Header:'Custemer',
      accessor: 'name'      
    },    
    {
      Header:'Points',
      accessor: 'points'
    }
  ]
  const getIndividualTransaction = (row) => {
    let byCustemer =_.filter(TransactionData.pointsperTransaction,(tRow)=>{
      return row.origin.custid === tRow.custid && row.origin.monthNumber === tRow.month;
    });
    return byCustemer
  }
  useEffect (()=> {
    Apis().then((data) =>{
      const results = calculateResults(data);
      setTransactionData(results)
    })
  },[])

  if (TransactionData === null) {
    return <div>Loading...</div>;   
  }

  return TransactionData == null ?
    <div>Loading...</div> 
      :    
    <div>      
      
      <div className="container">
        <div className="row">
          <div className="col-10">
            <h2>Points Rewards System Totals by Customer Months</h2>
          </div>
        </div>
        <div className="row">
          <div className="col-8">
            <ReactTable
              data={TransactionData.summaryByCustomer}
              defaultPageSize={5}
              columns={columns}
              SubComponent={row => {
                return (
                  <div>
                    
                      {getIndividualTransaction(row).map(tran=>{
                        return <div className="container">
                          <div className="row">
                            <div className="col-8">
                              <strong>Transaction Date:</strong> {tran.transactionDt} - <strong>$</strong>{tran.amt} - <strong>Points: </strong>{tran.points}
                            </div>
                          </div>
                        </div>
                      })}                                    

                  </div>
                )
              }}
              />             
            </div>
          </div>
        </div>
        
        <div className="container">    
          <div className="row">
            <div className="col-10">
              <h2>Points Rewards System Totals By Customer</h2>
            </div>
          </div>      
          <div className="row">
            <div className="col-8">
              <ReactTable
                data={TransactionData.totalPointsByCustomer}
                columns={totalsByColumns}
                defaultPageSize={5}                
              />
            </div>
          </div>
        </div>      
    </div>
  ;
  
}

export default App;
