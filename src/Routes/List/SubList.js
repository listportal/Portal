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
      newSublistNameInput: ''
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleListClose = this.handleListClose.bind(this)
    this.handleSubListSubmit = this.handleSubListSubmit.bind(this);
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
                  <text fill="white" x="50%" y="50%" alignmentBaseline="middle" textAnchor="middle">{this.state.mainListTitle}</text>
                </g>
              </g>
              </svg>
            </div>*/}
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
                {this.state.subLists.map((subList) => {
                  return (
                      <Animated animationIn="flipInX" animationOut="fadeOut" isVisible={true}>
                      <li id="mainItems" key={subList.id}>
                        <div id="mainListBtnContainer">
                          <div id="listBtns" style={{backgroundColor:subList.backgroundColor, marginBottom: 25, padding: 8}}>
                            <a onClick={this.handleEditShow.bind(this, subList.id, subList.title, subList.orderIndex, subList.backgroundColor, subList.foregroundColor)} style={{float: 'right'}}><i id="editIcon" className="fas fa-edit"></i></a>
                            <a id="mainListBtn" onClick={this.showItems.bind(this, subList.id, subList.title, subList.orderIndex, subList.backgroundColor, subList.foregroundColor)}><div style={{color:subList.foregroundColor}}>{subList.title} <p style={{color:subList.foregroundColor, fontSize: 16}} >{subList.count} Item(s)</p></div></a>
                          </div>
                        </div>
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
        {/*{this.state.showDelModal ? <DeleteModal mainListId={this.state.mainListId}
                                                subListTitle={this.state.subListTitle} />: null}*/}
        {/*<Fireworks/>*/}
      </div>
    )
  }
}

export default compose(withRouter, view)(SubList)