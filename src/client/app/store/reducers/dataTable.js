// library
import {
    getLast,
    filterTable,
    cleanArr,
} from '../../services'
// action keys
import {
    tables,
    // redux actions
    LOAD_TABLE,
    RENDER_TABLE,
    TABLE_NOT_CACHED,
} from '../actions/'
// state
const initialState = {
    tableData: [],
    columns: []
}
const filterRows = (filter, row, column) => {
    return row._original[column].toUpperCase().includes(
        filter.value.toUpperCase()
    )
}
let getHeaders = ( obj, headers = [] ) => {
    Object.keys(obj).map( (header) => headers.push( {
            Header: header,
            accessor: header,
            id: header,
            filterAll: false,
            filterMethod: (filter, row) => filterRows(filter, row, header)
        })
    )
    return headers
}
// action creators
export const renderTable = data => {
    if (data.body.length < 1) return {type: TABLE_NOT_CACHED}
    return {
        type: RENDER_TABLE,
        columns: getHeaders( data.body[0] ),
        table: data.body,
    }
}
const loadCompoundFromCache = data => {
    let arr = [],
        { type, acct, optTable, accts } = data
    // map over tables list
    tables.compoundLists[optTable].map( targetTable => {
        // filter and concat most recent cache
        targetTable = tables.revertKeys[targetTable]
        // if cache has data
        if (accts[acct][targetTable].length > 0) {
            // filter and aggregate data
            arr = arr.concat(
                filterTable(
                    targetTable,
                    getLast( accts[acct][targetTable] ),
                    optTable
                )
            )
        }
    })
    return { body: cleanArr(arr) }
}
export const loadCache = data => {
    data = Object.assign( {}, data )
    let { type, acct, optTable, accts } = data
    if ( tables.lists.compound.includes(optTable) ) {
        return loadCompoundFromCache(data)
    }
    if (accts[acct][optTable].length > 0) {
            data.body = filterTable( 
                optTable, 
                getLast( accts[acct][optTable] )
            )
            data.isCached = true
    } else {
        data.body = []
    }
    return data
}
// reducer
export const dataTable = (state = initialState, action) => {
    let warning
    switch (action.type) {
        case RENDER_TABLE:
            warning = action.isCached ?
                'table from cache, re-load for newest version' : ''
            return {
                ...state,
                tableData: action.table,
                columns: action.columns,
                visible: true,
                message: warning
            }
        case TABLE_NOT_CACHED:
            return { ...state, visible: false}
        default:
            return state
    }
    return state
}