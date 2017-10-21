import React, { Component } from 'react'
import Pubsub from 'pubsub-js'
// styles
import './styles/App.css'
// components
import Select from './components/generic/Select.react'
import Input  from './components/generic/Input.react'
import Banner from './components/generic/Banner.react'
import Button from './components/generic/Button.react'
import Table  from './components/generic/Table.react'
// redux
// action keys and relay function
import events from './events'
const {
        ADD_ACCT,
        SELECT_ACCT,
        SELECT_TABLE,
    } = events.ui
// other dependancies
import { initialState } from './state/index'
import testData from './data'

// data tables
const eventKeys = Object.keys(events.loadTable)
const multiKeys = Object.keys(events.multiTable)
const filterKeys = Object.keys(events.filterTable)
// global object for Pubsub events
let globalVar = {}
// props for account obj initialization
let newProps = []
for (let key of eventKeys) {
    newProps.push(key)
}
// confirms account number is valid
let verifyAccount = (acct) => {
    if ( acct % 1 === 0 && acct > 0 && acct < 10000 ) {
        // still needs pubsub event w/ promise
        return true
    } else {
        return false
    }
}

const validateAcctInput = (val) => {
    let arr
    if (val) {
        arr = Array.from(val) // if length is valid and last char is a number
        if ( arr.length < 5 && ! isNaN( parseInt( arr[arr.length-1], 10 ) ) ) {
            return val.slice() // return string
        } else {
            return val.slice(0,val.length-1) // return string without invalid char
        }
    } else {
        return ""
    }
}

const makeElems = (arr) => {
    let newElems = []
    for (let val of arr) {
        newElems.push(<option key={val.toString()} value={val}>{val}</option>)
    }
    return newElems
}

class App extends Component {
    constructor(props) {
        super(props)
        this.state = initialState
    }

    changeState(description, newState) {
        console.log(description)
        this.setState(newState)
    }
    
    flatAccts() {
        return Object.keys(this.state.accts)
    }

    shouldComponentUpdate() {
        return true
    }
  
    handleAcctInputChange(x) {
        this.changeState("acct input changed", {acctInput: x})
    }

    handleAcctChange(x) {
        this.changeState("selected acct changed", {acctSelected: x})
    }

    handleTableChange(x) {
        this.changeState("table changed", {tableSelected: x})
    }

    addAcct(x) {
        let newState = {}
        let newAccts = {}
        let prevAcctsList = this.flatAccts()
        if (prevAcctsList.includes(x)) return
        // if accts contains accounts, copy accts' enumerable
        if (prevAcctsList.length > 0) Object.assign(newAccts, this.state.accts)
        newState.accts = newAccts
        newState.accts[x] = {}
        newState.acctSelected = x
        newState.acctInput = ""
        this.changeState("acct added", newState)
    }

    handleAcctQuery(x) {
        if ( verifyAccount(x) ) {
            this.addAcct(x)
        } else {
            alert("invalid acct val")
        }
    }

    handleTableLoad() {
        let {acctSelected, tableSelected} = this.state
        this.loadTable(acctSelected, tableSelected)
        this.changeState("rest api pending", {restPending: true})
    }

    updateBanner(data) {
        // toggle banner className / message
        this.changeState( "banner changed", data)
    }

    handleBannerClose() {
        this.setState({
            bannerType: "hidden"
        })
    }

    loadTable(acct, table) {
        console.log("requesting table: ", table)
        Pubsub.publish(events.actions.loadTable, { acct, table })
        this.updateBanner({
            bannerType: "warning",
            bannerPrompt: "table is loading, please wait"
        })
    }

    getConflictsData() {
        return true
    }

    checkConflicts() {
        let acct = this.state.acctSelected
        let checkTables = (table) => {
            if ( this.state.accts[acct][table].length > 0 ) return true
        }
        if (
            this.state.tableSelected === "CONFLICTS" &&
            checkTables("AUTOA") &&
            checkTables("AUTOB")
        ) {
            return true
        }
    }

    handleRestRes(data) {
        let { acct, body, table } = data
        console.log("table is: ", table)
        if (!this.state.accts[acct][table]) {
            this.state.accts[acct][table] = []
        }
        this.state.accts[acct][table].push([body])
        this.updateBanner({
            bannerType: "ok",
            bannerPrompt: "table is loaded, Good Luck!"
        })
    }

    componentWillMount() {
        globalVar.receiveRestRes = (event, data) => {
            // handle data returned from restAPI response
            console.log("received API response")
            this.handleRestRes(data)
        }

        Pubsub.subscribe(events.res.restApi, globalVar.receiveRestRes)

        globalVar.accountValidation = (event, data) => {
            let { acct, pass } = data
            resultType = pass ? "ok" : "alert"
            resultPrompt = pass ? `account ${acct} is ready` : "account not found in ordentry"
            updateBanner({
                bannerType: resultType, 
                bannerPrompt: resultPrompt
            })
        }

        Pubsub.subscribe(events.res.validation, globalVar.accountValidation)
    }

    renderTable() {
        if (! this.state.restPending) return
        let acct = this.state.acctSelected
        let table = this.state.tableSelected
        // $$ this.state.acct.table.length>0
        // if a table is selected and the selected account has table data loaded
        if (table) {
            let tableReady = this.state.accts[acct][table] ? true : false
            let tArr, dTable, data
            if (!tableReady) {
                this.state.accts[acct][table] = []
                this.state.accts[acct][table][0] = []
            }
            tArr = table ? this.state.accts[acct][table] : []
            data = tArr[tArr.length-1]
            try {
                dTable = tArr.length > 0 ? JSON.parse(data) : []
            }
            catch(e) {
                console.error(e)
                alert("render failed, check account number!")
                return
            }
            if (table && table !== "CONFLICTS") {
                return (
                    <Table selector="data" title={table} data={dTable}/>
                )
            } else {
                if (this.checkConflicts() === true) {
                    data = this.getConflictsData()
                    return (
                        <Table selector="conflicts" title="conflicts data" data={data}/>
                    )
                }
            }
        }
    }

    render() {
        let acctsArr = this.flatAccts()
        let accts = makeElems(acctsArr)
        let tables = makeElems( 
            eventKeys.concat(multiKeys).concat(filterKeys)
        )
        let {
            acctSelected,
            acctInput,
            tableSelected,
            bannerType,
            bannerPrompt
        } = this.state

        return (
            <div className="App">
                <Input selector="acctInput" prompt="enter an account"
                 val={validateAcctInput(acctInput)}
                 onInputChange={this.handleAcctInputChange.bind(this)}
                 onInputSubmit={this.handleAcctQuery.bind(this)} />
                <Select val={acctSelected} selector="acctSelect"
                 prompt="select an account" options={accts} />
                <Select val={tableSelected} selector="tableSelect"
                 prompt="select a table" options={tables}
                 onSelectChange={this.handleTableChange.bind(this)} />
                <Button selector="loadTableBtn" prompt="load table"
                 onButtonClick={this.handleTableLoad.bind(this)} />
                <Banner type={bannerType} prompt={bannerPrompt}
                 selector="statusBanner hidden"
                 onBannerClose={this.handleBannerClose.bind(this)} />
                <p>{acctsArr.length + " accts loaded, selected: "
                 + acctSelected + " " + tableSelected}</p>
                {this.renderTable()}
            </div>
        )
    }
}

export default App

// on table select change check cache and update banner if not loaded

// this.updateBanner({
//     bannerType: "",
//     bannerPrompt: ""
// })