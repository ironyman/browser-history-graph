<script>
export default {
  name: 'TabTreeItem', // necessary for self-reference
  props: {
    model: Object,
    selectedNode: Object,
    depth: {
      type: Number,
      default: 0,
    },
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
    <div class="list-name" :class="{ 'selected': model == selectedNode, 'filtered-out': model.filteredOut }"
      @click.self="openTab">
      <span class="toggle" @click="toggle" v-if="isFolder">{{ '&nbsp'.repeat(depth) + (isOpen ? '-': '+') }}</span>
      <!-- This is more flush but parents are lined up with children -->
      <!-- <span class="toggle" v-else="isFolder">{{ '&nbsp'.repeat(depth*2 > 1 ? depth*2 - 1 : depth*2) }}</span> -->
      <!-- This takes up more space but parents and children are distinguished -->
      <span class="toggle" v-else="isFolder">{{ '&nbsp'.repeat(depth + 1) }}</span>

      {{ model.name }}
    </div>
    <ul tabindex="-1" v-show="isOpen" v-if="isFolder">
      <!--
        A component can recursively render itself using its
        "name" option (inferred from filename if using SFC)
      -->
      <TabTreeItem class="item" v-for="model in model.children" :selectedNode="selectedNode" :model="model" :depth="depth+1">
      </TabTreeItem>
    </ul>
  </li>
</template>
<style>
ul {
  list-style: none;
  padding-left: 0px;
  list-style-position: inside;
}

li {
  position: relative;
  padding-left: 0;
}

li div.list-name {
  padding: 2px 8px 2px 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  /* font-family: monospace; */
}

li div.list-name.selected,
li div.list-name:hover {
  background-color: var(--popup_highlight);
  border-radius: 3px;
}

.toggle {
  font-family: monospace;
}

.filtered-out {
  display: none;
}
</style>