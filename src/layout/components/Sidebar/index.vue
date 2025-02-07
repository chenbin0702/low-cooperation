<template>
  <div class="sidebar">
    <!-- 添加系统标题 -->
    <div class="logo-container">
      <LogoIcon />
      <div v-if="!isCollapse" class="logo-title">
        <div class="title-main">低空经济管理系统</div>
        <div class="title-sub">合作商端</div>
      </div>
    </div>
    <el-menu
      :default-active="activeMenu"
      :collapse="isCollapse"
      background-color="#001529"
      text-color="#ffffff"
      active-text-color="#409EFF"
      router
      class="sidebar-menu"
      :unique-opened="true">
      
      <template v-for="route in menuRoutes" :key="route.path">
        <!-- 有子路由的菜单 -->
        <el-sub-menu v-if="route.children" :index="getRoutePath(route)">
          <template #title>
            <el-icon v-if="route.meta?.icon">
              <component :is="Icons[route.meta.icon]" />
            </el-icon>
            <span>{{ route.meta?.title }}</span>
          </template>
          
          <!-- 递归渲染子菜单 -->
          <template v-for="subRoute in route.children" :key="subRoute.path">
            <!-- 二级菜单 -->
            <el-sub-menu v-if="subRoute.children" :index="getRoutePath(subRoute)">
              <template #title>
                <el-icon v-if="subRoute.meta?.icon">
                  <component :is="Icons[subRoute.meta.icon]" />
                </el-icon>
                <span>{{ subRoute.meta?.title }}</span>
              </template>
              <!-- 三级菜单 -->
              <template v-for="child in subRoute.children" :key="child.path">
                <el-menu-item :index="getRoutePath(child)">
                  <el-icon v-if="child.meta?.icon">
                    <component :is="Icons[child.meta.icon]" />
                  </el-icon>
                  <span>{{ child.meta?.title }}</span>
                </el-menu-item>
              </template>
            </el-sub-menu>
            <!-- 没有子路由的菜单项 -->
            <el-menu-item v-else :index="getRoutePath(subRoute)">
              <el-icon v-if="subRoute.meta?.icon">
                <component :is="Icons[subRoute.meta.icon]" />
              </el-icon>
              <span>{{ subRoute.meta?.title }}</span>
            </el-menu-item>
          </template>
        </el-sub-menu>
      </template>
    </el-menu>
  </div>
</template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import * as Icons from '@element-plus/icons-vue'
  import LogoIcon from '@/components/icons/LogoIcon.vue'
  
  const props = defineProps({
    isCollapse: {
      type: Boolean,
      default: false
    }
  })
  
  const route = useRoute()
  const router = useRouter()
  
  // 获取菜单路由
  const menuRoutes = computed(() => {
    const processRoutes = (routes, parent = null) => {
      return routes.map(route => {
        const newRoute = { ...route, parent }
        if (newRoute.children) {
          newRoute.children = processRoutes(newRoute.children, newRoute)
        }
        return newRoute
      })
    }
    
    return processRoutes(
      router.options.routes[0].children.filter(route => !route.meta?.hidden)
    )
  })
  
  // 处理路由路径
  const getRoutePath = (route) => {
    const parentPath = route.parent ? getRoutePath(route.parent) : ''
    const currentPath = route.path.startsWith('/') ? route.path : `${parentPath}/${route.path}`
    return currentPath.replace(/\/+/g, '/')
  }
  
  const activeMenu = computed(() => route.path)
  </script>
  
  <style scoped>
  .sidebar {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #001529;
  }
  
  .logo-container {
    height: 60px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    overflow: hidden;
    white-space: nowrap;
    background-color: #001529;
  }
  
  .logo-icon {
    color: #409EFF;
    flex-shrink: 0;
  }
  
  .logo-title {
    display: flex;
    flex-direction: column;
    justify-content: center;
    line-height: 1.2;
  }
  
  .title-main {
    color: #ffffff;
    font-size: 16px;
    font-weight: 500;
  }
  
  .title-sub {
    color: rgba(255, 255, 255, 0.7);
    font-size: 12px;
    margin-top: 2px;
  }
  
  .sidebar-menu {
    flex: 1;
    border-right: none;
    overflow-y: auto;
  }
  
  /* 滚动条样式 */
  .sidebar-menu::-webkit-scrollbar {
    width: 6px;
  }
  
  .sidebar-menu::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
  }
  
  .sidebar-menu::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  /* 一级菜单样式 */
  :deep(.el-sub-menu__title) {
    padding-left: 20px !important;
    font-size: 14px;
    font-weight: 500;
    color: #ffffff !important;
    height: 40px !important;
    line-height: 40px !important;
  }
  
  /* 一级菜单项样式 */
  :deep(.el-menu-item) {
    padding-left: 20px !important;
    font-size: 13px;
    color: #ffffff !important;
    height: 40px !important;
    line-height: 40px !important;
  }
  
  /* 二级菜单容器 */
  :deep(.el-menu--inline) {
    background-color: #001529 !important;
  }
  
  /* 二级菜单标题 */
  :deep(.el-menu--inline .el-sub-menu__title) {
    padding-left: 44px !important;
    font-size: 13px;
    color: #ffffff !important;
    background-color: #001529 !important;
  }
  
  /* 二级菜单项 */
  :deep(.el-menu--inline .el-menu-item) {
    padding-left: 44px !important;
    font-size: 13px;
    background-color: #001529 !important;
  }
  
  /* 三级菜单容器 */
  :deep(.el-menu--inline .el-menu--inline) {
    background-color: #001529 !important;
  }
  
  /* 三级菜单项 */
  :deep(.el-menu--inline .el-menu--inline .el-menu-item) {
    padding-left: 68px !important;
    background-color: #001529 !important;
  }
  
  /* 悬停效果 */
  :deep(.el-menu-item:hover),
  :deep(.el-sub-menu__title:hover) {
    background-color: #1a2d3d !important;
  }
  
  /* 激活状态 */
  :deep(.el-menu-item.is-active) {
    background-color: #409eff !important;
    color: #ffffff !important;
    position: relative;
    font-weight: 500;
  }
  
  /* 激活状态的图标和文字颜色 */
  :deep(.el-menu-item.is-active .el-icon),
  :deep(.el-menu-item.is-active) {
    color: #ffffff !important;
  }
  
  /* 修复折叠时激活菜单的样式 */
  :deep(.el-menu--popup) {
    .el-menu-item.is-active {
      background-color: #409eff !important;
      color: #ffffff !important;
    }
    .el-menu-item {
      padding-left: 20px !important;
    }
  }
  
  /* 修复三级菜单激活状态 */
  :deep(.el-menu--inline .el-menu--inline .el-menu-item.is-active) {
    background-color: #409eff !important;
    color: #ffffff !important;
  }
  
  /* 确保三级菜单激活时图标颜色也改变 */
  :deep(.el-menu--inline .el-menu--inline .el-menu-item.is-active .el-icon) {
    color: #ffffff !important;
  }
  
  /* 图标样式 */
  :deep(.el-icon) {
    color: #ffffff !important;
    margin-right: 10px;
    font-size: 16px;
    vertical-align: middle;
  }
  
  /* 添加缩进指示线 */
  :deep(.el-menu--inline) {
    position: relative;
    &::before {
      content: '';
      position: absolute;
      left: 34px;
      top: 0;
      bottom: 0;
      width: 1px;
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
  
  /* 折叠时的样式调整 */
  .el-menu--collapse {
    :deep(.el-sub-menu__title) {
      padding-left: 20px !important;
    }
  }
  </style>