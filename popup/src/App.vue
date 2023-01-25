<!--
A nested tree component that recursively renders itself.
You can double click on an item to turn it into a folder.
-->

<script>
import TreeItem from './Components/TreeItem.vue'

const treeData = [
  {
    name: 'My Tree',
    children: [
      { name: 'hello' },
      { name: 'wat' },
      {
        name: 'child folder',
        children: [
          {
            name: 'child folder',
            children: [{ name: 'hello' }, { name: 'wat' }]
          },
          { name: 'hello' },
          { name: 'wat' },
          {
            name: 'child folder',
            children: [{ name: 'hello' }, { name: 'wat' }]
          }
        ]
      }
    ]
  },
  {
    name: 'My Tree',
    children: [
      { name: 'hello' },
      { name: 'wat' },
      {
        name: 'child folder',
        children: [
          {
            name: 'child folder',
            children: [{ name: 'hello' }, { name: 'wat' }]
          },
          { name: 'hello' },
          { name: 'wat' },
          {
            name: 'child folder',
            children: [{ name: 'hello' }, { name: 'wat' }]
          }
        ]
      }
    ]
  }
];

export default {
  components: {
    TreeItem
  },
  methods: {
    async getCurrentTabs() {
      // let visits = await chrome.runtime.sendMessage('get-recent-history');
      // console.log("response", visits.length);
      return new Promise(resolve => {
        browser.runtime.sendMessage('get-current-tabs', function (response) {
          // console.log("response", response[0].url);
          resolve(response);
        });
      });
    },
  },
  mounted() {
    this.getCurrentTabs().then(navState => {
      // console.log(Object.keys(navState.history).length);
      // for (let key in navState) {
      // console.log("key", key);
      //   for (let key2 in navState[key]) {
      //     console.log("key2", key2);
      //     console.log(navState[key][key2]);
      //   }
      // }

      this.navState = navState;
      let nodesMap = {};

      for (let tabId in navState.currentTabs) {
        let tab = navState.currentTabs[tabId];
        nodesMap[tab.id] = {
          id: tab.id,
          name: tab.title,
          openerTabId: tab.openerTabId,
          children: [],
        };
        console.log(`adding ${tab.id} opened from ${tab.openerTabId}`);
      }

      for (let tabId in nodesMap) {
        let current = nodesMap[tabId];
        let parentId = current.openerTabId;
        if (nodesMap.hasOwnProperty(parentId)) {
          console.log(`reparenting ${tabId}`);
          nodesMap[parentId].children.push(current);
        }
      }

      // Delete after reparenting because if we delete while reparenting
      // we can't reparent if we already deleted (reparented) the the node we need to
      // reparent to.
      for (let tabId in nodesMap) {
        if (nodesMap[tabId].openerTabId) {
          delete nodesMap[tabId];
        }
      }

      this.tabForest = Object.values(nodesMap);
    });
  },
  data() {
    return {
      treeData,
      navState: {},
      tabForest: {},
    }
  },
}
</script>

<template>
  <div class="container tree">
    <input id="query" autofocus type="text"/>
    <ul>
      <TreeItem class="item" v-for="tree in tabForest" :model="tree"></TreeItem>
    </ul>
  </div>
</template>

<style>
.container {
  min-width: 400px;
  /* min-height: 800px; */
}
#query {
  width: 100%;
  height: 12pt;
  background-color:rgba(0, 0, 0, 0);
  color: white;
  border: none;
  outline:none;
}
#email:focus {
}

.item {
  cursor: pointer;
}
.bold {
  font-weight: bold;
}



</style>