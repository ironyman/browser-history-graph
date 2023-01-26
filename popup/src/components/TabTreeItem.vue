<script>
export default {
  name: 'TabTreeItem', // necessary for self-reference
  props: {
    model: Object,
    selectedNode: Object,
  },
  data() {
    return {
      isOpen: true
    }
  },
  computed: {
    isFolder() {
      return this.model.children && this.model.children.length
    }
  },
  methods: {
    toggle() {
      if (this.isFolder) {
        this.isOpen = !this.isOpen
      }
    },
    openTab() {
      browser.tabs.update(this.model.id, {
        active: true
      });
        // browser.runtime.sendMessage({
        //   command: 'show-tab',
        //   tabId: this.model.id,
        // });
      window.close();
    }
  }
}
</script>

<template>
  <li>
    <div class="list-name" :class="{ 'selected' : model == selectedNode }" @click.self="openTab">
      <span class="toggle" @click="toggle" v-if="isFolder">{{ isOpen ? '-' : '+' }}</span>
      {{ model.name }}
    </div>
    <ul v-show="isOpen" v-if="isFolder">
      <!--
        A component can recursively render itself using its
        "name" option (inferred from filename if using SFC)
      -->
      <TabTreeItem
        class="item"
        v-for="model in model.children"
        :selectedNode="selectedNode"
        :model="model">
      </TabTreeItem>
    </ul>
  </li>
</template>
<style>
ul {
  list-style: none;
  padding-left: 14px;
  list-style-position: inside;
}
li {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-left: 0;
}

li div.list-name {
  padding: 2px 8px 2px 8px;
}

li div.list-name.selected, li div.list-name:hover {
  background-color: var(--popup_highlight);
  border-radius: 3px;
}

.toggle {
  font-family: monospace;
}

 li::before {
  content: '';
  position: absolute;
  top: 0;
  width: 1px;
  height: 100%;
  right: auto;
  left: -20px;
  border-left: 1px solid #ccc;
  bottom: 50px;
}
</style>