<template>
  <div class="negotiation-records">
    <!-- 搜索过滤区域 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="客户名称">
          <el-input v-model="searchForm.customerName" placeholder="请输入客户名称" clearable />
        </el-form-item>
        <el-form-item label="洽谈状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
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

    <!-- 洽谈记录列表 -->
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <h2>洽谈记录</h2>
          <el-button type="primary" @click="showDialog('add')">新增记录</el-button>
        </div>
      </template>

      <el-table :data="recordsList" v-loading="loading" style="width: 100%">
        <el-table-column prop="date" label="洽谈日期" width="180" sortable />
        <el-table-column prop="customerName" label="客户名称" width="150" />
        <el-table-column prop="type" label="洽谈方式" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="topic" label="洽谈主题" show-overflow-tooltip />
        <el-table-column prop="status" label="洽谈状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="nextStep" label="下一步计划" show-overflow-tooltip />
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
      :title="dialogType === 'add' ? '新增洽谈记录' : '编辑洽谈记录'"
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

        <el-form-item label="洽谈日期" prop="date">
          <el-date-picker
            v-model="form.date"
            type="datetime"
            placeholder="请选择日期时间"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="洽谈方式" prop="type">
          <el-select v-model="form.type" placeholder="请选择" style="width: 100%">
            <el-option
              v-for="type in typeOptions"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="洽谈主题" prop="topic">
          <el-input v-model="form.topic" placeholder="请输入洽谈主题" />
        </el-form-item>

        <el-form-item label="洽谈内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="4"
            placeholder="请输入洽谈内容详情"
          />
        </el-form-item>

        <el-form-item label="洽谈状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择" style="width: 100%">
            <el-option
              v-for="status in statusOptions"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="下一步计划" prop="nextStep">
          <el-input
            v-model="form.nextStep"
            type="textarea"
            :rows="3"
            placeholder="请输入下一步工作计划"
          />
        </el-form-item>

        <el-form-item label="附件">
          <el-upload
            class="upload-demo"
            action="/api/upload"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :before-remove="beforeRemove"
            multiple
            :limit="3">
            <el-button type="primary">点击上传</el-button>
            <template #tip>
              <div class="el-upload__tip">
                可上传会议纪要、合作意向书等文件，单个文件不超过10MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
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
      title="洽谈记录详情"
      width="50%">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="客户名称">
          {{ currentDetail.customerName }}
        </el-descriptions-item>
        <el-descriptions-item label="洽谈日期">
          {{ currentDetail.date }}
        </el-descriptions-item>
        <el-descriptions-item label="洽谈方式">
          <el-tag :type="getTypeTagType(currentDetail.type)">
            {{ currentDetail.type }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="洽谈主题">
          {{ currentDetail.topic }}
        </el-descriptions-item>
        <el-descriptions-item label="洽谈内容">
          {{ currentDetail.content }}
        </el-descriptions-item>
        <el-descriptions-item label="洽谈状态">
          <el-tag :type="getStatusTagType(currentDetail.status)">
            {{ currentDetail.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="下一步计划">
          {{ currentDetail.nextStep }}
        </el-descriptions-item>
      </el-descriptions>

      <div v-if="currentDetail.attachments?.length" class="attachments-list">
        <h4>附件列表</h4>
        <el-table :data="currentDetail.attachments" border>
          <el-table-column prop="name" label="文件名" />
          <el-table-column prop="size" label="大小" width="120" />
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button link type="primary" @click="downloadFile(row)">
                下载
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 常量定义
const typeOptions = [
  { label: '线下会议', value: 'offline' },
  { label: '视频会议', value: 'video' },
  { label: '电话', value: 'phone' },
  { label: '邮件', value: 'email' }
]

const statusOptions = [
  { label: '初步接触', value: 'initial' },
  { label: '深入洽谈', value: 'negotiating' },
  { label: '达成意向', value: 'intended' },
  { label: '签约完成', value: 'signed' },
  { label: '暂停搁置', value: 'suspended' }
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
  status: '',
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
  topic: '',
  content: '',
  status: '',
  nextStep: '',
  attachments: []
})

// 列表数据
const recordsList = ref([])

// 表单验证规则
const rules = {
  customerName: [{ required: true, message: '请选择客户', trigger: 'change' }],
  date: [{ required: true, message: '请选择洽谈日期', trigger: 'change' }],
  type: [{ required: true, message: '请选择洽谈方式', trigger: 'change' }],
  topic: [{ required: true, message: '请输入洽谈主题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入洽谈内容', trigger: 'blur' }],
  status: [{ required: true, message: '请选择洽谈状态', trigger: 'change' }]
}

// 获取洽谈方式对应的标签类型
const getTypeTagType = (type) => {
  const typeMap = {
    offline: '',
    video: 'success',
    phone: 'warning',
    email: 'info'
  }
  return typeMap[type] || ''
}

// 获取状态对应的标签类型
const getStatusTagType = (status) => {
  const statusMap = {
    initial: 'info',
    negotiating: 'warning',
    intended: 'success',
    signed: 'success',
    suspended: 'danger'
  }
  return statusMap[status] || ''
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
      form[key] = ''
    })
    form.attachments = []
  }
}

const showDetailDialog = (row) => {
  currentDetail.value = { ...row }
  detailDialogVisible.value = true
}

// 文件处理方法
const handlePreview = (file) => {
  console.log(file)
}

const handleRemove = (file, fileList) => {
  console.log(file, fileList)
}

const beforeRemove = (file) => {
  return ElMessageBox.confirm(`确定移除 ${file.name}？`)
}

const downloadFile = (file) => {
  ElMessage.success(`开始下载文件：${file.name}`)
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
    '确定要删除该洽谈记录吗？',
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
    recordsList.value = [
      {
        id: 1,
        customerName: '示例客户1',
        date: '2024-01-15 14:30:00',
        type: 'offline',
        topic: '项目合作洽谈',
        content: '讨论了项目具体实施方案和合作模式',
        status: 'negotiating',
        nextStep: '准备合作协议初稿',
        attachments: [
          { name: '会议纪要.docx', size: '156KB' }
        ]
      },
      {
        id: 2,
        customerName: '示例客户2',
        date: '2024-01-14 09:00:00',
        type: 'video',
        topic: '商务合作意向讨论',
        content: '介绍了公司业务范围和优势',
        status: 'initial',
        nextStep: '安排实地考察',
        attachments: []
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
.negotiation-records {
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

.attachments-list {
  margin-top: 20px;
}

.attachments-list h4 {
  margin-bottom: 10px;
  color: #303133;
}

@media screen and (max-width: 768px) {
  .negotiation-records {
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