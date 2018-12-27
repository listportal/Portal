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
import Confetti from 'react-dom-confetti'
import { ConfettiConfig } from '../../Components/ConfettiConfig'
import $ from 'jquery'

import {Animated} from "react-animated-css";

class Items extends Component {
  constructor (props) {
    super(props)
    this.state = {
      items: [],
      mainListId: listStore.mainListId,
      mainListTitle: listStore.mainListTitle,
      mainListOrderIndex: listStore.mainListOrderIndex,
      subListId: listStore.subListId,
      subListTitle: listStore.subListTitle,
      subListOrderIndex: listStore.subListOrderIndex,
      subListForegroundColor: listStore.subListForegroundColor,
      subListBackgroundColor: listStore.subListBackgroundColor,
      itemTitle: '',
      newSublistNameInput: '',
      itemsToDelete: []
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleListClose = this.handleListClose.bind(this)
    this.handleSubListSubmit = this.handleSubListSubmit.bind(this);
    this.handleDeleteCheckBoxChange = this.handleDeleteCheckBoxChange.bind(this);
  }

  componentWillMount () {
    let userId =  firebase.auth().currentUser.uid;
    const listRef = firebase.database().ref('Users/' + userId + '/Lists');
    listRef.child(this.state.mainListId).child(this.state.subListId).on('value', (snapshot) => {
      let items = snapshot.val();
      let childState = [];
      for (let item in items) {
        if(typeof(items[item].title) !== 'undefined') {
          childState.push({
            id: item,
            title: items[item].title
          });
        }
      }
      this.setState({
        items: childState
      });
    });
  }

  handleListClose () {
    this.props.history.push({
      pathname: "/Lists/" + this.state.mainListTitle.split(' ').join(''),
      state: {
        mainListId: this.state.mainListId,
        subListId: this.state.subListId,
        listTitle: this.state.listTitle,
        mainListTitle: this.state.mainListTitle,
        orderIndex: this.state.orderIndex,
        subListOrderIndex: this.state.subListOrderIndex,
        subListBackgroundColor: this.state.subListBackgroundColor,
        foregroundColor: this.state.foregroundColor
      }
    });
  }

  handleEditShow (itemId, itemTitle) {
    console.log(itemId)
    listStore.itemId = itemId
    listStore.itemTitle = itemTitle
    /*this.setState({
      listTitle: listTitle,
      listId: listId,
      orderIndex: orderIndex,
      backgroundColor: backgroundColor,
      foregroundColor: foregroundColor
    })*/
    /*this.setState({ showEditModal: true });*/
    this.props.history.push({
      pathname: "/EditItem/" + itemTitle.split(' ').join('')
    })
  }

  handleItemDelShow(itemId, itemTitle) {
    listStore.itemId = itemId
    listStore.itemTitle = itemTitle
    this.props.history.push({
      pathname: "/DeleteItem/" + itemTitle.split(' ').join('')
    })
  }

  handleSubListEditShow () {

    this.props.history.push({
      pathname: '/EditSubList/' + this.state.subListTitle.split(' ').join(''),
      state: {
        fromLocation: 'items',
        mainListId: this.state.mainListId,
        subListId: this.state.subListId,
        subListTitle: this.state.subListTitle,
        mainListTitle: this.state.mainListTitle,
        mainListOrderIndex: this.state.mainListOrderIndex,
        subListOrderIndex: this.state.subListOrderIndex,
        subListForegroundColor: this.state.subListForegroundColor,
        subListBackgroundColor: this.state.subListBackgroundColor
      }
    })
  }

  handleSubListSubmit (e) {
    e.preventDefault()
    let userId = firebase.auth().currentUser.uid
    let mainListId = this.state.mainListId
    let orderIndex = this.state.subLists.length + 1
    let listName = this.state.newSubListNameInput

    Database.createSubList(userId, mainListId, listName, orderIndex)

    let that = this
    $.ajax({
      url: this.setSubListConfettiState(),
      success: function () {
        that.setSubListConfettiState()
      }
    })

    this.setState({
      newSubListNameInput: ''
    })
  }

  setItemConfettiState() {
    this.setState({
      showItemConfetti: !this.state.showItemConfetti
    });
  }

  handleChange (e) {
    this.setState({
      newItemNameInput: e.target.value
    })
  }

  showItems(subListId, subListTitle, subListOrderIndex, subListBackgroundColor, subListForegroundColor) {
    let userId =  firebase.auth().currentUser.uid;
    const listRef = firebase.database().ref('Users/' + userId + '/Lists');
    listRef.child(this.state.mainListId).child(subListId).on('value', (snapshot) => {
      let items = snapshot.val();
      let childState = [];
      for (let item in items) {
        if(typeof(items[item].title) !== 'undefined') {
          childState.push({
            id: item,
            title: items[item].title
          });
        }
      }
      this.setState({
        items: childState
      });
    });
    this.setState({
      subListTitle: subListTitle,
      subListId: subListId,
      subListOrderIndex: subListOrderIndex,
      subListBackgroundColor: subListBackgroundColor,
      subListForegroundColor: subListForegroundColor
    });
    this.setState({
      showSubListModal: !this.state.showSubListModal
    });
  }

  handleItemSubmit(e) {
    let userId = firebase.auth().currentUser.uid;
    e.preventDefault();

    if(this.state.newItemNameInput) {
      Database.createItem(userId, this.state.mainListId, this.state.subListId, this.state.newItemNameInput)

      var that = this;
      $.ajax({
        url: this.setItemConfettiState(),
        success: function () {
          that.setItemConfettiState();
        }
      });

      this.setState({
        newItemNameInput: ''
      });
    }
  }

  handleDeleteCheckBoxChange (e, itemId) {
    let itemsToDelete = this.state.itemsToDelete;
    if (e.target.checked) {
      console.log('Checked!')
      itemsToDelete.push(itemId);
    } else {
      let pos = itemsToDelete.indexOf(itemId);
      console.log('Pos:' + pos);
      console.log('Unchecked')
      itemsToDelete.splice(pos, 1)
    }

    // this.setState({
    //   itemsToDelete: deleteItems
    // });
    //let item;
    this.state.itemsToDelete.forEach(function(item, index, array) {
      console.log(item, index);
    });

    //console.log(this.state.itemsToDelete[0])

  }

  handleBulkItemDelete () {
    let userId =  firebase.auth().currentUser.uid;
    Database.bulkDeleteItems(userId, this.state.mainListId, this.state.subListId, this.state.itemsToDelete);
  }

  handleDeleteAllItems () {
    let userId =  firebase.auth().currentUser.uid;
    Database.deleteAllItems(userId, this.state.mainListId, this.state.subListId, this.state.items);
  }

  /*handleItemClick(itemId, itemTitle) {
    this.setState({
      itemBackgroundColor: '#29516f',
      itemForegroundColor: '#FFFFFF'
    })

  }*/

  render () {
    const config = {ConfettiConfig}
    return (
      <div id='App' className='container-fluid' style={{textAlign: 'inherit'}}>
        <Header/>
        <div>
          <Modal.Title id="listModalTitle">
            <a
              onClick={this.handleSubListEditShow.bind(this)}
              id="editMainListBtn" className='edit-icon-shadow margin-adjust inset-box-shadow'>
              <div className='icon-shadow-container'><i id="editIcon" className="fas fa-edit fa-xs"
                                                        style={{color: 'green'}}></i></div>
            </a>
            <div className='title-div' style={{backgroundColor: this.state.subListBackgroundColor}}>
              <p className='title-text' style={{color: this.state.subListForegroundColor}}>{this.state.subListTitle}</p>
            </div>
            {/*<div className="ribbon">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                   viewBox="0 0 500 150" enableBackground="new 0 0 500 150" xmlSpace="preserve" preserveAspectRatio="xMaxYMax meet">
                <g id="Layer_2">
                  <g id="Ribbon">
                    <path fill="#5cabc5" d="M474.657,37.5l-6.875,32.928c-0.562,2.692-0.562,6.452,0,9.144l6.875,32.928H253h-6H25.343l6.875-32.928
                    c0.562-2.692,0.562-6.452,0-9.144L25.343,37.5H247h6H474.657 M481.5,29.5H253c-1.65,0-4.35,0-6,0H18.5
                    c-1.65,0-2.724,1.322-2.387,2.937l8.274,39.627c0.337,1.615,0.337,4.258,0,5.873l-8.274,39.627
                    c-0.337,1.615,0.737,2.937,2.387,2.937H247c1.65,0,4.35,0,6,0h228.5c1.65,0,2.724-1.322,2.387-2.937l-8.274-39.627
                    c-0.337-1.615-0.337-4.258,0-5.873l8.274-39.627C484.224,30.822,483.15,29.5,481.5,29.5L481.5,29.5z"/>
                    <text fill="white" x="50%" y="50%" alignmentBaseline="middle" textAnchor="middle">{this.state.subListTitle}</text>
                  </g>
                </g>
              </svg>
            </div>*/}
            <a id="closeListBtn" className='margin-adjust' onClick={this.handleListClose}>
              <div className='icon-shadow-container inset-box-shadow'><i className="fas fa-times fa-xs"></i></div>
            </a>
          </Modal.Title>
          <form ref="itemSubmitForm" id="createListDiv" className="addItemDiv" style={{marginTop: 0, marginBottom: 10}}
                onSubmit={this.handleItemSubmit.bind(this)}>
            <div id="addItemContainer">
              <input className="box-shadow" ref="itemName" id="submitText" type="text" name="newItemNameInput" placeholder="New Item"
                     value={this.state.newItemNameInput} onChange={this.handleChange.bind(this)}/>
              <a className='edit-icon-shadow submit-btn-padding' style={{color: 'darkslategrey'}} onClick={this.handleItemSubmit.bind(this)}><div className='icon-shadow-container'><i
                className="fas fa-plus fa-lg"></i></div></a>
            </div>
          </form>
          <div className='confetti-div'>
            <Confetti active={ this.state.showItemConfetti } config={ config }/>
          </div>
          <div className='item-delete-btn-container'>
            <Button className='item-delete-btn box-shadow' bsStyle="info" bsSize="small" onClick={this.handleBulkItemDelete.bind(this)}>Delete</Button>
            <Button className='item-delete-btn box-shadow' bsStyle="info" bsSize="small" onClick={this.handleDeleteAllItems.bind(this)}>Delete All</Button>
          </div>
          <hr className="hrFormat" style={{marginLeft: '10px', marginRight: '10px', marginBottom: '30px'}}/>
          <section className="jumbotron" id="mainListSection" style={{paddingTop: 25}}>
            <div className="wrapper">
              <ol id="itemsList">
                {this.state.items.map((item) => {
                  return (
                    <Animated animationIn="flipInX" animationOut="fadeOut" isVisible={true}>
                    <li id="items" key={item.id}>
                      <input ref={item.id} type="checkbox" onChange={(e) => this.handleDeleteCheckBoxChange(e, item.id)} ></input><div ><p style={{marginBottom: 0, fontWeight: 'normal'}}>{item.title}</p></div><div style={{display: 'flex'}}><a onClick={() => this.handleEditShow(item.id, item.title)} style={{color: 'green'}}><i id="editIcon" className="fas fa-edit" style={{color: 'green'}}></i></a><a onClick={() => this.handleItemDelShow(item.id, item.title)} style={{marginLeft: 20}}><i id="delIcon" className="fas fa-trash-alt"></i></a></div>
                    </li>
                    </Animated>
                  )
                })}
              </ol>
              {/*<h2 className="letterSpacing">{this.state.subListTitle} Sub-Lists</h2>
              <hr className="hrFormat"
                  style={{borderColor: '#343a40', marginLeft: '10px', marginRight: '10px', marginBottom: '5px'}}/>*/}
            </div>
          </section>
          <Modal.Footer className='edit-footer'>
            <Button onClick={this.handleListClose} className='edit-save-btn box-shadow' bsStyle="info" bsSize="large"
                    block>Close</Button>
          </Modal.Footer>
        </div>
        {this.state.showSavePrompt ? <MessagePrompt message='Saved!'/> : null}
        {/*{this.state.showDelModal ? <DeleteModal listId={this.state.listId}
                                                subListTitle={this.state.subListTitle} />: null}*/}
        {/*<Fireworks/>*/}
      </div>
    )
  }
}

export default compose(withRouter, view)(Items)