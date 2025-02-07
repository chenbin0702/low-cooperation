<template>
  <div class="customer-follow-up">
    <!-- 搜索过滤区域 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="客户名称">
          <el-input v-model="searchForm.customerName" placeholder="请输入客户名称" clearable />
        </el-form-item>
        <el-form-item label="跟进方式">
          <el-select v-model="searchForm.type" placeholder="请选择" clearable>
            <el-option v-for="type in followUpTypes" :key="type.value" :label="type.label" :value="type.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
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

    <!-- 跟进记录列表 -->
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <h2>客户跟进记录</h2>
          <el-button type="primary" @click="showDialog('add')">新增跟进</el-button>
        </div>
      </template>

      <el-table :data="followUpList" v-loading="loading" style="width: 100%">
        <el-table-column prop="date" label="沟通时间" width="180" sortable />
        <el-table-column prop="customerName" label="客户名称" width="150" />
        <el-table-column prop="type" label="沟通方式" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="沟通内容" show-overflow-tooltip />
        <el-table-column prop="feedback" label="客户反馈" show-overflow-tooltip />
        <el-table-column prop="intention" label="意向程度" width="120">
          <template #default="{ row }">
            <el-rate v-model="row.intention" disabled :max="3" />
          </template>
        </el-table-column>
        <el-table-column prop="nextFollowUpDate" label="下次跟进" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="showDialog('edit', row)">编辑</el-button>
            <el-button link type="primary" @click="showDetailDialog(row)">详情</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增跟进记录' : '编辑跟进记录'"
      width="60%"
      destroy-on-close>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px">
        <el-form-item label="客户名称" prop="customerName">
          <el-select
            v-model="form.customerName"
            filterable
            placeholder="请选择客户"
            style="width: 100%">
            <el-option
              v-for="customer in customerOptions"
              :key="customer.value"
              :label="customer.label"
              :value="customer.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="沟通时间" prop="date">
          <el-date-picker
            v-model="form.date"
            type="datetime"
            placeholder="请选择日期时间"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="沟通方式" prop="type">
          <el-select v-model="form.type" placeholder="请选择" style="width: 100%">
            <el-option
              v-for="type in followUpTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="沟通内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="4"
            placeholder="请输入沟通内容详情"
          />
        </el-form-item>

        <el-form-item label="客户反馈" prop="feedback">
          <el-input
            v-model="form.feedback"
            type="textarea"
            :rows="4"
            placeholder="请输入客户反馈"
          />
        </el-form-item>

        <el-form-item label="意向程度" prop="intention">
          <el-rate v-model="form.intention" :max="3" />
        </el-form-item>

        <el-form-item label="下次跟进" prop="nextFollowUpDate">
          <el-date-picker
            v-model="form.nextFollowUpDate"
            type="datetime"
            placeholder="请选择下次跟进时间"
            style="width: 100%"
          />
        </el-form-item>

        <!-- 成交客户额外信息 -->
        <el-form-item label="是否成交">
          <el-switch v-model="form.isDeal" @change="handleDealChange" />
        </el-form-item>

        <template v-if="form.isDeal">
          <el-divider content-position="left">成交信息</el-divider>
          
          <el-form-item label="购买产品" prop="dealInfo.products">
            <el-select
              v-model="form.dealInfo.products"
              multiple
              filterable
              placeholder="请选择购买的产品/服务"
              style="width: 100%">
              <el-option
                v-for="product in productOptions"
                :key="product.value"
                :label="product.label"
                :value="product.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="使用反馈" prop="dealInfo.usageFeedback">
            <el-input
              v-model="form.dealInfo.usageFeedback"
              type="textarea"
              :rows="3"
              placeholder="请输入产品使用反馈"
            />
          </el-form-item>

          <el-form-item label="维修记录" prop="dealInfo.maintenanceRecords">
            <el-table :data="form.dealInfo.maintenanceRecords" border style="width: 100%">
              <el-table-column prop="date" label="维修日期" width="180">
                <template #default="{ row }">
                  <el-date-picker
                    v-model="row.date"
                    type="date"
                    placeholder="选择日期"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="issue" label="问题描述">
                <template #default="{ row }">
                  <el-input v-model="row.issue" placeholder="请输入问题描述" />
                </template>
              </el-table-column>
              <el-table-column prop="solution" label="解决方案">
                <template #default="{ row }">
                  <el-input v-model="row.solution" placeholder="请输入解决方案" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100">
                <template #default="{ $index }">
                  <el-button
                    link
                    type="danger"
                    @click="removeMaintenanceRecord($index)">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="mt-2">
              <el-button type="primary" link @click="addMaintenanceRecord">
                添加维修记录
              </el-button>
            </div>
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="跟进记录详情"
      width="50%">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="客户名称">
          {{ currentDetail.customerName }}
        </el-descriptions-item>
        <el-descriptions-item label="沟通时间">
          {{ currentDetail.date }}
        </el-descriptions-item>
        <el-descriptions-item label="沟通方式">
          <el-tag :type="getTypeTagType(currentDetail.type)">
            {{ currentDetail.type }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="沟通内容">
          {{ currentDetail.content }}
        </el-descriptions-item>
        <el-descriptions-item label="客户反馈">
          {{ currentDetail.feedback }}
        </el-descriptions-item>
        <el-descriptions-item label="意向程度">
          <el-rate v-model="currentDetail.intention" disabled :max="3" />
        </el-descriptions-item>
        <el-descriptions-item label="下次跟进时间">
          {{ currentDetail.nextFollowUpDate }}
        </el-descriptions-item>
      </el-descriptions>

      <template v-if="currentDetail.isDeal">
        <el-divider content-position="left">成交信息</el-divider>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="购买产品">
            {{ currentDetail.dealInfo?.products?.join(', ') }}
          </el-descriptions-item>
          <el-descriptions-item label="使用反馈">
            {{ currentDetail.dealInfo?.usageFeedback }}
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="currentDetail.dealInfo?.maintenanceRecords?.length" class="mt-4">
          <h4>维修记录</h4>
          <el-table :data="currentDetail.dealInfo.maintenanceRecords" border>
            <el-table-column prop="date" label="维修日期" width="180" />
            <el-table-column prop="issue" label="问题描述" />
            <el-table-column prop="solution" label="解决方案" />
          </el-table>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 常量定义
const followUpTypes = [
  { label: '电话', value: 'phone' },
  { label: '邮件', value: 'email' },
  { label: '面谈', value: 'face' },
  { label: '视频会议', value: 'video' }
]

const productOptions = [
  { label: '无人机A型', value: 'drone-a' },
  { label: '无人机B型', value: 'drone-b' },
  { label: '航拍服务', value: 'aerial-photo' },
  { label: '测绘服务', value: 'mapping' },
  { label: '植保服务', value: 'plant-protection' }
]

const customerOptions = [
  { label: '示例客户1', value: 'customer1' },
  { label: '示例客户2', value: 'customer2' }
]

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
  customerName: '',
  type: '',
  dateRange: []
})

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 表单数据
const form = reactive({
  customerName: '',
  date: '',
  type: '',
  content: '',
  feedback: '',
  intention: 0,
  nextFollowUpDate: '',
  isDeal: false,
  dealInfo: {
    products: [],
    usageFeedback: '',
    maintenanceRecords: []
  }
})

// 列表数据
const followUpList = ref([])

// 表单验证规则
const rules = {
  customerName: [{ required: true, message: '请选择客户', trigger: 'change' }],
  date: [{ required: true, message: '请选择沟通时间', trigger: 'change' }],
  type: [{ required: true, message: '请选择沟通方式', trigger: 'change' }],
  content: [{ required: true, message: '请输入沟通内容', trigger: 'blur' }],
  nextFollowUpDate: [{ required: true, message: '请选择下次跟进时间', trigger: 'change' }]
}

// 获取沟通方式对应的标签类型
const getTypeTagType = (type) => {
  const typeMap = {
    phone: '',
    email: 'success',
    face: 'warning',
    video: 'info'
  }
  return typeMap[type] || ''
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

// 对话框方法
const showDialog = (type, row = null) => {
  dialogType.value = type
  dialogVisible.value = true
  
  if (type === 'edit' && row) {
    Object.assign(form, row)
  } else {
    Object.keys(form).forEach(key => {
      if (key === 'dealInfo') {
        form[key] = {
          products: [],
          usageFeedback: '',
          maintenanceRecords: []
        }
      } else {
        form[key] = ''
      }
    })
    form.intention = 0
    form.isDeal = false
  }
}

const showDetailDialog = (row) => {
  currentDetail.value = { ...row }
  detailDialogVisible.value = true
}

// 成交状态变更
const handleDealChange = (val) => {
  if (!val) {
    form.dealInfo = {
      products: [],
      usageFeedback: '',
      maintenanceRecords: []
    }
  }
}

// 维修记录操作
const addMaintenanceRecord = () => {
  form.dealInfo.maintenanceRecords.push({
    date: '',
    issue: '',
    solution: ''
  })
}

const removeMaintenanceRecord = (index) => {
  form.dealInfo.maintenanceRecords.splice(index, 1)
}

// 提交表单
const handleSubmit = async () => {
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

// 删除记录
const handleDelete = (row) => {
  ElMessageBox.confirm(
    '确定要删除该跟进记录吗？',
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

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // TODO: 实现实际的数据加载逻辑
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟数据
    followUpList.value = [
      {
        id: 1,
        customerName: '示例客户1',
        date: '2024-01-15 14:30:00',
        type: 'phone',
        content: '讨论产品需求和预算情况',
        feedback: '对产品比较感兴趣，需要进一步了解技术细节',
        intention: 2,
        nextFollowUpDate: '2024-01-20 10:00:00',
        isDeal: false
      },
      {
        id: 2,
        customerName: '示例客户2',
        date: '2024-01-14 09:00:00',
        type: 'face',
        content: '现场演示产品功能',
        feedback: '对产品性能非常满意，准备采购',
        intention: 3,
        nextFollowUpDate: '2024-01-16 14:00:00',
        isDeal: true,
        dealInfo: {
          products: ['drone-a', 'aerial-photo'],
          usageFeedback: '产品使用良好，效果符合预期',
          maintenanceRecords: [
            {
              date: '2024-01-10',
              issue: '图传信号不稳定',
              solution: '更换了信号模块，恢复正常'
            }
          ]
        }
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
.customer-follow-up {
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

.mt-2 {
  margin-top: 8px;
}

.mt-4 {
  margin-top: 16px;
}

@media screen and (max-width: 768px) {
  .customer-follow-up {
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