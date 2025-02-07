<template>
  <div class="activity-evaluation">
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
        <el-form-item label="评估状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="待评估" value="pending" />
            <el-option label="评估中" value="processing" />
            <el-option label="已完成" value="completed" />
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

    <!-- 评估列表 -->
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <h2>活动评估列表</h2>
          <el-button type="primary" @click="showEvaluationDialog">新增评估</el-button>
        </div>
      </template>

      <el-table :data="evaluationList" v-loading="loading" style="width: 100%">
        <el-table-column prop="activityName" label="活动名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="type" label="活动类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.type === 'online' ? '线上活动' : '线下活动' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startDate" label="开始时间" width="180" sortable />
        <el-table-column prop="endDate" label="结束时间" width="180" sortable />
        <el-table-column prop="status" label="评估状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="roi" label="投资回报率" width="120">
          <template #default="{ row }">
            {{ row.roi }}%
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="showDetail(row)">详情</el-button>
            <el-button link type="primary" @click="editEvaluation(row)">编辑</el-button>
            <el-button link type="danger" @click="deleteEvaluation(row)">删除</el-button>
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

    <!-- 评估表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增评估' : '编辑评估'"
      width="60%"
      destroy-on-close>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px">
        <el-form-item label="活动名称" prop="activityName">
          <el-select
            v-model="form.activityName"
            filterable
            placeholder="请选择活动"
            style="width: 100%">
            <el-option
              v-for="activity in activityOptions"
              :key="activity.value"
              :label="activity.label"
              :value="activity.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="评估指标" prop="metrics">
          <el-checkbox-group v-model="form.metrics">
            <el-checkbox label="participation">参与度</el-checkbox>
            <el-checkbox label="conversion">转化率</el-checkbox>
            <el-checkbox label="satisfaction">满意度</el-checkbox>
            <el-checkbox label="roi">投资回报</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="参与人数" prop="participantCount">
          <el-input-number
            v-model="form.participantCount"
            :min="0"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="转化人数" prop="conversionCount">
          <el-input-number
            v-model="form.conversionCount"
            :min="0"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="活动成本" prop="cost">
          <el-input-number
            v-model="form.cost"
            :min="0"
            :precision="2"
            style="width: 100%">
            <template #append>元</template>
          </el-input-number>
        </el-form-item>

        <el-form-item label="活动收益" prop="revenue">
          <el-input-number
            v-model="form.revenue"
            :min="0"
            :precision="2"
            style="width: 100%">
            <template #append>元</template>
          </el-input-number>
        </el-form-item>

        <el-form-item label="满意度评分" prop="satisfaction">
          <el-rate v-model="form.satisfaction" :max="5" />
        </el-form-item>

        <el-form-item label="评估结论" prop="conclusion">
          <el-input
            v-model="form.conclusion"
            type="textarea"
            :rows="4"
            placeholder="请输入评估结论"
          />
        </el-form-item>

        <el-form-item label="改进建议" prop="suggestions">
          <el-input
            v-model="form.suggestions"
            type="textarea"
            :rows="4"
            placeholder="请输入改进建议"
          />
        </el-form-item>
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
      title="评估详情"
      width="50%">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="活动名称">{{ currentDetail.activityName }}</el-descriptions-item>
        <el-descriptions-item label="活动类型">
          {{ currentDetail.type === 'online' ? '线上活动' : '线下活动' }}
        </el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ currentDetail.startDate }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ currentDetail.endDate }}</el-descriptions-item>
        <el-descriptions-item label="参与人数">{{ currentDetail.participantCount }}</el-descriptions-item>
        <el-descriptions-item label="转化人数">{{ currentDetail.conversionCount }}</el-descriptions-item>
        <el-descriptions-item label="活动成本">¥{{ currentDetail.cost }}</el-descriptions-item>
        <el-descriptions-item label="活动收益">¥{{ currentDetail.revenue }}</el-descriptions-item>
        <el-descriptions-item label="投资回报率">{{ currentDetail.roi }}%</el-descriptions-item>
        <el-descriptions-item label="满意度评分">
          <el-rate v-model="currentDetail.satisfaction" disabled />
        </el-descriptions-item>
      </el-descriptions>

      <div class="detail-section">
        <h4>评估结论</h4>
        <p>{{ currentDetail.conclusion }}</p>
      </div>

      <div class="detail-section">
        <h4>改进建议</h4>
        <p>{{ currentDetail.suggestions }}</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 状态管理
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const dialogType = ref('add')
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

// 评估表单
const form = reactive({
  activityName: '',
  metrics: [],
  participantCount: 0,
  conversionCount: 0,
  cost: 0,
  revenue: 0,
  satisfaction: 0,
  conclusion: '',
  suggestions: ''
})

// 活动选项
const activityOptions = [
  { label: '示例活动1', value: 'activity1' },
  { label: '示例活动2', value: 'activity2' }
]

// 评估列表数据
const evaluationList = ref([])

// 表单验证规则
const rules = {
  activityName: [
    { required: true, message: '请选择活动', trigger: 'change' }
  ],
  metrics: [
    { required: true, message: '请选择评估指标', trigger: 'change' }
  ],
  conclusion: [
    { required: true, message: '请输入评估结论', trigger: 'blur' }
  ]
}

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    pending: 'info',
    processing: 'warning',
    completed: 'success'
  }
  return statusMap[status] || ''
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    pending: '待评估',
    processing: '评估中',
    completed: '已完成'
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

// 显示评估对话框
const showEvaluationDialog = (type = 'add', row = null) => {
  dialogType.value = type
  dialogVisible.value = true
  
  if (type === 'edit' && row) {
    Object.assign(form, row)
  } else {
    Object.keys(form).forEach(key => {
      if (Array.isArray(form[key])) {
        form[key] = []
      } else if (typeof form[key] === 'number') {
        form[key] = 0
      } else {
        form[key] = ''
      }
    })
  }
}

// 编辑评估
const editEvaluation = (row) => {
  showEvaluationDialog('edit', row)
}

// 显示详情
const showDetail = (row) => {
  currentDetail.value = row
  detailDialogVisible.value = true
}

// 删除评估
const deleteEvaluation = (row) => {
  ElMessageBox.confirm(
    '确定要删除该评估记录吗？',
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
    evaluationList.value = [
      {
        activityName: '示例活动1',
        type: 'online',
        startDate: '2024-01-15',
        endDate: '2024-01-20',
        status: 'completed',
        participantCount: 1000,
        conversionCount: 100,
        cost: 50000,
        revenue: 150000,
        roi: 200,
        satisfaction: 4.5,
        conclusion: '活动效果良好，达到预期目标',
        suggestions: '建议进一步扩大活动规模'
      },
      {
        activityName: '示例活动2',
        type: 'offline',
        startDate: '2024-01-10',
        endDate: '2024-01-12',
        status: 'processing',
        participantCount: 500,
        conversionCount: 50,
        cost: 30000,
        revenue: 80000,
        roi: 167,
        satisfaction: 4.0,
        conclusion: '活动进行中，初步效果符合预期',
        suggestions: '需要加强现场互动环节'
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
.activity-evaluation {
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

.detail-section {
  margin-top: 20px;
}

.detail-section h4 {
  margin: 0 0 10px;
  color: #303133;
  font-size: 16px;
}

.detail-section p {
  margin: 0;
  color: #606266;
  line-height: 1.6;
}

@media screen and (max-width: 768px) {
  .activity-evaluation {
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