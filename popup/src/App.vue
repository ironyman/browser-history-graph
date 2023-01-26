<!--
A nested tree component that recursively renders itself.
You can double click on an item to turn it into a folder.
-->

<script>
import TabTreeItem from './Components/TabTreeItem.vue'

export default {
  components: {
    TabTreeItem
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
          faviconUrl: navState.history[tabId].faviconUrl,
          openerTabId: tab.openerTabId,
          children: [],
        };
        // console.log(`adding ${tab.id} opened from ${tab.openerTabId}`);
      }

      for (let tabId in nodesMap) {
        let current = nodesMap[tabId];
        let parentId = current.openerTabId;
        if (nodesMap.hasOwnProperty(parentId)) {
          // console.log(`reparenting ${tabId}`);
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
      navState: {},
      tabForest: {},
    }
  },
}
</script>

<template>
  <div class="container">
    <input id="query" autofocus type="text" placeholder="Search here"/>
    <div class="tree">
      <ul>
        <TabTreeItem class="item" v-for="tree in tabForest" :model="tree"></TabTreeItem>
      </ul>
    </div>
  </div>
</template>

<style>
.container {
  width: 600px;
  height: 400px;
  display: flex;
  flex: 10px auto;
  flex-direction: column;
  overflow: hidden;
}

.tree {
  overflow-y: scroll;
  height: 100%;
}

#query {
  width: 100%;
  height: 12pt;
  background-color:rgba(0, 0, 0, 0);
  /* color: white; */
  color: var(--text);
  border: none;
  outline: none;
  padding: 10px;
  margin: 10px;
}

#email:focus {
}

.item {
  /* cursor: pointer; */
}
.bold {
  font-weight: bold;
}



</style>