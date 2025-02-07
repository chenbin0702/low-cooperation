<template>
  <el-drawer
    v-model="visible"
    title="通知中心"
    :size="400"
    :with-header="false"
  >
    <div class="notification-header">
      <h3>通知中心</h3>
      <div class="header-actions">
        <el-button type="primary" link @click="markAllRead">
          全部已读
        </el-button>
      </div>
    </div>
    
    <el-tabs v-model="activeTab">
      <el-tab-pane label="未读消息(3)" name="unread">
        <el-scrollbar height="calc(100vh - 150px)">
          <div class="notification-list">
            <div 
              v-for="item in unreadNotifications" 
              :key="item.id"
              class="notification-item"
              :class="{ unread: !item.read }"
              @click="readNotification(item)"
            >
              <el-badge is-dot :hidden="item.read">
                <div class="notification-content">
                  <div class="notification-title">{{ item.title }}</div>
                  <div class="notification-time">{{ item.time }}</div>
                  <div class="notification-desc">{{ item.content }}</div>
                </div>
              </el-badge>
            </div>
          </div>
        </el-scrollbar>
      </el-tab-pane>
      
      <el-tab-pane label="全部消息" name="all">
        <!-- 全部消息列表 -->
      </el-tab-pane>
    </el-tabs>
  </el-drawer>
</template>

<script setup>
import { ref } from 'vue'

const visible = ref(false)
const activeTab = ref('unread')

const unreadNotifications = ref([
  {
    id: 1,
    title: '系统通知',
    content: '您有新的订单待处理',
    time: '10分钟前',
    read: false
  },
  // ... 更多通知
])

const readNotification = (notification) => {
  notification.read = true
}

const markAllRead = () => {
  unreadNotifications.value.forEach(notification => {
    notification.read = true
  })
}

defineExpose({
  show: () => visible.value = true
})
</script>

<style scoped>
.notification-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.notification-list {
  padding: 8px 16px;
}

.notification-item {
  padding: 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 8px;
}

.notification-item:hover {
  background-color: var(--el-color-primary-light-9);
}

.notification-item.unread {
  background-color: var(--el-color-info-light);
}

.notification-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.notification-time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

.notification-desc {
  color: var(--el-text-color-regular);
  font-size: 13px;
}
</style> 