import React, { Component } from 'react'
import { withRouter } from 'react-router'
import Header from './../../Components/Header'
import { compose } from 'redux';
import { view, store } from 'react-easy-state';
import listStore from '../../Components/DataStore'
import { SketchPicker } from 'react-color'
import { Button, Modal } from 'react-bootstrap'
import DeleteModal from './DeleteIMainListModal'
import Fireworks from './../../Components/Fireworks'
import firebase from '../../firebase'
import Database from '../../Components/Database'
import MessagePrompt from '../../Components/MessagePrompt'

class EditSubList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      fromLocation: this.props.location.state.fromLocation,
      mainListId: listStore.mainListId,
      subListId: listStore.subListId,
      subListTitle: listStore.subListTitle,
      mainListTitle: listStore.mainListTitle,
      mainListOrderIndex: listStore.mainListOrderIndex,
      subListOrderIndex: listStore.subListOrderIndex,
      foregroundColor: listStore.subListForegroundColor,
      backgroundColor: listStore.subListBackgroundColor
    }
    this.handleEditClose = this.handleEditClose.bind(this)
    this.handleDelShow = this.handleDelShow.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleIndexChange = this.handleIndexChange.bind(this)
    this.handleIndexIncrement = this.handleIndexIncrement.bind(this)
    this.handleIndexDecrement = this.handleIndexDecrement.bind(this)
    this.setForegroundState = this.setForegroundState.bind(this)
    this.setBackgroundState = this.setBackgroundState.bind(this)
    this.handleSavePrompt = this.handleSavePrompt.bind(this)
  }

  componentWillMount () {

  }

  handleEditClose () {
    if(this.state.fromLocation == 'items') {
      /*this.props.history.push({
        pathname: '/SubLists/' + this.state.subListTitle.split(' ').join(''),
        state: {
          mainListId: this.state.mainListId,
          subListId: this.state.subListId,
          subListTitle: this.state.subListTitle,
          mainListTitle: this.state.mainListTitle,
          mainListOrderIndex: this.state.mainListOrderIndex,
          subListOrderIndex: this.state.subListOrderIndex,
          foregroundColor: this.state.foregroundColor,
          backgroundColor: this.state.backgroundColor
        }
      })*/
      this.props.history.goBack()
    } else {
      /*this.props.history.replace('/Lists/' + this.state.mainListTitle.split(' ').join(''))*/
      this.props.history.goBack()
    }
  }

  handleChange (e) {
    this.setState({
      subListTitle: e.target.value
    })
  }

  handleIndexChange (e) {
    this.setState({
      subListOrderIndex: e.target.value
    })
  }

  handleIndexIncrement () {
    let incrementedIndex = parseInt(this.state.subListOrderIndex) + 1
    this.setState({
      subListOrderIndex: incrementedIndex
    })
  }

  handleIndexDecrement () {
    if (this.state.subListOrderIndex > 1) {
      let decrementIndex = parseInt(this.state.subListOrderIndex) - 1
      this.setState({
        subListOrderIndex: decrementIndex
      })
    } else {
      alert('Index cannot be 0!')
    }
  }

  handleBackgroundChange (color) {
    this.setState({
      backgroundColor: color.hex
    })
  }

  handleForegroundChange (color) {
    this.setState({
      foregroundColor: color.hex
    })
  }

  setForegroundState () {
    if (this.state.showBackgroundEdit) {
      this.setState({
        showBackgroundEdit: false
      })
    }
    this.setState({
      showForegroundEdit: !this.state.showForegroundEdit,
      foreBtnColor: 'green'
    })
  }

  setBackgroundState () {
    if (this.state.showForegroundEdit) {
      this.setState({
        showForegroundEdit: false
      })
    }
    this.setState({
      showBackgroundEdit: !this.state.showBackgroundEdit
    })
  }

  editList () {
    let userId = firebase.auth().currentUser.uid
    if(this.state.subListTitle) {
      Database.editSubList(userId, this.state.mainListId, this.state.subListId, this.state.subListTitle, this.state.subListOrderIndex, this.state.backgroundColor, this.state.foregroundColor)
      listStore.subListId = this.state.subListId
      listStore.subListTitle = this.state.subListTitle
      listStore.subListOrderIndex = this.state.subListOrderIndex
      listStore.subListBackgroundColor = this.state.subListBackgroundColor
      listStore.subListForegroundColor = this.state.subListForegroundColor
      this.handleSavePrompt()
    }
  }

  handleSavePrompt () {
    this.setState({showSavePrompt: true})
    setTimeout(function () { this.setState({showSavePrompt: false}) }.bind(this), 2000)
    setTimeout(function () {
      if(this.state.fromLocation == 'items') {
        this.props.history.replace('/SubLists/' + this.state.subListTitle.split(' ').join(''))
        /*this.props.history.push({
          pathname: '/SubLists/' + this.state.subListTitle.split(' ').join(''),
          state: {
            mainListId: this.state.mainListId,
            subListId: this.state.subListId,
            subListTitle: this.state.subListTitle,
            mainListTitle: this.state.mainListTitle,
            mainListOrderIndex: this.state.mainListOrderIndex,
            subListOrderIndex: this.state.subListOrderIndex,
            foregroundColor: this.state.foregroundColor,
            backgroundColor: this.state.backgroundColor
          }
        })*/
      } else {
        this.props.history.replace('/Lists/' + this.state.mainListTitle.split(' ').join(''))
      }
    }.bind(this), 1000)
  }

  handleDelShow () {
    this.props.history.push({
      pathname: '/DeleteSubList-' + this.state.subListTitle,
      state: {
        fromLocation: 'items',
        subListId: this.state.subListId,
        subListTitle: this.state.subListTitle
      }
    })
  }

  render () {
    return (
      <div>
        <Header/>
        <div>
          <Modal.Body>
            <div>
              <Modal.Title id="listModalTitle" className='black-text'>
                <a id="editDelBtn" onClick={() => this.handleDelShow()}>
                  <div className='icon-shadow-container'><i
                    id="delIcon" className="fas fa-trash-alt fa-sm"></i></div>
                </a>
                Edit
                <a id="closeEditBtn" onClick={this.handleEditClose}>
                  <div className='icon-shadow-container'><i className="fas fa-times fa-sm"></i></div>
                </a>
              </Modal.Title>
            </div>
            <div id="addItemDiv">
              <div id="editNameContainer">
                <h3 id="editNameLabel">Name:</h3>
                <input id="submitText" className='inset-border' type="text" name="subListTitle"
                       placeholder={this.state.subListTitle}
                       value={this.state.subListTitle}
                       onChange={this.handleChange}/>
              </div>
            </div>
            <div className='indexOrderHeaderDiv'>
              <h4 id="indexOrderHeader">Order</h4>
            </div>
            <div id="editIndexDiv">

              <div id="editNameContainer">
                <h3 id="editNameLabel" style={{paddingLeft: 5}}>Index:</h3>
                <input id="submitText" className="indexInputFormat inset-border" type="text" name="subListOrderIndex"
                       placeholder="1"
                       value={this.state.subListOrderIndex} onChange={this.handleIndexChange}/>
                <div id="indexAdjustContainer">
                  <a onClick={this.handleIndexDecrement}><i className="fas fa-angle-up fa-3x"></i></a>
                  <a onClick={this.handleIndexIncrement}><i className="fas fa-angle-down fa-3x"></i></a>
                </div>
              </div>
            </div>
            <div id="backForeEditContainer">
              <div id="backForeEditBtn">
                <button bsSize="xsmall" className="colorPickerBtns" onClick={this.setBackgroundState.bind(this)}
                        style={this.state.showBackgroundEdit ? {backgroundColor: 'green'} : null}>Background Color
                </button>
                <button id="foreBtn" bsSize="xsmall" className="colorPickerBtns"
                        onClick={this.setForegroundState.bind(this)}
                        style={this.state.showForegroundEdit ? {backgroundColor: 'green'} : null}>Foreground Color
                </button>
                {this.state.showBackgroundEdit ? <SketchPicker className="colorPicker"
                                                               color={this.state.backgroundColor}
                                                               onChangeComplete={this.handleBackgroundChange.bind(this)}/> : null
                }

                {this.state.showForegroundEdit ? <SketchPicker className="colorPicker"
                                                               color={this.state.foregroundColor}
                                                               onChangeComplete={this.handleForegroundChange.bind(this)}/> : null
                }
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className='edit-footer'>
            {/*<Button onClick={this.handleEditClose.bind(this)} data-dismiss="modal">Cancel</Button>*/}
            <Button className='edit-save-btn' bsStyle="info" bsSize="large" block onClick={() => {
              this.editList()
              this.setState({showEditModal: false})
            }} data-dismiss="modal">Save</Button>
          </Modal.Footer>
        </div>
        {this.state.showSavePrompt ? <MessagePrompt message='Saved!'/> : null}
        {/*{this.state.showDelModal ? <DeleteModal mainListId={this.state.mainListId}
                                                subListTitle={this.state.subListTitle} />: null}*/}
        {/*<Fireworks/>*/}
      </div>
    )
  }
}

export default compose(withRouter, view)(EditSubList)