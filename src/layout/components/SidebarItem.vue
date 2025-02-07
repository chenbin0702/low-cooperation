<template>
  <el-sub-menu v-if="item.children" :index="item.index">
    <template #title>
      <el-icon v-if="item.meta && item.meta.icon">
        <component :is="item.meta.icon" />
      </el-icon>
      <span>{{ item.meta.title }}</span>
    </template>
    <template v-for="child in item.children" :key="child.index || child.path">
      <sidebar-item 
        v-if="child.children" 
        :item="child"
      />
      <el-menu-item v-else :index="child.path">
        <el-icon v-if="child.meta && child.meta.icon">
          <component :is="child.meta.icon" />
        </el-icon>
        <template #title>
          <span class="menu-title">{{ child.meta.title }}</span>
        </template>
      </el-menu-item>
    </template>
  </el-sub-menu>
  <el-menu-item v-else :index="item.path || item.index">
    <el-icon v-if="item.meta && item.meta.icon">
      <component :is="item.meta.icon" />
    </el-icon>
    <template #title>
      <span class="menu-title">{{ item.meta.title }}</span>
    </template>
  </el-menu-item>
</template> 