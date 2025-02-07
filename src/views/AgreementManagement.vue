<template>
  <div class="agreement-management">
    <!-- 搜索过滤区域 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="协议名称">
          <el-input v-model="searchForm.name" placeholder="请输入协议名称" clearable />
        </el-form-item>
        <el-form-item label="协议状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
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

    <!-- 协议列表 -->
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <h2>协议管理</h2>
          <el-button type="primary" @click="showTemplateDialog">新建协议</el-button>
        </div>
      </template>

      <el-table :data="agreementList" v-loading="loading" style="width: 100%">
        <el-table-column prop="name" label="协议名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="templateName" label="模板来源" width="150" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" sortable />
        <el-table-column prop="updateTime" label="最后修改" width="180" sortable />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="editAgreement(row)">编辑</el-button>
            <el-button link type="primary" @click="viewReviewComments(row)" v-if="row.status === 'rejected'">
              查看意见
            </el-button>
            <el-button link type="success" @click="submitForReview(row)" v-if="['draft', 'rejected'].includes(row.status)">
              提交审核
            </el-button>
            <el-button link type="danger" @click="deleteAgreement(row)">删除</el-button>
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

    <!-- 选择模板对话框 -->
    <el-dialog
      v-model="templateDialogVisible"
      title="选择协议模板"
      width="50%">
      <el-table
        :data="templateList"
        highlight-current-row
        @current-change="handleTemplateSelect"
        style="width: 100%">
        <el-table-column prop="name" label="模板名称" />
        <el-table-column prop="description" label="说明" show-overflow-tooltip />
        <el-table-column prop="updateTime" label="更新时间" width="180" />
      </el-table>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="templateDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="createFromTemplate" :disabled="!selectedTemplate">
            确定使用
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 审核意见对话框 -->
    <el-dialog
      v-model="reviewDialogVisible"
      title="审核意见"
      width="40%">
      <div class="review-comments">
        <div v-for="comment in currentReviewComments" :key="comment.id" class="comment-item">
          <div class="comment-header">
            <span class="reviewer">{{ comment.reviewer }}</span>
            <span class="time">{{ comment.time }}</span>
          </div>
          <div class="comment-content">{{ comment.content }}</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()

// 常量定义
const statusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '审核中', value: 'reviewing' },
  { label: '已通过', value: 'approved' },
  { label: '已驳回', value: 'rejected' }
]

// 状态管理
const loading = ref(false)
const templateDialogVisible = ref(false)
const reviewDialogVisible = ref(false)
const selectedTemplate = ref(null)
const currentReviewComments = ref([])

// 搜索表单
const searchForm = reactive({
  name: '',
  status: '',
  dateRange: []
})

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 列表数据
const agreementList = ref([])
const templateList = ref([])

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    draft: 'info',
    reviewing: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    draft: '草稿',
    reviewing: '审核中',
    approved: '已通过',
    rejected: '已驳回'
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

// 模板选择
const showTemplateDialog = () => {
  templateDialogVisible.value = true
  loadTemplates()
}

const handleTemplateSelect = (template) => {
  selectedTemplate.value = template
}

const createFromTemplate = () => {
  if (!selectedTemplate.value) return
  
  templateDialogVisible.value = false
  // 跳转到协议编辑页面，带上模板ID
  router.push({
    name: 'AgreementDraft',
    query: { templateId: selectedTemplate.value.id }
  })
}

// 协议操作
const editAgreement = (agreement) => {
  router.push({
    name: 'AgreementDraft',
    query: { id: agreement.id }
  })
}

const submitForReview = async (agreement) => {
  try {
    loading.value = true
    // TODO: 实现实际的提交审核逻辑
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('提交审核成功')
    loadData()
  } catch (error) {
    ElMessage.error('提交审核失败')
  } finally {
    loading.value = false
  }
}

const viewReviewComments = (agreement) => {
  // 模拟获取审核意见
  currentReviewComments.value = [
    {
      id: 1,
      reviewer: '审核员A',
      time: '2024-01-15 14:30:00',
      content: '第三条款中关于收益分配的描述需要更加明确'
    },
    {
      id: 2,
      reviewer: '审核员B',
      time: '2024-01-15 15:00:00',
      content: '建议补充违约责任相关条款'
    }
  ]
  reviewDialogVisible.value = true
}

const deleteAgreement = (agreement) => {
  ElMessageBox.confirm(
    '确定要删除该协议吗？',
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
    agreementList.value = [
      {
        id: 1,
        name: '战略合作协议-A公司',
        templateName: '战略合作协议模板',
        status: 'draft',
        createTime: '2024-01-15 14:30:00',
        updateTime: '2024-01-15 14:30:00'
      },
      {
        id: 2,
        name: '业务合作协议-B公司',
        templateName: '业务合作协议模板',
        status: 'reviewing',
        createTime: '2024-01-14 09:00:00',
        updateTime: '2024-01-15 10:00:00'
      },
      {
        id: 3,
        name: '代理协议-C公司',
        templateName: '代理协议模板',
        status: 'rejected',
        createTime: '2024-01-13 16:00:00',
        updateTime: '2024-01-14 11:30:00'
      }
    ]
    pagination.total = 20
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 加载模板
const loadTemplates = async () => {
  try {
    // TODO: 实现实际的模板加载逻辑
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟数据
    templateList.value = [
      {
        id: 1,
        name: '战略合作协议模板',
        description: '适用于长期战略合作伙伴关系',
        updateTime: '2024-01-01 10:00:00'
      },
      {
        id: 2,
        name: '业务合作协议模板',
        description: '适用于具体业务合作项目',
        updateTime: '2024-01-01 10:00:00'
      },
      {
        id: 3,
        name: '代理协议模板',
        description: '适用于代理商合作关系',
        updateTime: '2024-01-01 10:00:00'
      }
    ]
  } catch (error) {
    ElMessage.error('加载模板失败')
  }
}

// 生命周期钩子
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.agreement-management {
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

.review-comments {
  max-height: 400px;
  overflow-y: auto;
}

.comment-item {
  padding: 12px;
  border-bottom: 1px solid #ebeef5;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.reviewer {
  font-weight: 500;
  color: #303133;
}

.time {
  color: #909399;
  font-size: 12px;
}

.comment-content {
  color: #606266;
  line-height: 1.5;
}

@media screen and (max-width: 768px) {
  .agreement-management {
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