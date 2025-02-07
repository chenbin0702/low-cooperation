<template>
    <el-container class="app-container">
      <el-aside :width="isCollapse ? '64px' : '220px'" class="sidebar-container">
        <Sidebar :is-collapse="isCollapse" />
      </el-aside>
      <el-container>
        <el-header height="50px" class="app-header">
          <div class="header-left">
            <div class="toggle-icon" @click="toggleCollapse">
              <el-icon>
                <Fold v-if="!isCollapse" />
                <Expand v-else />
              </el-icon>
            </div>
            <Breadcrumb />
          </div>
          <div class="header-right">
            <Notice />
            <Screenfull />
            <el-dropdown>
              <span class="user-info">
                <el-avatar size="small" :src="userAvatar" />
                {{ userName }}
                <el-icon class="el-icon--right"><CaretBottom /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>个人信息</el-dropdown-item>
                  <el-dropdown-item>修改密码</el-dropdown-item>
                  <el-dropdown-item divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        <TagsView />
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRoute } from 'vue-router'
  import { 
    CaretBottom,
    Expand,
    Fold 
  } from '@element-plus/icons-vue'
  import Sidebar from '@/layout/components/Sidebar/index.vue'
  import Breadcrumb from '@/layout/components/Breadcrumb/index.vue'
  import TagsView from '@/layout/components/TagsView/index.vue'
  import Notice from '@/components/Notice/index.vue'
  import Screenfull from '@/components/Screenfull/index.vue'
  
  const route = useRoute()
  const userName = ref('管理员')
  const userAvatar = ref('https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png')
  const isCollapse = ref(false)
  
  const toggleCollapse = () => {
    isCollapse.value = !isCollapse.value
  }
  </script>
  
  <style scoped>
  .app-container {
    height: 100vh;
    overflow: hidden;
  }
  
  .sidebar-container {
    background-color: #ffffff;
    border-right: 1px solid #e6e6e6;
    transition: width 0.3s;
    position: relative;
    overflow: hidden;
  }
  
  .app-header {
    background-color: #fff;
    border-bottom: 1px solid #e6e6e6;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    height: 50px;
  }
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .breadcrumb-container {
    margin-left: 8px;
    padding: 8px 0;
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }
  
  .el-main {
    background-color: #f0f2f5;
    height: calc(100vh - 84px);
    overflow: hidden;
    position: relative;
  }
  
  /* 内容区域的滚动容器 */
  :deep(.el-main > div) {
    height: 100%;
    padding: 20px;
    overflow-y: auto;
  }
  
  /* 自定义滚动条样式 */
  :deep(.el-main > div::-webkit-scrollbar) {
    width: 6px;
  }
  
  :deep(.el-main > div::-webkit-scrollbar-thumb) {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }
  
  :deep(.el-main > div::-webkit-scrollbar-track) {
    background: transparent;
  }
  
  .toggle-icon {
    font-size: 18px;
    cursor: pointer;
    color: #666;
    padding: 8px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .toggle-icon:hover {
    background-color: #f6f6f6;
  }
  
  :deep(.el-icon) {
    vertical-align: middle;
  }
  </style> 