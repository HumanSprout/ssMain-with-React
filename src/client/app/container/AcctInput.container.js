import React, { Component } from 'react'
import { connect } from 'react-redux'
import Pubsub from 'pubsub-js'

import Input from '../components/Input'
import validateAcct from '../services/validateAcct'

// action creators

import {
    SUBMIT_ACCT_INPUT
    } from '../store/actions/'

class AcctInput extends Component {
    constructor(props) {
        super(props),
        this.state = {
            inputValue: ''
        }
    }

    handleInputChange(val) {
        this.setState({inputValue: val})
    }

    handleInputSubmit() {
        this.props.submit(this.state.inputValue)
        this.setState({inputValue: ""})
    }

    render() {
        return(
            <div>
                <Input
                prompt="Enter an Account #:"
                selector="acctInput"
                value={this.state.inputValue}
                change={ (e) => {this.handleInputChange(e.target.value)} }
                submit={ () => {this.handleInputSubmit()} }
                />
                <p>entered: {this.state.inputValue}</p>
                <p>submitted: {this.props.submitted}</p>
            </div>
        )
    }
}

const mapState = state => {
    return {
        submitted: state.acctInput.submitted
    }
}

const mapDispatch = dispatch => {
    return {
        submit: (value) => dispatch( { type: SUBMIT_ACCT_INPUT, value: value } )
    }
}

export default connect(mapState, mapDispatch)(AcctInput)