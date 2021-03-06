import React, { Component } from 'react';
import { connect } from 'react-redux';
// library
import { createSelectOptions, showIfTrue } from '../services/';
import { Select, Button } from '../components/';
import {
  // action creators
  changeTable,
  changeType,
  restRequest,
  dispatchRestResponse,
  // action keys
  tables
} from '../store/';
const { getTables } = tables;

const messageColor = status => {
  switch (status) {
    case 'loading':
      return 'orange';
    case 'success':
      return 'green';
    case 'fail':
      return 'red';
    default:
      return 'black';
  }
};

// reducer
class TableOptionsContainer extends Component {
  state = {
    types: ['constructed', 'local', 'global'],
    tables: getTables(this.props.type),
    visible: false
  };
  componentWillReceiveProps(newProps) {
    this.setState({
      visible: Object.keys(newProps.accts).length > 0 ? true : false
    });
  }

  handleTypeChange = e => {
    this.setState({ tables: getTables(e.target.value) });
    this.props.changeType({
      type: e.target.value,
      acct: this.props.selectedAcct,
      accts: this.props.accts,
      view: tables.default[e.target.value]
    });
  };
  handleTableChange = e => {
    this.props.changeTable({
      type: this.props.type,
      acct: this.props.selectedAcct,
      accts: this.props.accts,
      view: e.target.value
    });
  };
  handleTableLoad = () => {
    this.props.restRequest({
      acct: this.props.selectedAcct,
      type: this.props.type,
      view: this.props.table
    });
  };

  render() {
    return (
      <div
        style={{
          display: this.state.visible ? 'block' : 'none',
          marginBottom: '20px'
        }}>
        <Select
          prompt='Type of Table: '
          value={this.props.type}
          options={createSelectOptions(this.state.types)}
          change={this.handleTypeChange}
        />
        <Select
          prompt='Which Table: '
          value={this.props.table}
          options={createSelectOptions(this.state.tables)}
          change={this.handleTableChange}
        />
        <div>
          <Button
            style={{ display: 'inline' }}
            prompt='load table'
            click={this.handleTableLoad}
          />
          <p
            style={{
              display: 'inline',
              marginLeft: '15px',
              color: messageColor(this.props.status)
            }}>
            {this.props.message}
          </p>
        </div>
      </div>
    );
  }
}

const mapState = state => {
  return {
    type: state.tableOptions.type,
    table: state.tableOptions.table,
    status: state.tableOptions.status,
    message: state.tableOptions.message,
    // state from accts reducer
    accts: state.accts.accts,
    selectedAcct: state.accts.selectedAcct
  };
};

const mapDispatch = dispatch => {
  return {
    loadCache: data => dispatch(loadCache(data)),
    changeType: data => dispatch(changeType(data)),
    changeTable: data => dispatch(changeTable(data)),
    restRequest: data => dispatch(restRequest(data)),
    dispatchRestResponse: data => dispatch(dispatchRestResponse(data))
  };
};

export default connect(
  mapState,
  mapDispatch
)(TableOptionsContainer);
