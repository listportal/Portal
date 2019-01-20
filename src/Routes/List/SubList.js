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
import {Animated} from "react-animated-css";
import $ from 'jquery'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'


const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  return result
}

class SubList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      subLists: [],
      /*mainListId: this.props.location.state.mainListId,
      subListId: '',
      subListTitle: this.props.location.state.subListTitle,
      mainListTitle: this.props.location.state.mainListTitle,
      mainListOrderIndex: this.props.location.state.mainListOrderIndex,
      mainListForegroundColor: this.props.location.state.mainListForegroundColor,
      mainListBackgroundColor: this.props.location.state.mainListBackgroundColor,*/
      mainListId: listStore.mainListId,
      mainListTitle: listStore.mainListTitle,
      mainListOrderIndex: listStore.mainListOrderIndex,
      mainListForegroundColor: listStore.mainListForegroundColor,
      mainListBackgroundColor: listStore.mainListBackgroundColor,
      subListId: '',
      subListTitle: listStore.subListTitle,
      newSublistNameInput: '',
      animatedFlipIn: true
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleListClose = this.handleListClose.bind(this)
    this.handleSubListSubmit = this.handleSubListSubmit.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this)
  }

  componentWillMount () {
    let userId = firebase.auth().currentUser.uid;
    const listRef = firebase.database().ref('Users/' + userId + '/Lists');
    listRef.child(this.state.mainListId).on('value', (snapshot) => {
      let subLists = snapshot.val();
      let subListState = [];
      for (let subList in subLists) {
        if(typeof(subLists[subList].title) !== 'undefined') {
          listRef.child(this.state.mainListId).child(subList).on('value', (child) => {
            console.log('Title' + subLists[subList].title)
            let items = child.val();
            let count = child.numChildren();
            let adjCount = count - 4;
            subListState.push({
              id: subList,
              title: subLists[subList].title,
              count: adjCount,
              orderIndex: subLists[subList].orderIndex,
              backgroundColor: subLists[subList].backgroundColor,
              foregroundColor: subLists[subList].foregroundColor
            });
          });
        }
      }
      function sortArray(a, b) {
        const indexA = a.orderIndex;
        const indexB = b.orderIndex;

        let comparison = 0;
        if (indexA > indexB) {
          comparison = 1;
        } else if (indexA < indexB) {
          comparison = -1;
        }
        return comparison;
      };


      subListState.sort(sortArray);

      this.setState({
        subLists: subListState
      });

    });
  }

  componentDidMount() {
    setTimeout(function () {
      this.setState({animatedFlipIn: false})
    }.bind(this), 2000)
    console.log("Did Mount")
  }

  handleListClose () {
    this.props.history.push('/')
  }

  handleEditShow (subListId, subListTitle, orderIndex, backgroundColor, foregroundColor) {
    listStore.subListId = subListId
    listStore.subListTitle = subListTitle
    listStore.subListOrderIndex = orderIndex
    listStore.subListBackgroundColor = backgroundColor
    listStore.subListForegroundColor = foregroundColor

    this.props.history.push({
      pathname: '/EditSubList/' + subListTitle.split(' ').join(''),
      state: {
        mainListId: this.state.mainListId,
        subListId: subListId,
        subListTitle: subListTitle,
        orderIndex: orderIndex,
        foregroundColor: foregroundColor,
        backgroundColor: backgroundColor
      }
    })
  }

  handleMainListEditShow () {
    this.props.history.push({
      pathname: "/Lists/" + this.state.mainListTitle.split(' ').join('') + "/Edit",
      state: {
        fromLocation: 'subList',
        listId: this.state.mainListId,
        listTitle: this.state.mainListTitle,
        orderIndex: this.state.mainListOrderIndex,
        foregroundColor: this.state.mainListForegroundColor,
        backgroundColor: this.state.mainListBackgroundColor
      }
    })
  }

  handleSubListSubmit (e) {
    e.preventDefault()
    let userId = firebase.auth().currentUser.uid
    let mainListId = this.state.mainListId
    let orderIndex = this.state.subLists.length + 1
    let listName = this.state.newSubListNameInput

    if(listName) {
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
  }

  setSubListConfettiState() {
    this.setState({
      showSubListConfetti: !this.state.showSubListConfetti
    });
  }

  handleChange (e) {
    this.setState({
      newSubListNameInput: e.target.value
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
    listStore.subListId = subListId
    listStore.subListTitle = subListTitle
    listStore.subListOrderIndex = subListOrderIndex
    listStore.subListBackgroundColor = subListBackgroundColor
    listStore.subListForegroundColor = subListForegroundColor
    this.props.history.push({
      pathname: "/SubLists/" + subListTitle.split(' ').join(''),
      state: {
        mainListId: this.state.mainListId,
        subListId: subListId,
        subListTitle: subListTitle,
        mainListTitle: this.state.mainListTitle,
        orderIndex: this.state.orderIndex,
        subListOrderIndex: subListOrderIndex,
        backgroundColor: subListBackgroundColor,
        foregroundColor: subListForegroundColor
      }
    });
  }

  onDragEnd (result) {
    // dropped outside the list
    if (!result.destination) {
      return
    }

    const lists = reorder(
      this.state.subLists,
      result.source.index,
      result.destination.index
    )

    this.setState({
      lists
    })
    console.log(this.state.subLists)
    let userId = firebase.auth().currentUser.uid
    let that = this;
    lists.forEach(function(item, index, array) {

      console.log(that.state.mainListId, userId, item.id, item.orderIndex, index);
      let listRef = firebase.database().ref('Users/' + userId + '/Lists/' + that.state.mainListId + '/' +  item.id)

      listRef.update({
        orderIndex: index + 1
      })
    });
  }

  render () {
    const config = {ConfettiConfig}
    return (
      <div id='App' className='container-fluid'>
        <Header/>
        <div>
          <Modal.Title id="listModalTitle">
            <a
              onClick={this.handleMainListEditShow.bind(this)}
              id="editMainListBtn" className='edit-icon-shadow margin-adjust inset-box-shadow'>
              <div className='icon-shadow-container'><i id="editIcon" className="fas fa-edit fa-xs"
                                                        style={{color: 'green'}}></i></div>
            </a>
            <div className='title-div' style={{backgroundColor: this.state.mainListBackgroundColor}}>
              <p className='title-text' style={{color: this.state.mainListForegroundColor}}>{this.state.mainListTitle}</p>
            </div>
            <a id="closeListBtn" className='margin-adjust' onClick={this.handleListClose}>
              <div className='icon-shadow-container inset-box-shadow'><i className="fas fa-times fa-xs"></i></div>
            </a>
          </Modal.Title>
          <form ref="subListForm" id="createListDiv" className="addItemDiv" style={{marginTop: 0, marginBottom: 10}}
                onSubmit={this.handleSubListSubmit}>
            <div id="addItemContainer">
              <input className='box-shadow' ref="subListName" id="submitText" type="text" name="newSubListNameInput" placeholder="New Sub-List"
                     value={this.state.newSubListNameInput} onChange={this.handleChange.bind(this)}/>
              <a className='edit-icon-shadow submit-btn-padding' style={{color: 'darkslategrey'}} onClick={this.handleSubListSubmit.bind(this)}><div className='icon-shadow-container'><i
                className="fas fa-plus fa-lg"></i></div></a>
            </div>
          </form>
          <div className='confetti-div'>
            <Confetti active={ this.state.showSubListConfetti } config={ config }/>
          </div>
          <hr className="hrFormat" style={{marginLeft: '10px', marginRight: '10px', marginBottom: '30px'}}/>
          <section className="jumbotron" id="mainListSection">
            <div className="wrapper">
              <ol id="subList">
                <DragDropContext onDragEnd={this.onDragEnd}>
                  <Droppable droppableId="droppable">
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                      >
                {this.state.subLists.map((subList, index) => {
                  return (
                      <Animated className={this.state.animatedFlipIn ? "flipInX" : 'removeAnimation'} animationIn="flipInX" animationOut="fadeOut" isVisible={true}>
                        <Draggable key={subList.id} draggableId={subList.id} index={index}>
                          {provided => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                      <li id="mainItems" key={subList.id}>
                        <div id="mainListBtnContainer">
                          <div id="listBtns" style={{backgroundColor:subList.backgroundColor, marginBottom: 25, padding: 8}}>
                            <a onClick={this.handleEditShow.bind(this, subList.id, subList.title, subList.orderIndex, subList.backgroundColor, subList.foregroundColor)} style={{float: 'right'}}><i id="editIcon" className="fas fa-edit"></i></a>
                            <a id="mainListBtn" onClick={this.showItems.bind(this, subList.id, subList.title, subList.orderIndex, subList.backgroundColor, subList.foregroundColor)}><div style={{color:subList.foregroundColor}}><i className="fas fa-arrows-alt-v" style={{marginRight: 10}}></i>{subList.title} <p style={{color:subList.foregroundColor, fontSize: 16}} >{subList.count} Item(s)</p></div></a>
                          </div>
                        </div>
                      </li>
                            </div>
                            )}
                            </Draggable>
                      </Animated>
                  )
                })}
                      </div>
                      )}
                      </Droppable>
                      </DragDropContext>
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
        {/*{this.state.showDelModal ? <DeleteModal mainListId={this.state.mainListId}
                                                subListTitle={this.state.subListTitle} />: null}*/}
        {/*<Fireworks/>*/}
      </div>
    )
  }
}

export default compose(withRouter, view)(SubList)