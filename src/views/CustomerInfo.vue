<template>
  <div class="customer-info">
    <!-- 搜索和过滤区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="客户名称">
          <el-input v-model="searchForm.name" placeholder="请输入客户名称" clearable />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="searchForm.phone" placeholder="请输入联系电话" clearable />
        </el-form-item>
        <el-form-item label="应用领域">
          <el-select v-model="searchForm.field" placeholder="请选择" clearable>
            <el-option label="航拍" value="aerial" />
            <el-option label="测绘" value="mapping" />
            <el-option label="植保" value="protection" />
          </el-select>
        </el-form-item>
        <el-form-item label="来源渠道">
          <el-select v-model="searchForm.source" placeholder="请选择" clearable>
            <el-option label="线上" value="online" />
            <el-option label="线下" value="offline" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 客户列表 -->
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <h2>客户信息列表</h2>
          <el-button type="primary" @click="showDialog('add')">新增客户</el-button>
        </div>
      </template>

      <el-table :data="customerList" v-loading="loading" style="width: 100%">
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="phone" label="联系电话" />
        <el-table-column prop="company" label="公司" />
        <el-table-column prop="position" label="职位" />
        <el-table-column prop="field" label="应用领域">
          <template #default="{ row }">
            <el-tag>{{ row.field }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="intentionLevel" label="意向级别">
          <template #default="{ row }">
            <el-rate v-model="row.intentionLevel" disabled :max="3" />
          </template>
        </el-table-column>
        <el-table-column label="标签">
          <template #default="{ row }">
            <el-tag
              v-for="tag in row.tags"
              :key="tag"
              class="mx-1"
              size="small">
              {{ tag }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button link type="primary" @click="showDialog('edit', row)">编辑</el-button>
            <el-button link type="primary" @click="showTagsDialog(row)">标签</el-button>
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
      :title="dialogType === 'add' ? '新增客户' : '编辑客户'"
      width="60%">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px">
        <el-tabs v-model="activeTab">
          <!-- 基础信息 -->
          <el-tab-pane label="基础信息" name="basic">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" />
            </el-form-item>
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" />
            </el-form-item>
            <el-form-item label="公司" prop="company">
              <el-input v-model="form.company" />
            </el-form-item>
            <el-form-item label="职位" prop="position">
              <el-input v-model="form.position" />
            </el-form-item>
          </el-tab-pane>

          <!-- 需求信息 -->
          <el-tab-pane label="需求信息" name="requirement">
            <el-form-item label="应用领域" prop="field">
              <el-select v-model="form.field" style="width: 100%">
                <el-option label="航拍" value="aerial" />
                <el-option label="测绘" value="mapping" />
                <el-option label="植保" value="protection" />
              </el-select>
            </el-form-item>
            <el-form-item label="预算范围" prop="budget">
              <el-select v-model="form.budget" style="width: 100%">
                <el-option label="10万以下" value="<100k" />
                <el-option label="10-50万" value="100k-500k" />
                <el-option label="50-100万" value="500k-1m" />
                <el-option label="100万以上" value=">1m" />
              </el-select>
            </el-form-item>
            <el-form-item label="意向级别" prop="intentionLevel">
              <el-rate v-model="form.intentionLevel" :max="3" />
            </el-form-item>
          </el-tab-pane>

          <!-- 来源信息 -->
          <el-tab-pane label="来源信息" name="source">
            <el-form-item label="来源类型" prop="sourceType">
              <el-radio-group v-model="form.sourceType">
                <el-radio label="online">线上</el-radio>
                <el-radio label="offline">线下</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="来源平台" prop="sourcePlatform">
              <el-input v-model="form.sourcePlatform" />
            </el-form-item>
          </el-tab-pane>

          <!-- 备注信息 -->
          <el-tab-pane label="备注信息" name="remark">
            <el-form-item label="备注" prop="remark">
              <el-input
                v-model="form.remark"
                type="textarea"
                :rows="4"
                placeholder="请输入备注信息" />
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 标签管理对话框 -->
    <el-dialog
      v-model="tagsDialogVisible"
      title="标签管理"
      width="30%">
      <div class="tags-container">
        <div class="current-tags">
          <h4>已有标签</h4>
          <el-tag
            v-for="tag in currentTags"
            :key="tag"
            closable
            @close="handleRemoveTag(tag)"
            class="mx-1">
            {{ tag }}
          </el-tag>
        </div>
        <div class="add-tag">
          <h4>添加标签</h4>
          <el-select
            v-model="selectedTag"
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入标签"
            @change="handleAddTag">
            <el-option
              v-for="tag in availableTags"
              :key="tag"
              :label="tag"
              :value="tag" />
          </el-select>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  name: '',
  phone: '',
  field: '',
  source: ''
})

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 表格数据
const customerList = ref([])
const loading = ref(false)

// 表单对话框
const dialogVisible = ref(false)
const dialogType = ref('add')
const activeTab = ref('basic')
const formRef = ref(null)

// 表单数据
const form = reactive({
  name: '',
  phone: '',
  company: '',
  position: '',
  field: '',
  budget: '',
  intentionLevel: 0,
  sourceType: 'online',
  sourcePlatform: '',
  remark: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  company: [
    { required: true, message: '请输入公司名称', trigger: 'blur' }
  ],
  field: [
    { required: true, message: '请选择应用领域', trigger: 'change' }
  ]
}

// 标签管理
const tagsDialogVisible = ref(false)
const currentTags = ref([])
const selectedTag = ref('')
const availableTags = ref(['重要客户', '待跟进', '已成交', '高意向', '低意向'])

// 搜索方法
const handleSearch = () => {
  loadData()
}

const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
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
  activeTab.value = 'basic'
  
  if (type === 'edit' && row) {
    Object.assign(form, row)
  } else {
    Object.keys(form).forEach(key => {
      form[key] = ''
    })
    form.intentionLevel = 0
    form.sourceType = 'online'
  }
}

// 标签管理方法
const showTagsDialog = (row) => {
  currentTags.value = [...row.tags]
  tagsDialogVisible.value = true
}

const handleAddTag = (tag) => {
  if (tag && !currentTags.value.includes(tag)) {
    currentTags.value.push(tag)
  }
  selectedTag.value = ''
}

const handleRemoveTag = (tag) => {
  const index = currentTags.value.indexOf(tag)
  if (index > -1) {
    currentTags.value.splice(index, 1)
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    // TODO: 实现实际的保存逻辑
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
    dialogVisible.value = false
    loadData()
  } catch (error) {
    ElMessage.error('表单验证失败，请检查必填项')
  } finally {
    loading.value = false
  }
}

// 删除客户
const handleDelete = (row) => {
  ElMessageBox.confirm(
    '确定要删除该客户信息吗？',
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
    customerList.value = [
      {
        id: 1,
        name: '张三',
        phone: '13800138000',
        company: '某科技公司',
        position: '总经理',
        field: '航拍',
        intentionLevel: 3,
        tags: ['重要客户', '已成交']
      },
      {
        id: 2,
        name: '李四',
        phone: '13900139000',
        company: '某农业公司',
        position: '技术总监',
        field: '植保',
        intentionLevel: 2,
        tags: ['待跟进']
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
.customer-info {
  padding: 20px;
}

.search-card {
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

.tags-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.current-tags {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.current-tags .el-tag {
  margin: 5px;
}

.add-tag {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

@media screen and (max-width: 768px) {
  .customer-info {
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