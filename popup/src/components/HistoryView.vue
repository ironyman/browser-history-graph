<!--
A nested tree component that recursively renders itself.
You can double click on an item to turn it into a folder.
-->

<script>
import TabTreeItem from './TabTreeItem.vue'
import { mydump } from '../debug.js';

export default {
  props: {
    visible: Boolean,
    selectedNode: Object,
  },
  components: {
    TabTreeItem
  },
  methods: {
    async getAncestors(visitId) {
      // let visits = await chrome.runtime.sendMessage('get-recent-history');
      // console.log("response", visits.length);
      return new Promise(resolve => {
        browser.runtime.sendMessage({
          command: 'get-history-ancestors',
          visitId,
          maxDepth: 20,
        }, function (response) {
          // console.log("response", response[0].url);
          resolve(response);
        });
      });
    },
  },
  watch: {
    visible: {
        immediate: true,
        deep: true,
        async handler(newVisibility) {
          console.log("visibliy", newVisibility);
          if (!newVisibility) {
            return;
          }

          let ancestorChain = await this.getAncestors(this.selectedNode.visitId);
          let prev;
          // ancestorChain goes from leaf to root.
          // for (let i = ancestorChain.length - 1; i >= 0; --i) {
          //   let node = {
          //     visitId: ancestorChain[i].id,
          //     fromVisitId: ancestorChain[i].fromId,
          //     url: ancestorChain[i].url,
          //     date: new Date(ancestorChain[i].date),
          //     name: ancestorChain[i].title,
          //     children: [],
          //   };
          //   if (prev) {
          //     prev.children.push(node);
          //   }
          //   prev = node;
          // }
          for (let i = 0; i < ancestorChain.length; ++i) {
            let node = {
              visitId: ancestorChain[i].id,
              fromVisitId: ancestorChain[i].fromId,
              url: ancestorChain[i].url,
              date: new Date(ancestorChain[i].date),
              name: ancestorChain[i].title,
              children: [],
            };
            if (prev) {
              node.children.push(prev);
            }
            prev = node;
          }
          this.historyTree = prev;
        }
    }
  },
  data() {
    return {
      historyTree: undefined,
    }
  },
}
</script>
<template>
  <!-- Make this focuseable? https://stackoverflow.com/questions/3656467/is-it-possible-to-focus-on-a-div-using-javascript-focus-function -->
  <div tabindex="0" id="modal-container">
    <div id="forest" tabindex="-1">
      <ul style="padding-left: 0">
        <TabTreeItem class="item" v-if="historyTree" :model="historyTree"></TabTreeItem>
      </ul>
    </div>
  </div>
</template>

<style scoped>
#modal-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  /* place-items: center;
  align-items: center;
  justify-content: center; */
  overflow: hidden;
  background-color: var(--background-color);
}

#forest {
  overflow-y: scroll;
  /* element.offsetLeft and element.offsetTop give an element's position with respect to its offsetParent (which is the nearest parent element with a position of relative or absolute.)
  use relative so we can get offsetTop to work
  actually this doesn't even work.
  */
  /* position: relative; */
  /* height: 100%; */
}

</style>