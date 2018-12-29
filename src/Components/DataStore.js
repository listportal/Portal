import {store} from 'react-easy-state'

// Declare your store's initial state.
const listStore = store({
  mainListId: '',
  mainListTitle: '',
  mainListOrderIndex: '',
  mainListForegroundColor: '',
  mainListBackgroundColor: '',
  subListId: '',
  subListTitle: '',
  subListOrderIndex: '',
  subListForegroundColor: '',
  subListBackgroundColor: '',
  itemId: '',
  itemTitle: '',
  isYes: ''
  /*get mainListId () {
    return listStore.mainListIdValue
  },
  set mainListId (mainListId) {
    listStore.mainListIdValue = mainListId
  }*/
})

export default listStore
