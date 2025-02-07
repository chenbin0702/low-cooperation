<template>
  <div class="industry-trends">
    <!-- 搜索过滤区域 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="请输入关键词" clearable />
        </el-form-item>
        <el-form-item label="行业领域">
          <el-select v-model="searchForm.field" placeholder="请选择" clearable>
            <el-option label="无人机制造" value="manufacture" />
            <el-option label="航空服务" value="service" />
            <el-option label="技术创新" value="innovation" />
          </el-select>
        </el-form-item>
        <el-form-item label="发布时间">
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

    <!-- 行业动态列表 -->
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <h2>行业动态</h2>
          <el-button type="primary" @click="showDialog('add')">新增动态</el-button>
        </div>
      </template>

      <el-table :data="trendsList" v-loading="loading" style="width: 100%">
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="field" label="行业领域" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.field }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="source" label="来源" width="150" show-overflow-tooltip />
        <el-table-column prop="publishTime" label="发布时间" width="180" sortable />
        <el-table-column prop="impact" label="影响程度" width="120">
          <template #default="{ row }">
            <el-rate v-model="row.impact" disabled :max="3" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="showDetail(row)">详情</el-button>
            <el-button link type="primary" @click="editTrend(row)">编辑</el-button>
            <el-button link type="danger" @click="deleteTrend(row)">删除</el-button>
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
      :title="dialogType === 'add' ? '新增动态' : '编辑动态'"
      width="60%"
      destroy-on-close>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" />
        </el-form-item>

        <el-form-item label="行业领域" prop="field">
          <el-select v-model="form.field" style="width: 100%">
            <el-option label="无人机制造" value="manufacture" />
            <el-option label="航空服务" value="service" />
            <el-option label="技术创新" value="innovation" />
          </el-select>
        </el-form-item>

        <el-form-item label="来源" prop="source">
          <el-input v-model="form.source" />
        </el-form-item>

        <el-form-item label="发布时间" prop="publishTime">
          <el-date-picker
            v-model="form.publishTime"
            type="datetime"
            placeholder="选择日期时间"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="影响程度" prop="impact">
          <el-rate
            v-model="form.impact"
            :max="3"
            :texts="['一般', '重要', '重大']"
            show-text
          />
        </el-form-item>

        <el-form-item label="内容摘要" prop="summary">
          <el-input
            v-model="form.summary"
            type="textarea"
            :rows="4"
            placeholder="请输入内容摘要"
          />
        </el-form-item>

        <el-form-item label="详细内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="6"
            placeholder="请输入详细内容"
          />
        </el-form-item>

        <el-form-item label="相关链接" prop="links">
          <el-input
            v-model="form.links"
            type="textarea"
            :rows="2"
            placeholder="请输入相关链接，多个链接请换行分隔"
          />
        </el-form-item>

        <el-form-item label="分析建议" prop="suggestions">
          <el-input
            v-model="form.suggestions"
            type="textarea"
            :rows="4"
            placeholder="请输入分析建议"
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
      title="动态详情"
      width="60%">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="标题">{{ currentDetail.title }}</el-descriptions-item>
        <el-descriptions-item label="行业领域">
          <el-tag>{{ currentDetail.field }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="来源">{{ currentDetail.source }}</el-descriptions-item>
        <el-descriptions-item label="发布时间">{{ currentDetail.publishTime }}</el-descriptions-item>
        <el-descriptions-item label="影响程度">
          <el-rate v-model="currentDetail.impact" disabled :max="3" />
        </el-descriptions-item>
      </el-descriptions>

      <div class="detail-section">
        <h4>内容摘要</h4>
        <p>{{ currentDetail.summary }}</p>
      </div>

      <div class="detail-section">
        <h4>详细内容</h4>
        <p>{{ currentDetail.content }}</p>
      </div>

      <div v-if="currentDetail.links" class="detail-section">
        <h4>相关链接</h4>
        <div class="links-list">
          <template v-for="(link, index) in currentDetail.links.split('\n')" :key="index">
            <a :href="link" target="_blank" rel="noopener noreferrer">{{ link }}</a>
          </template>
        </div>
      </div>

      <div class="detail-section">
        <h4>分析建议</h4>
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
  keyword: '',
  field: '',
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
  title: '',
  field: '',
  source: '',
  publishTime: '',
  impact: 1,
  summary: '',
  content: '',
  links: '',
  suggestions: ''
})

// 列表数据
const trendsList = ref([])

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' }
  ],
  field: [
    { required: true, message: '请选择行业领域', trigger: 'change' }
  ],
  source: [
    { required: true, message: '请输入来源', trigger: 'blur' }
  ],
  publishTime: [
    { required: true, message: '请选择发布时间', trigger: 'change' }
  ],
  summary: [
    { required: true, message: '请输入内容摘要', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入详细内容', trigger: 'blur' }
  ]
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

// 显示对话框
const showDialog = (type, row = null) => {
  dialogType.value = type
  dialogVisible.value = true
  
  if (type === 'edit' && row) {
    Object.assign(form, row)
  } else {
    Object.keys(form).forEach(key => {
      if (key === 'impact') {
        form[key] = 1
      } else {
        form[key] = ''
      }
    })
  }
}

// 编辑动态
const editTrend = (row) => {
  showDialog('edit', row)
}

// 显示详情
const showDetail = (row) => {
  currentDetail.value = row
  detailDialogVisible.value = true
}

// 删除动态
const deleteTrend = (row) => {
  ElMessageBox.confirm(
    '确定要删除该动态吗？',
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
    trendsList.value = [
      {
        title: '新型无人机技术突破',
        field: '技术创新',
        source: '航空科技报',
        publishTime: '2024-01-15 14:30:00',
        impact: 3,
        summary: '某公司在无人机续航能力方面取得重大突破',
        content: '详细介绍技术突破的具体内容...',
        links: 'https://example.com/news1\nhttps://example.com/news2',
        suggestions: '建议关注该技术发展，评估采用可能性'
      },
      {
        title: '行业政策更新',
        field: '航空服务',
        source: '民航局',
        publishTime: '2024-01-14 10:00:00',
        impact: 2,
        summary: '新的无人机管理政策出台',
        content: '政策详细内容...',
        links: 'https://example.com/policy',
        suggestions: '需要及时调整业务以符合新政策要求'
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
.industry-trends {
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

.links-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.links-list a {
  color: #409eff;
  text-decoration: none;
}

.links-list a:hover {
  text-decoration: underline;
}

@media screen and (max-width: 768px) {
  .industry-trends {
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