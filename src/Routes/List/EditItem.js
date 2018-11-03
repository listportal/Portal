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

class EditItem extends Component {
  constructor (props) {
    super(props)
    this.state = {
      mainListId: listStore.mainListId,
      subListId: listStore.subListId,
      subListTitle: listStore.subListTitle,
      mainListTitle: listStore.mainListTitle,
      mainListOrderIndex: listStore.mainListOrderIndex,
      subListOrderIndex: listStore.subListOrderIndex,
      foregroundColor: listStore.subListForegroundColor,
      backgroundColor: listStore.subListBackgroundColor,
      itemId: listStore.itemId,
      itemTitle: listStore.itemTitle
    }
    this.handleEditClose = this.handleEditClose.bind(this)
    this.handleDelShow = this.handleDelShow.bind(this)
    this.handleChange = this.handleChange.bind(this)
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
      this.props.history.replace('/SubLists/' + this.state.subListTitle.split(' ').join(''))
    } else {
      /*this.props.history.replace('/Lists/' + this.state.mainListTitle.split(' ').join(''))*/
      this.props.history.replace('/SubLists/' + this.state.subListTitle.split(' ').join(''))
    }
  }

  handleChange (e) {
    this.setState({
      itemTitle: e.target.value
    })
  }

  editItem () {
    let userId = firebase.auth().currentUser.uid
    if(this.state.itemTitle) {
      Database.editItem(userId, this.state.mainListId, this.state.subListId, this.state.itemId, this.state.itemTitle)
      listStore.itemTitle = this.state.itemTitle
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
        this.props.history.replace('/SubLists/' + this.state.subListTitle.split(' ').join(''))
      }
    }.bind(this), 1000)
  }

  handleDelShow () {
    listStore.itemId = this.state.itemId
    listStore.itemId = this.state.itemId
    listStore.itemTitle = this.state.itemTitle
    this.props.history.push({
      pathname: "/DeleteItem/" + this.state.itemTitle.split(' ').join('')
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
                       placeholder={this.state.itemTitle}
                       value={this.state.itemTitle}
                       onChange={this.handleChange}/>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className='edit-footer'>
            {/*<Button onClick={this.handleEditClose.bind(this)} data-dismiss="modal">Cancel</Button>*/}
            <Button className='edit-save-btn' bsStyle="info" bsSize="large" block onClick={() => {
              this.editItem()
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

export default compose(withRouter, view)(EditItem)