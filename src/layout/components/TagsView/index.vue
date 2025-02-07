<template>
  <div class="tags-view">
    <el-scrollbar class="tags-scrollbar">
      <div class="tags-wrapper">
        <el-tag
          v-for="tag in visitedViews"
          :key="tag.path"
          :class="{ active: isActive(tag) }"
          closable
          :disable-transitions="false"
          @click="handleClick(tag)"
          @close.stop="handleClose(tag)"
          size="default"
        >
          {{ tag.title }}
        </el-tag>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 访问过的页面记录
const visitedViews = ref([])

// 添加访问记录
const addVisitedView = (view) => {
  if (visitedViews.value.some(v => v.path === view.path)) return
  visitedViews.value.push({
    name: view.name,
    path: view.path,
    title: view.meta?.title || 'unknown'
  })
}

// 判断是否是当前激活的页面
const isActive = (tag) => {
  return tag.path === route.path
}

// 处理标签点击
const handleClick = (tag) => {
  router.push(tag.path)
}

// 处理标签关闭
const handleClose = (view) => {
  const index = visitedViews.value.indexOf(view)
  if (index > -1) {
    visitedViews.value.splice(index, 1)
  }
  
  // 如果关闭的是当前页面，则跳转到最后一个标签
  if (isActive(view) && visitedViews.value.length) {
    const latestView = visitedViews.value[visitedViews.value.length - 1]
    router.push(latestView.path)
  }
}

// 监听路由变化，添加访问记录
watch(
  () => route.path,
  () => {
    addVisitedView(route)
  },
  {
    immediate: true
  }
)
</script>

<style scoped>
.tags-view {
  height: 34px;
  width: 100%;
  background: #fff;
  border-bottom: 1px solid #dcdfe6;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .12);
}

.tags-scrollbar {
  width: 100%;
  height: 100%;
}

.tags-wrapper {
  padding: 4px 8px;
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
  border-radius: 3px;
  border: 1px solid #e8eaec;
  color: #666;
  background: #fff;
  transition: all .2s;
  
  &.active {
    color: #1890ff;
    background-color: #e6f7ff;
    border-color: #91d5ff;
    
    .el-tag__close {
      color: #1890ff;
      
      &:hover {
        background-color: #1890ff;
        color: #fff;
      }
    }
  }
  
  &:not(.active) {
    &:hover {
      color: #1890ff;
      border-color: #91d5ff;
      background-color: #e6f7ff;
    }
    
    .el-tag__close {
      color: #999;
      
      &:hover {
        background-color: #909399;
        color: #fff;
      }
    }
  }
}

:deep(.el-tag__close) {
  position: relative;
  top: -1px;
  margin-left: 6px;
  border-radius: 50%;
  transition: all .2s;
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