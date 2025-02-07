<template>
  <div class="activity-planning">
    <!-- 搜索过滤区域 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="活动名称">
          <el-input v-model="searchForm.name" placeholder="请输入活动名称" clearable />
        </el-form-item>
        <el-form-item label="活动类型">
          <el-select v-model="searchForm.type" placeholder="请选择" clearable>
            <el-option label="线上活动" value="online" />
            <el-option label="线下活动" value="offline" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="筹备中" value="preparing" />
            <el-option label="进行中" value="ongoing" />
            <el-option label="已结束" value="finished" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 活动列表 -->
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <h2>活动列表</h2>
          <el-button type="primary" @click="showActivityDialog">新增活动</el-button>
        </div>
      </template>

      <el-table :data="activityList" v-loading="loading" style="width: 100%">
        <el-table-column prop="name" label="活动名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="type" label="活动类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.type === 'online' ? '线上活动' : '线下活动' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startDate" label="开始时间" width="180" sortable />
        <el-table-column prop="endDate" label="结束时间" width="180" sortable />
        <el-table-column prop="status" label="活动状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="budget" label="预算" width="120">
          <template #default="{ row }">
            ¥{{ row.budget }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="showDetail(row)">详情</el-button>
            <el-button link type="primary" @click="editActivity(row)">编辑</el-button>
            <el-button 
              v-if="row.status === 'preparing'"
              link 
              type="success" 
              @click="startActivity(row)">
              开始活动
            </el-button>
            <el-button link type="danger" @click="deleteActivity(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 活动表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增活动' : '编辑活动'"
      width="60%"
      destroy-on-close>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px">
        <el-tabs v-model="activeTab">
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息" name="basic">
            <el-form-item label="活动名称" prop="name">
              <el-input v-model="form.name" />
            </el-form-item>

            <el-form-item label="活动类型" prop="type">
              <el-radio-group v-model="form.type">
                <el-radio label="online">线上活动</el-radio>
                <el-radio label="offline">线下活动</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="活动时间" prop="dateRange">
              <el-date-picker
                v-model="form.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="width: 100%"
              />
            </el-form-item>

            <el-form-item label="活动预算" prop="budget">
              <el-input-number
                v-model="form.budget"
                :min="0"
                :precision="2"
                style="width: 100%">
                <template #append>元</template>
              </el-input-number>
            </el-form-item>

            <el-form-item label="目标人群" prop="targetAudience">
              <el-select
                v-model="form.targetAudience"
                multiple
                placeholder="请选择目标人群"
                style="width: 100%">
                <el-option label="企业客户" value="business" />
                <el-option label="个人用户" value="individual" />
                <el-option label="政府机构" value="government" />
              </el-select>
            </el-form-item>
          </el-tab-pane>

          <!-- 活动内容 -->
          <el-tab-pane label="活动内容" name="content">
            <el-form-item label="活动主题" prop="theme">
              <el-input v-model="form.theme" />
            </el-form-item>

            <el-form-item label="活动描述" prop="description">
              <el-input
                v-model="form.description"
                type="textarea"
                :rows="4"
                placeholder="请详细描述活动内容"
              />
            </el-form-item>

            <el-form-item label="活动亮点" prop="highlights">
              <el-input
                v-model="form.highlights"
                type="textarea"
                :rows="4"
                placeholder="请描述活动亮点和特色"
              />
            </el-form-item>
          </el-tab-pane>

          <!-- 执行计划 -->
          <el-tab-pane label="执行计划" name="plan">
            <el-form-item label="执行团队" prop="team">
              <el-select
                v-model="form.team"
                multiple
                filterable
                allow-create
                default-first-option
                placeholder="请选择或输入执行团队成员"
                style="width: 100%">
                <el-option
                  v-for="member in teamOptions"
                  :key="member.value"
                  :label="member.label"
                  :value="member.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="关键节点" prop="milestones">
              <div v-for="(milestone, index) in form.milestones" :key="index" class="milestone-item">
                <el-row :gutter="20">
                  <el-col :span="8">
                    <el-date-picker
                      v-model="milestone.date"
                      type="date"
                      placeholder="选择日期"
                      style="width: 100%"
                    />
                  </el-col>
                  <el-col :span="14">
                    <el-input v-model="milestone.task" placeholder="请输入节点任务" />
                  </el-col>
                  <el-col :span="2">
                    <el-button
                      type="danger"
                      link
                      @click="removeMilestone(index)"
                      :disabled="form.milestones.length <= 1">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </el-col>
                </el-row>
              </div>
              <div class="milestone-actions">
                <el-button type="primary" link @click="addMilestone">
                  添加节点
                </el-button>
              </div>
            </el-form-item>
          </el-tab-pane>

          <!-- 预期效果 -->
          <el-tab-pane label="预期效果" name="expected">
            <el-form-item label="参与目标" prop="participationTarget">
              <el-input-number
                v-model="form.participationTarget"
                :min="0"
                style="width: 100%">
                <template #append>人</template>
              </el-input-number>
            </el-form-item>

            <el-form-item label="转化目标" prop="conversionTarget">
              <el-input-number
                v-model="form.conversionTarget"
                :min="0"
                style="width: 100%">
                <template #append>人</template>
              </el-input-number>
            </el-form-item>

            <el-form-item label="预期收益" prop="expectedRevenue">
              <el-input-number
                v-model="form.expectedRevenue"
                :min="0"
                :precision="2"
                style="width: 100%">
                <template #append>元</template>
              </el-input-number>
            </el-form-item>

            <el-form-item label="其他目标" prop="otherTargets">
              <el-input
                v-model="form.otherTargets"
                type="textarea"
                :rows="4"
                placeholder="请描述其他预期目标"
              />
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="活动详情"
      width="60%">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="活动名称">{{ currentDetail.name }}</el-descriptions-item>
        <el-descriptions-item label="活动类型">
          {{ currentDetail.type === 'online' ? '线上活动' : '线下活动' }}
        </el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ currentDetail.startDate }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ currentDetail.endDate }}</el-descriptions-item>
        <el-descriptions-item label="活动预算">¥{{ currentDetail.budget }}</el-descriptions-item>
        <el-descriptions-item label="活动状态">
          <el-tag :type="getStatusType(currentDetail.status)">
            {{ getStatusText(currentDetail.status) }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <div class="detail-section">
        <h4>活动内容</h4>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="活动主题">{{ currentDetail.theme }}</el-descriptions-item>
          <el-descriptions-item label="活动描述">{{ currentDetail.description }}</el-descriptions-item>
          <el-descriptions-item label="活动亮点">{{ currentDetail.highlights }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="detail-section">
        <h4>执行计划</h4>
        <el-timeline>
          <el-timeline-item
            v-for="(milestone, index) in currentDetail.milestones"
            :key="index"
            :timestamp="milestone.date">
            {{ milestone.task }}
          </el-timeline-item>
        </el-timeline>
      </div>

      <div class="detail-section">
        <h4>预期效果</h4>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="参与目标">{{ currentDetail.participationTarget }}人</el-descriptions-item>
          <el-descriptions-item label="转化目标">{{ currentDetail.conversionTarget }}人</el-descriptions-item>
          <el-descriptions-item label="预期收益">¥{{ currentDetail.expectedRevenue }}</el-descriptions-item>
          <el-descriptions-item label="其他目标">{{ currentDetail.otherTargets }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'

// 状态管理
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const dialogType = ref('add')
const activeTab = ref('basic')
const formRef = ref(null)
const currentDetail = ref({})

// 搜索表单
const searchForm = reactive({
  name: '',
  type: '',
  status: '',
  dateRange: []
})

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 活动表单
const form = reactive({
  name: '',
  type: 'online',
  dateRange: [],
  budget: 0,
  targetAudience: [],
  theme: '',
  description: '',
  highlights: '',
  team: [],
  milestones: [{ date: '', task: '' }],
  participationTarget: 0,
  conversionTarget: 0,
  expectedRevenue: 0,
  otherTargets: ''
})

// 团队成员选项
const teamOptions = [
  { label: '张三', value: 'zhangsan' },
  { label: '李四', value: 'lisi' }
]

// 活动列表数据
const activityList = ref([])

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入活动名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择活动类型', trigger: 'change' }
  ],
  dateRange: [
    { required: true, message: '请选择活动时间', trigger: 'change' }
  ],
  budget: [
    { required: true, message: '请输入活动预算', trigger: 'blur' }
  ],
  theme: [
    { required: true, message: '请输入活动主题', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入活动描述', trigger: 'blur' }
  ]
}

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    preparing: 'info',
    ongoing: 'warning',
    finished: 'success'
  }
  return statusMap[status] || ''
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    preparing: '筹备中',
    ongoing: '进行中',
    finished: '已结束'
  }
  return textMap[status] || status
}

// 搜索方法
const handleSearch = () => {
  loadData()
}

const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  searchForm.dateRange = []
  handleSearch()
}

// 分页方法
const handleSizeChange = (val) => {
  pagination.pageSize = val
  loadData()
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
  loadData()
}

// 显示活动对话框
const showActivityDialog = (type = 'add', row = null) => {
  dialogType.value = type
  dialogVisible.value = true
  activeTab.value = 'basic'
  
  if (type === 'edit' && row) {
    Object.assign(form, row)
  } else {
    Object.keys(form).forEach(key => {
      if (Array.isArray(form[key])) {
        form[key] = key === 'milestones' ? [{ date: '', task: '' }] : []
      } else if (typeof form[key] === 'number') {
        form[key] = 0
      } else {
        form[key] = key === 'type' ? 'online' : ''
      }
    })
  }
}

// 编辑活动
const editActivity = (row) => {
  showActivityDialog('edit', row)
}

// 显示详情
const showDetail = (row) => {
  currentDetail.value = row
  detailDialogVisible.value = true
}

// 开始活动
const startActivity = (row) => {
  ElMessageBox.confirm(
    '确定要开始该活动吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    loading.value = true
    try {
      // TODO: 实现实际的开始活动逻辑
      await new Promise(resolve => setTimeout(resolve, 1000))
      ElMessage.success('活动已开始')
      loadData()
    } catch (error) {
      ElMessage.error('操作失败')
    } finally {
      loading.value = false
    }
  })
}

// 删除活动
const deleteActivity = (row) => {
  ElMessageBox.confirm(
    '确定要删除该活动吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    loading.value = true
    try {
      // TODO: 实现实际的删除逻辑
      await new Promise(resolve => setTimeout(resolve, 1000))
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      ElMessage.error('删除失败')
    } finally {
      loading.value = false
    }
  })
}

// 里程碑操作
const addMilestone = () => {
  form.milestones.push({ date: '', task: '' })
}

const removeMilestone = (index) => {
  form.milestones.splice(index, 1)
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true
    
    // TODO: 实现实际的保存逻辑
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
    dialogVisible.value = false
    loadData()
  } catch (error) {
    ElMessage.error('表单验证失败，请检查必填项')
  } finally {
    submitting.value = false
  }
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // TODO: 实现实际的数据加载逻辑
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟数据
    activityList.value = [
      {
        name: '示例活动1',
        type: 'online',
        startDate: '2024-01-15',
        endDate: '2024-01-20',
        status: 'preparing',
        budget: 50000,
        theme: '新品发布会',
        description: '发布最新产品系列',
        highlights: '多项创新技术展示',
        milestones: [
          { date: '2024-01-15', task: '活动启动' },
          { date: '2024-01-20', task: '产品发布' }
        ],
        participationTarget: 1000,
        conversionTarget: 100,
        expectedRevenue: 200000
      },
      {
        name: '示例活动2',
        type: 'offline',
        startDate: '2024-01-10',
        endDate: '2024-01-12',
        status: 'ongoing',
        budget: 30000,
        theme: '技术交流会',
        description: '行业技术分享与交流',
        highlights: '专家现场指导',
        milestones: [
          { date: '2024-01-10', task: '开幕式' },
          { date: '2024-01-12', task: '总结会' }
        ],
        participationTarget: 500,
        conversionTarget: 50,
        expectedRevenue: 100000
      }
    ]
    pagination.total = 20
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 生命周期钩子
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.activity-planning {
  padding: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
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

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.milestone-item {
  margin-bottom: 10px;
}

.milestone-actions {
  margin-top: 10px;
}

.detail-section {
  margin-top: 20px;
}

.detail-section h4 {
  margin: 0 0 10px;
  color: #303133;
  font-size: 16px;
}

@media screen and (max-width: 768px) {
  .activity-planning {
    padding: 10px;
  }
  
  .search-form {
    flex-direction: column;
  }
  
  .search-form .el-form-item {
    margin-right: 0;
  }
}
</style>