<template>
  <div class="agreement-view">
    <el-card class="agreement-card">
      <template #header>
        <div class="card-header">
          <h2>协议查看</h2>
          <el-tag v-if="hasNewVersion" type="warning">有新版本可用</el-tag>
        </div>
      </template>
      
      <el-tabs v-model="activeTab">
        <el-tab-pane label="合作协议" name="cooperation">
          <div v-loading="loading" class="agreement-content">
            <!-- 协议基本信息 -->
            <div class="agreement-meta">
              <div class="meta-item">
                <span class="label">协议版本：</span>
                <span class="value">{{ agreement.version }}</span>
              </div>
              <div class="meta-item">
                <span class="label">生效日期：</span>
                <span class="value">{{ agreement.effectiveDate }}</span>
              </div>
              <div class="meta-item">
                <span class="label">协议状态：</span>
                <el-tag :type="getStatusType(agreement.status)">
                  {{ getStatusText(agreement.status) }}
                </el-tag>
              </div>
            </div>

            <el-divider />

            <!-- 协议章节列表 -->
            <div class="agreement-sections">
              <div 
                v-for="section in agreement.sections" 
                :key="section.id"
                class="section-item">
                <h3 class="section-title">
                  {{ section.title }}
                  <el-button
                    v-if="section.isHighlighted"
                    type="warning"
                    size="small"
                    circle
                    class="highlight-marker">
                    <el-icon><Star /></el-icon>
                  </el-button>
                </h3>
                
                <div class="section-content" v-html="formatContent(section.content)" />
                
                <!-- 章节注释 -->
                <div v-if="section.notes?.length" class="section-notes">
                  <el-collapse>
                    <el-collapse-item title="条款说明">
                      <div 
                        v-for="note in section.notes" 
                        :key="note.id" 
                        class="note-item">
                        <el-tag size="small" class="note-tag">说明</el-tag>
                        <span class="note-text">{{ note.content }}</span>
                        <span class="note-time">{{ formatDate(note.createdAt) }}</span>
                      </div>
                    </el-collapse-item>
                  </el-collapse>
                </div>

                <!-- 添加注释 -->
                <div class="add-note">
                  <el-input
                    v-model="newNotes[section.id]"
                    type="textarea"
                    :rows="2"
                    placeholder="添加条款说明..."
                  />
                  <el-button 
                    type="primary" 
                    size="small"
                    :loading="saving"
                    @click="addNote(section.id)"
                    :disabled="!newNotes[section.id]">
                    添加说明
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 版本对比 -->
        <el-tab-pane label="版本对比" name="compare">
          <div class="version-compare">
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="version-panel old">
                  <h3>原版本 ({{ previousVersion?.version || '无' }})</h3>
                  <el-scrollbar height="600px">
                    <div 
                      v-for="section in previousVersion?.sections"
                      :key="section.id"
                      class="compare-section">
                      <h4>{{ section.title }}</h4>
                      <div v-html="formatContent(section.content)" />
                    </div>
                  </el-scrollbar>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="version-panel new">
                  <h3>当前版本 ({{ agreement.version }})</h3>
                  <el-scrollbar height="600px">
                    <div 
                      v-for="section in agreement.sections"
                      :key="section.id"
                      class="compare-section">
                      <h4>{{ section.title }}</h4>
                      <div v-html="formatContent(section.content)" />
                    </div>
                  </el-scrollbar>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Star } from '@element-plus/icons-vue'
import { useAgreement } from '@/composables/useAgreement'
import type { Agreement } from '@/types/agreement'

// 状态管理
const activeTab = ref('cooperation')
const loading = ref(false)
const saving = ref(false)
const hasNewVersion = ref(false)
const newNotes = reactive<Record<string, string>>({})

// 协议数据
const agreement = reactive<Agreement>({
  id: '1',
  version: 'v2.0.0',
  effectiveDate: '2024-01-01',
  status: 'active',
  sections: [
    {
      id: 'term',
      title: '合作期限',
      content: '本协议有效期为自签署之日起2年。期满后如双方无异议，自动续期1年。',
      isHighlighted: true,
      notes: []
    },
    {
      id: 'area',
      title: '区域限制',
      content: '合作区域限定为华东地区，包括上海市、江苏省、浙江省、安徽省、福建省、江西省、山东省。',
      isHighlighted: true,
      notes: []
    },
    {
      id: 'rights',
      title: '权益分配',
      content: '甲方享有收益的70%，乙方享有收益的30%。具体分配方式见附件一。',
      isHighlighted: true,
      notes: []
    },
    {
      id: 'obligations',
      title: '责任义务',
      content: '甲方负责提供必要的技术支持和培训...',
      isHighlighted: false,
      notes: []
    }
  ]
})

const previousVersion = ref<Agreement | null>({
  id: '0',
  version: 'v1.0.0',
  effectiveDate: '2023-01-01',
  status: 'expired',
  sections: [
    {
      id: 'term',
      title: '合作期限',
      content: '本协议有效期为自签署之日起1年。',
      isHighlighted: false,
      notes: []
    }
  ]
})

// 使用协议相关的可复用逻辑
const { getAgreement, saveNote, checkNewVersion } = useAgreement()

// 获取状态类型
const getStatusType = (status: string): string => {
  const typeMap: Record<string, string> = {
    'active': 'success',
    'expired': 'info',
    'pending': 'warning'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string): string => {
  const textMap: Record<string, string> = {
    'active': '生效中',
    'expired': '已过期',
    'pending': '待生效'
  }
  return textMap[status] || status
}

// 格式化内容
const formatContent = (content: string): string => {
  return content.replace(/\n/g, '<br>')
}

// 格式化日期
const formatDate = (date: string): string => {
  return new Date(date).toLocaleString('zh-CN')
}

// 添加注释
const addNote = async (sectionId: string) => {
  if (!newNotes[sectionId]) return
  
  saving.value = true
  try {
    await saveNote(agreement.id, sectionId, newNotes[sectionId])
    const section = agreement.sections.find(s => s.id === sectionId)
    if (section) {
      section.notes.push({
        id: Date.now().toString(),
        content: newNotes[sectionId],
        createdAt: new Date().toISOString()
      })
    }
    newNotes[sectionId] = ''
    ElMessage.success('添加说明成功')
  } catch (error) {
    ElMessage.error('添加说明失败')
  } finally {
    saving.value = false
  }
}

// 生命周期钩子
onMounted(async () => {
  loading.value = true
  try {
    // 检查新版本
    hasNewVersion.value = await checkNewVersion(agreement.version)
    
    // 获取协议详情
    const data = await getAgreement(agreement.id)
    Object.assign(agreement, data)
  } catch (error) {
    ElMessage.error('获取协议信息失败')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.agreement-view {
  padding: 20px;
}

.agreement-card {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.agreement-meta {
  display: flex;
  gap: 40px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-item .label {
  color: #606266;
}

.meta-item .value {
  color: #303133;
  font-weight: 500;
}

.section-item {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;
  font-size: 16px;
  color: #303133;
}

.highlight-marker {
  margin-left: auto;
}

.section-content {
  line-height: 1.6;
  color: #606266;
}

.section-notes {
  margin-top: 16px;
}

.note-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}

.note-tag {
  flex-shrink: 0;
}

.note-text {
  flex-grow: 1;
  color: #606266;
}

.note-time {
  color: #909399;
  font-size: 12px;
}

.add-note {
  margin-top: 16px;
  display: flex;
  gap: 10px;
}

.version-compare {
  margin-top: 20px;
}

.version-panel {
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.version-panel h3 {
  margin: 0 0 16px;
  font-size: 16px;
  color: #303133;
}

.compare-section {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #fff;
  border-radius: 4px;
}

.compare-section h4 {
  margin: 0 0 12px;
  color: #303133;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .agreement-view {
    padding: 10px;
  }
  
  .agreement-meta {
    flex-direction: column;
    gap: 16px;
  }
  
  .version-compare :deep(.el-row) {
    flex-direction: column;
  }
  
  .version-compare :deep(.el-col) {
    width: 100%;
    margin-bottom: 20px;
  }
}
</style>