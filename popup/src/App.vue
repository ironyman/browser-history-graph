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
    this.getCurrentTabs().then(a => {
      console.log(Object.keys(a.history).length);
      for (let key in a) {
        console.log("key", key);
        for (let key2 in a[key]) {
          console.log("key2", key2);
          console.log(a[key][key2]);
        }
      }
    });
  },
  data() {
    return {
      treeData
    }
  },
}
</script>

<template>
  <div class="container">
    <input id="query" autofocus type="text"/>
    <ul>
      <TreeItem class="item" v-for="tree in treeData" :model="tree"></TreeItem>
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
  line-height: 1.5;
}
.bold {
  font-weight: bold;
}
</style>