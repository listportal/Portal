import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { compose } from 'redux';
import { view, store } from 'react-easy-state';
import Header from './../../Components/Header'
import { SketchPicker } from 'react-color'
import { Button, Modal } from 'react-bootstrap'
import DeleteModal from './DeleteIMainListModal'
import Fireworks from './../../Components/Fireworks'
import firebase from '../../firebase'
import Database from '../../Components/Database'
import MessagePrompt from '../../Components/MessagePrompt'
import listStore from '../../Components/DataStore'

class EditList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      /*fromLocation: this.props.location.state.fromLocation,
      listId: this.props.location.state.listId,
      listTitle: this.props.location.state.listTitle,
      orderIndex: this.props.location.state.orderIndex,
      foregroundColor: this.props.location.state.foregroundColor,
      backgroundColor: this.props.location.state.backgroundColor*/
      fromLocation: this.props.location.state.fromLocation,
      listId: listStore.mainListId,
      listTitle: listStore.mainListTitle,
      orderIndex: listStore.mainListOrderIndex,
      foregroundColor: listStore.mainListForegroundColor,
      backgroundColor: listStore.mainListBackgroundColor
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
    if(this.state.fromLocation == 'subList') {
      this.props.history.push({
        pathname: '/Lists/' + this.state.listTitle.split(' ').join(''),
        state: {
          mainListId: this.state.listId,
          mainListTitle: this.state.listTitle,
          mainListOrderIndex: this.state.orderIndex,
          mailListForegroundColor: this.state.foregroundColor,
          mainListBackgroundColor: this.state.backgroundColor
        }
      })
    } else {
      this.props.history.push('/')
    }
  }

  handleChange (e) {
    this.setState({
      listTitle: e.target.value
    })
  }

  handleIndexChange (e) {
    this.setState({
      orderIndex: e.target.value
    })
  }

  handleIndexIncrement () {
    let incrementedIndex = parseInt(this.state.orderIndex) + 1
    this.setState({
      orderIndex: incrementedIndex
    })
  }

  handleIndexDecrement () {
    if (this.state.orderIndex > 1) {
      let decrementIndex = parseInt(this.state.orderIndex) - 1
      this.setState({
        orderIndex: decrementIndex
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
    if(this.state.listTitle) {
      Database.editMainList(userId, this.state.listId, this.state.listTitle, this.state.orderIndex, this.state.backgroundColor, this.state.foregroundColor)
      listStore.mainListId = this.state.listId
      listStore.mainListTitle = this.state.listTitle
      listStore.mainListOrderIndex = this.state.orderIndex
      listStore.mainListBackgroundColor = this.state.backgroundColor
      listStore.mainListForegroundColor = this.state.foregroundColor
      this.handleSavePrompt()
    }
  }

  handleSavePrompt () {
    this.setState({showSavePrompt: true})
    setTimeout(function () { this.setState({showSavePrompt: false}) }.bind(this), 2000)
    setTimeout(function () {
      if(this.state.fromLocation == 'subList') {
        this.props.history.replace(
          '/Lists/' + this.state.listTitle.split(' ').join('')
        )
      } else {
        this.props.history.replace('/')
      }
    }.bind(this), 1000)
  }

  handleDelShow () {
    this.props.history.push({
      pathname: '/DeleteList-' + this.state.listTitle,
      state: {
        listId: this.state.listId,
        listTitle: this.state.listTitle
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
                <input id="submitText" className='inset-border' type="text" name="listTitle"
                       placeholder={this.state.listTitle}
                       value={this.state.listTitle}
                       onChange={this.handleChange}/>
              </div>
            </div>
            <div className='indexOrderHeaderDiv'>
              <h4 id="indexOrderHeader">Order</h4>
            </div>
            <div id="editIndexDiv">

              <div id="editNameContainer">
                <h3 id="editNameLabel" style={{paddingLeft: 5}}>Index:</h3>
                <input id="submitText" className="indexInputFormat inset-border" type="text" name="orderIndex"
                       placeholder="1"
                       value={this.state.orderIndex} onChange={this.handleIndexChange}/>
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
        {/*{this.state.showDelModal ? <DeleteModal listId={this.state.listId}
                                                listTitle={this.state.listTitle} />: null}*/}
        {/*<Fireworks/>*/}
      </div>
    )
  }
}

export default compose(withRouter, view) (EditList)