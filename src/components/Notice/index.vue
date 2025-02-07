<template>
  <div class="notice-container">
    <el-badge :value="unreadCount" :max="99" class="notice-badge">
      <el-icon class="notice-icon" @click="showNotifications">
        <Bell />
      </el-icon>
    </el-badge>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Bell } from '@element-plus/icons-vue'

const unreadCount = ref(3)

const showNotifications = () => {
  // 显示通知抽屉或弹窗的逻辑
  console.log('Show notifications')
}
</script>

<style scoped>
.notice-container {
  padding: 0 8px;
  cursor: pointer;
}

.notice-icon {
  font-size: 18px;
  color: #666;
}

.notice-badge :deep(.el-badge__content) {
  right: -5px;
  top: -5px;
}
</style> 