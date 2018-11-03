import React, { Component } from 'react';
import { compose } from 'redux';
import { view, store } from 'react-easy-state';
import listStore from './../Components/DataStore';
import './../App.css';
import firebase from './../firebase.js';
import Database from './../Components/Database';
import EditList from './List/EditList';
import Header from './../Components/Header';
import { Modal } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import { SketchPicker } from 'react-color';
import $ from 'jquery';
import Confetti from 'react-dom-confetti';
import * as ConfettiConfig from './../Components/ConfettiConfig'
import {withRouter} from "react-router";
import {Animated} from "react-animated-css";
//const { Pool, Client } = require('pg')
//const { pg } = require('pg-native')
//var pg = require('pg');
class Home extends Component {

  constructor() {
    super();
    this.state = {
      lists: [],
      listTitle: '',
      listId: '',
      subLists: [],
      mainListOrderIndex: 0,
      backgroundColor: '',
      foregroundColor: '',
      showConfetti: false
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleEditShow = this.handleEditShow.bind(this);
  }

  componentDidMount() {
    let userId = firebase.auth().currentUser.uid;
    const listRef = firebase.database().ref('Users/' + userId + '/Lists');
    listRef.on('value', (snapshot) => {
      let lists = snapshot.val();
      let newState = [];
      let childState = [];
      for (let list in lists) {
        if(typeof(lists[list].title) !== 'undefined') {
          listRef.child(list).orderByChild('orderIndex').on('value', (child) => {
            console.log(child.val());
            /*child.forEach(function(newChild) {
              console.log(newChild.val());
            });*/
            let count = child.numChildren();
            let adjCount = count - 1;
            newState.push({
              id: list,
              title: lists[list].title,
              count: adjCount,
              orderIndex: lists[list].orderIndex,
              backgroundColor: lists[list].backgroundColor,
              foregroundColor: lists[list].foregroundColor
            });
          })

        }
      };

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

      newState.sort(sortArray);

      this.setState({
        lists: newState
      });
    });
  }

  handleEditShow(listId, listTitle, orderIndex, backgroundColor, foregroundColor) {
    this.setState({
      listTitle: listTitle,
      listId: listId,
      orderIndex: orderIndex,
      backgroundColor: backgroundColor,
      foregroundColor: foregroundColor
    });
    listStore.mainListId = listId
    listStore.mainListTitle = listTitle
    listStore.mainListOrderIndex = orderIndex
    listStore.mainListBackgroundColor = backgroundColor
    listStore.mainListForegroundColor = foregroundColor

    /*this.setState({ showEditModal: true });*/
      this.props.history.push({
          pathname: "/Lists/" + listTitle.split(' ').join('') + "/Edit",
          state: {listId: listId, listTitle: listTitle, orderIndex: orderIndex, foregroundColor: foregroundColor, backgroundColor: backgroundColor }
      });
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    let userId = firebase.auth().currentUser.uid;
    const itemsRef = firebase.database().ref('Users/' + userId + '/Lists');
    let adjIndex = this.state.lists.length + 1;
    let listName = this.state.newListNameInput;

    if(listName) {
      Database.createMainList(userId, listName, adjIndex);

      var that = this;
      $.ajax({
        url: this.setConfettiState(),
        success: function () {
          that.setConfettiState();
        }
      });
      this.setState({
        newListNameInput: ''
      });
    }
  }

  setConfettiState() {
    this.setState({
      showConfetti: !this.state.showConfetti
    })
  }

  showList(listId, listTitle, mainListOrderIndex, backgroundColor, foregroundColor) {
    let userId = firebase.auth().currentUser.uid;
    const listRef = firebase.database().ref('Users/' + userId + '/Lists');
    listRef.child(listId).on('value', (snapshot) => {
      let subLists = snapshot.val();
      let subListState = [];
      for (let subList in subLists) {
        if(typeof(subLists[subList].title) !== 'undefined') {
          listRef.child(listId).child(subList).on('value', (child) => {
            let items = child.val();
            let count = child.numChildren();
            let adjCount = count - 4;
            subListState.push({
              id: subList,
              title: subLists[subList].title,
              count: adjCount,
              orderIndex: subLists[subList].orderIndex,
              subListBackgroundColor: subLists[subList].subListBackgroundColor,
              subListForegroundColor: subLists[subList].subListForegroundColor
            });
            let childState = [];
            /*for (let item in items) {
              if(typeof(items[item].title) !== 'undefined') {
                listRef.child(listId).child(subList).child(item).on('value', (child) => {
                  childState.push({
                    id: item,
                    title: items[item].title
                  });
                });
              }
            }
            this.setState({
              items: childState
            });*/
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
    this.setState({
      listTitle: listTitle,
      listId: listId,
      mainListOrderIndex: mainListOrderIndex,
      backgroundColor: backgroundColor,
      foregroundColor: foregroundColor
    });
    listStore.mainListId = listId
    listStore.mainListTitle = listTitle
    listStore.mainListOrderIndex = mainListOrderIndex
    listStore.mainListBackgroundColor = backgroundColor
    listStore.mainListForegroundColor = foregroundColor
    this.props.history.push({
      pathname: "/Lists/" + listTitle.split(' ').join(''),
      state: {
        mainListId: listId,
        mainListTitle: listTitle,
        mainListOrderIndex: mainListOrderIndex,
        mainListBackgroundColor: backgroundColor,
        mainListForegroundColor: foregroundColor
      }
    });

  }

  render() {
    const config = { ConfettiConfig };
    return (
      <div id='App' className='container-fluid'>
        <Header />
        <div>
          <form ref="mainListForm" id="createListDiv" className="addItemDiv" onSubmit={this.handleSubmit}>
          <div id="addItemContainer">

            <input ref="listName" id="submitText" type="text" name="newListNameInput" placeholder="New List" value={this.state.newListNameInput} onChange={this.handleChange.bind(this)}/>
            <a className="edit-icon-shadow" style={{color: 'darkslategrey'}} onClick={this.handleSubmit.bind(this)}><div className='icon-shadow-container'><i style={{color: '#4A96AD'}}className="fas fa-plus fa-lg"></i></div></a>
          </div>
        </form>
          <div className='confetti-div'>
          <Confetti active={ this.state.showConfetti } config={ config }/>
          </div>
        </div>
        <hr className="hrFormat" style={{marginLeft: '10px', marginRight: '10px', marginBottom: '30px'}}/>
        <section className="jumbotron jumbotron-padding-adjust" id="mainListSection">
          <div className="wrapper">
            <h2 className="letterSpacing">Current Lists</h2>
            <hr className="hrFormat" style={{borderColor: '#343a40', marginLeft: '10px', marginRight: '10px', marginBottom: '5px'}}/>
            <ul id="mainList">
              {this.state.lists.map((list) => {
                return (
                  <Animated animationIn="flipInX" animationOut="fadeOut" isVisible={true}>
                  <li className="mainItems" key={list.id}>
                    <div id="mainListBtnContainer">
                      {/*set backgroundColor to list.backgroundColor stored in DB on edit save*/}
                      <div id="listBtns" style={{backgroundColor:list.backgroundColor}}>
                        <a onClick={() => this.handleEditShow(list.id, list.title, list.orderIndex, list.backgroundColor, list.foregroundColor)} className="editMainListBtnHome" ><i id="editIcon" className="fas fa-edit fa-sm"></i></a>
                        <a id="mainListBtn"  onClick={this.showList.bind(this, list.id, list.title, list.orderIndex, list.backgroundColor, list.foregroundColor)}><div style={{color:list.foregroundColor}}>{list.title}</div></a>
                      </div>
                    </div>
                  </li>
                  </Animated>
                )
              })}
            </ul>
          </div>
        </section>
      </div>
    );
  }
}

export default compose(withRouter, view)(Home);