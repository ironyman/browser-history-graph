<!--
A nested tree component that recursively renders itself.
You can double click on an item to turn it into a folder.
-->

<script>
import TabTreeItem from './Components/TabTreeItem.vue'
import { mydump } from './debug.js';

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
    getParentNode(query) {
      function getParentNodeAt(query, current) {
        if (!current) return undefined;
        // console.log('parent id', current.id);
        for (let child of current.children) {
          // console.log('child id', child.id);
          if (query == child) {
            return current;
          }
          let result = getParentNodeAt(query, child);
          if (result) {
            return result;
          }
        }
        return undefined;
      }
      // console.log('query id ', query.id);
      return getParentNodeAt(query, this.tabForest);
      // for (let root of this.tabForest) {
      //   let result = getParentNodeAt(query, root);
      //   if (result) {
      //     return result;
      //   }
      // }
      // return undefined;
    },
    prevTreeNode() {
      // case 1, unselected
      if (!this.selectedNode) {
        this.selectedNode = this.tabForest.children[this.tabForest.children.length - 1];
        // Descend
        while (this.selectedNode.children.length > 0) {
          this.selectedNode = this.selectedNode.children[this.selectedNode.children.length - 1];
        }
        return;
      }

      // case 2, has sibling predecessor
      let current = this.selectedNode;
      let parent = this.getParentNode(current);
      // console.log(`parent id ${parent.id}, looking for ${current.id}, this many children ${parent.children.length}`);
      for (let siblingIndex = 0; siblingIndex < parent.children.length; ++siblingIndex) {
        // console.log('sibling id', parent.children[siblingIndex].id);
        if (parent.children[siblingIndex] == current) {
          // console.log('found self out of ',parent.children.length);
          if (siblingIndex == 0) {
            // If we hit the top (forest node), then reset.
            this.selectedNode = parent == this.tabForest ? undefined : parent;
            return;
          }
          // console.log('picking this one', parent.children[siblingIndex + 1])
          // console.log('picking this one', parent.children[1].id)
          // console.log(mydump(parent));
          this.selectedNode = parent.children[siblingIndex - 1];
          // Descend
          while (this.selectedNode.children.length > 0) {
            this.selectedNode = this.selectedNode.children[this.selectedNode.children.length - 1];
          }
          return;
        }
      }
    },
    nextTreeNode() {
      // console.log('initial');
      // console.log(mydump(this.selectedNode));

      // case 1, unselected
      if (!this.selectedNode) {
        this.selectedNode = this.tabForest.children[0];
        return;
      }

      // case 2, has children successor
      if (this.selectedNode.children.length > 0) {
        // console.log(mydump(this.selectedNode.children));
        this.selectedNode = this.selectedNode.children[0];
        // console.log('selected');
        // console.log(mydump(this.selectedNode));
        return;
      }

      // case 3, has sibling successor
      let current = this.selectedNode;
      let parent = this.getParentNode(current);
      // console.log("no parent?", parent);
      while (parent) {
        // console.log(`parent id ${parent.id}, looking for ${current.id}, this many children ${parent.children.length}`);
        for (let siblingIndex = 0; siblingIndex < parent.children.length; ++siblingIndex) {
          // console.log('sibling id', parent.children[siblingIndex].id);
          if (parent.children[siblingIndex] == current) {
            // console.log('found self out of ',parent.children.length);
            if (siblingIndex == parent.children.length - 1) {
              break;
            }
            // console.log('picking this one', parent.children[siblingIndex + 1])
            // console.log('picking this one', parent.children[1].id)
            // console.log(mydump(parent));
            this.selectedNode = parent.children[siblingIndex + 1];
            return;
          }
        }
        current = parent;
        parent = this.getParentNode(current);
      }
      // console.log("resetting");
      this.selectedNode = undefined;
    },
    prevFilteredTreeNode() {
      this.prevTreeNode();
      while (this.selectedNode && this.selectedNode.filteredOut) {
        this.prevTreeNode();
      }
    },
    nextFilteredTreeNode() {
      this.nextTreeNode();
      while (this.selectedNode && this.selectedNode.filteredOut) {
        this.nextTreeNode();
      }
    },
    onBodyKeyDown(event) {
      // console.log('Key', event.key)

      if (event.key == 'ArrowDown') {
        this.nextFilteredTreeNode();
      } else if (event.key == 'ArrowUp') {
        this.prevFilteredTreeNode();
      } else if (event.key == 'Enter') {
        if (this.selectedNode) {
          browser.tabs.update(this.selectedNode.id, {
            active: true
          });
          window.close();
        }
      }
      setTimeout(() => {
        let selected = document.querySelector('.selected');
        let container = document.querySelector('#forest');

        if (selected && !this.isScrolledIntoView(selected, container, true))
          selected.scrollIntoView();
      }, 100);
    },
    onQueryKeyDown(event) {
      // console.log(this.queryString);
      function markFiltered(current, filter) {
        if (!current) return undefined;
        for (let child of current.children) {
          if (!child.name || !child.name.toLowerCase().includes(filter.toLowerCase())) {
            child.filteredOut = true;
          } else {
            delete child.filteredOut;
          }
          markFiltered(child, filter);
        }
      }
      markFiltered(this.tabForest, this.queryString);
      // Not a real tree node, remove the member.
      delete this.tabForest.filteredOut;
    },
    isScrolledIntoView(el, container, partialTest) {
      // let rect = el.getBoundingClientRect();
      // let elemTop = rect.top;
      // let elemBottom = rect.bottom;

      // // Only completely visible elements return true:
      // let isVisible = (elemTop >= 0) && (elemBottom <= window.innerHeight);
      // // Partially visible elements return true:
      // //isVisible = elemTop < window.innerHeight && elemBottom >= 0;
      // return isVisible;

      //Get container properties
      let cTop = container.scrollTop;
      let cBottom = cTop + container.clientHeight;
      //Get el properties
      // let eTop = el.offsetTop; // this is always 0
      // let eBottom = eTop + el.clientHeight;

      let rect  = el.getBoundingClientRect();
      let eTop = rect.top;
      let eBottom = eTop + el.clientHeight;

      // console.log(cTop, cBottom, eTop, eBottom);
      // return eBottom > cBottom || eTop < cTop;
      //Check if in view
      partialTest = true;
      let isTotal = (eTop >= cTop && eBottom <= cBottom);
      let isPartial = partialTest && (
        (eTop < cTop && eBottom > cTop) ||
        (eBottom > cBottom && eTop < cBottom)
      );

      //Return outcome
      return  (isTotal  || isPartial);
    },
  },
  watch: {
    queryString: function(newQueryString, oldQueryString) {
      console.log(this.queryString);
      function markFiltered(current, filter) {
        if (!current) return undefined;
        for (let child of current.children) {
          if (!child.name || !child.name.toLowerCase().includes(filter.toLowerCase())) {
            child.filteredOut = true;
          } else {
            delete child.filteredOut;
          }
          markFiltered(child, filter);
        }
      }
      markFiltered(this.tabForest, this.queryString);
      // Not a real tree node, remove the member.
      delete this.tabForest.filteredOut;
      this.selectedNode = undefined;
      this.nextFilteredTreeNode();
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

      // this.tabForest = Object.values(nodesMap);
      // Not really a node, we're just using it like this so the structure looks the same
      // for tree manipulation operations.
      this.tabForest = {
        children: Object.values(nodesMap),
      };
    });
  },
  data() {
    return {
      navState: {},
      tabForest: {},
      selectedNode: undefined,
      queryString: "",
    }
  },
}
</script>
<!-- @keydown="onQueryKeyDown" -->
<template>
  <div @keydown="onBodyKeyDown" id="container">
    <input id="query" autofocus type="text" placeholder="Search tabs" v-model="queryString" />
    <div id="forest" tabindex="-1">
      <ul style="padding-left: 0">
        <TabTreeItem class="item" v-for="tree in tabForest.children" :model="tree" :selectedNode="selectedNode"></TabTreeItem>
      </ul>
    </div>
  </div>
</template>

<style>
#container {
  width: 600px;
  height: 400px;
  display: flex;
  flex: 10px auto;
  flex-direction: column;
  overflow: hidden;
}

#forest {
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
</style>