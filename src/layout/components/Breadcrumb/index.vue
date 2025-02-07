<template>
  <div class="breadcrumb-wrapper">
    <!-- 原有的面包屑 -->
    <div class="breadcrumb-container">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <template v-for="(item, index) in breadcrumbList" :key="index">
          <el-breadcrumb-item 
            :to="getRedirectPath(item, index)"
          >
            {{ item.meta?.title }}
          </el-breadcrumb-item>
        </template>
      </el-breadcrumb>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 计算面包屑列表
const breadcrumbList = computed(() => {
  // 获取当前路由的matched数组
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  
  // 如果是仪表盘，不显示面包屑
  if (matched.length === 1 && matched[0].name === 'Dashboard') {
    return []
  }
  
  // 过滤掉Layout
  return matched.filter(item => item.name !== 'Layout')
})

// 获取重定向路径
const getRedirectPath = (item, index) => {
  // 如果是最后一项，不需要跳转
  if (index === breadcrumbList.value.length - 1) {
    return ''
  }
  
  // 查找路由配置
  const findRoute = (routes, path) => {
    for (const route of routes) {
      if (route.path === path) {
        return route
      }
      if (route.children) {
        const found = findRoute(route.children, path)
        if (found) return found
      }
    }
    return null
  }
  
  const currentRoute = findRoute(router.options.routes, item.path)
  
  // 如果有重定向，使用重定向路径
  if (currentRoute?.redirect) {
    return { path: currentRoute.redirect }
  }
  
  // 如果有子路由，使用第一个子路由的路径
  if (currentRoute?.children?.length) {
    const firstChild = currentRoute.children[0]
    return { 
      path: firstChild.path.startsWith('/') 
        ? firstChild.path 
        : `${item.path}/${firstChild.path}`
    }
  }
  
  // 默认使用当前路径
  return { path: item.path }
}
</script>

<style scoped>
.breadcrumb-wrapper {
  display: flex;
  flex-direction: column;
}

.breadcrumb-container {
  padding: 8px 16px;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.tags-nav {
  position: relative;
  height: 34px;
  width: 100%;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.tags-scrollbar {
  width: 100%;
  height: 100%;
}

.tags-wrapper {
  padding: 4px;
  height: 34px;
  white-space: nowrap;
}

:deep(.el-tag) {
  margin-right: 4px;
  cursor: pointer;
  height: 26px;
  line-height: 26px;
  padding: 0 8px;
  font-size: 12px;
  border-radius: 2px;
  border: 1px solid #e8eaec;
  color: #515a6e;
  background: #fff;
  transition: all .3s ease;
  
  &.active {
    color: #fff;
    background-color: #409EFF;
    border-color: #409EFF;
    
    .el-tag__close {
      color: #fff;
      
      &:hover {
        background-color: rgba(255, 255, 255, 0.2);
        color: #fff;
      }
    }
  }
  
  &:not(.active) {
    &:hover {
      color: #409EFF;
      border-color: #409EFF;
      background-color: #f5f7fa;
    }
    
    .el-tag__close {
      color: #999;
      
      &:hover {
        background-color: #f5f7fa;
        color: #666;
      }
    }
  }
}

:deep(.el-tag__close) {
  position: relative;
  top: -1px;
  margin-left: 6px;
  border-radius: 50%;
  transition: all .3s ease;
}

:deep(.el-breadcrumb) {
  font-size: 14px;
  line-height: 1;
}

:deep(.el-breadcrumb__item) {
  .el-breadcrumb__inner {
    color: #606266;
    font-weight: normal;
    
    &.is-link {
      color: #606266;
      cursor: pointer;
      &:hover {
        color: #409EFF;
      }
    }
  }
  
  &:last-child .el-breadcrumb__inner {
    color: #909399;
    cursor: text;
  }
}

:deep(.el-breadcrumb__separator) {
  margin: 0 8px;
  color: #909399;
}

:deep(.el-scrollbar__wrap) {
  height: 100%;
}

:deep(.el-scrollbar__bar) {
  z-index: 1;
  
  &.is-horizontal {
    height: 4px;
  }
  
  &.is-vertical {
    width: 4px;
  }
}
</style> 