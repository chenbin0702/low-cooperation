<template>
  <div class="competitor-analysis">
    <!-- 搜索过滤区域 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="竞争对手">
          <el-input v-model="searchForm.name" placeholder="请输入竞争对手名称" clearable />
        </el-form-item>
        <el-form-item label="竞争领域">
          <el-select v-model="searchForm.field" placeholder="请选择" clearable>
            <el-option label="无人机制造" value="manufacture" />
            <el-option label="航空服务" value="service" />
            <el-option label="技术创新" value="innovation" />
          </el-select>
        </el-form-item>
        <el-form-item label="更新时间">
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

    <!-- 竞争对手列表 -->
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <h2>竞争对手分析</h2>
          <el-button type="primary" @click="showDialog('add')">新增分析</el-button>
        </div>
      </template>

      <el-table :data="competitorList" v-loading="loading" style="width: 100%">
        <el-table-column prop="name" label="竞争对手" min-width="180" show-overflow-tooltip />
        <el-table-column prop="field" label="竞争领域" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.field }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="scale" label="企业规模" width="120">
          <template #default="{ row }">
            <el-tag :type="getScaleType(row.scale)">{{ row.scale }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="marketShare" label="市场份额" width="120">
          <template #default="{ row }">
            {{ row.marketShare }}%
          </template>
        </el-table-column>
        <el-table-column prop="competitiveLevel" label="竞争程度" width="120">
          <template #default="{ row }">
            <el-rate v-model="row.competitiveLevel" disabled :max="3" />
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180" sortable />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="showDetail(row)">详情</el-button>
            <el-button link type="primary" @click="editCompetitor(row)">编辑</el-button>
            <el-button link type="danger" @click="deleteCompetitor(row)">删除</el-button>
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
      :title="dialogType === 'add' ? '新增分析' : '编辑分析'"
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
            <el-form-item label="企业名称" prop="name">
              <el-input v-model="form.name" />
            </el-form-item>

            <el-form-item label="竞争领域" prop="field">
              <el-select v-model="form.field" style="width: 100%">
                <el-option label="无人机制造" value="manufacture" />
                <el-option label="航空服务" value="service" />
                <el-option label="技术创新" value="innovation" />
              </el-select>
            </el-form-item>

            <el-form-item label="企业规模" prop="scale">
              <el-select v-model="form.scale" style="width: 100%">
                <el-option label="大型企业" value="large" />
                <el-option label="中型企业" value="medium" />
                <el-option label="小型企业" value="small" />
              </el-select>
            </el-form-item>

            <el-form-item label="市场份额" prop="marketShare">
              <el-input-number
                v-model="form.marketShare"
                :min="0"
                :max="100"
                :precision="2"
                style="width: 100%">
                <template #append>%</template>
              </el-input-number>
            </el-form-item>

            <el-form-item label="竞争程度" prop="competitiveLevel">
              <el-rate
                v-model="form.competitiveLevel"
                :max="3"
                :texts="['一般', '较强', '强']"
                show-text
              />
            </el-form-item>
          </el-tab-pane>

          <!-- 产品分析 -->
          <el-tab-pane label="产品分析" name="product">
            <el-form-item label="主要产品" prop="products">
              <el-input
                v-model="form.products"
                type="textarea"
                :rows="4"
                placeholder="请描述主要产品和服务"
              />
            </el-form-item>

            <el-form-item label="产品优势" prop="productAdvantages">
              <el-input
                v-model="form.productAdvantages"
                type="textarea"
                :rows="4"
                placeholder="请描述产品优势"
              />
            </el-form-item>

            <el-form-item label="产品劣势" prop="productDisadvantages">
              <el-input
                v-model="form.productDisadvantages"
                type="textarea"
                :rows="4"
                placeholder="请描述产品劣势"
              />
            </el-form-item>
          </el-tab-pane>

          <!-- 市场策略 -->
          <el-tab-pane label="市场策略" name="strategy">
            <el-form-item label="目标市场" prop="targetMarket">
              <el-input
                v-model="form.targetMarket"
                type="textarea"
                :rows="4"
                placeholder="请描述目标市场定位"
              />
            </el-form-item>

            <el-form-item label="营销策略" prop="marketingStrategy">
              <el-input
                v-model="form.marketingStrategy"
                type="textarea"
                :rows="4"
                placeholder="请描述主要营销策略"
              />
            </el-form-item>

            <el-form-item label="价格策略" prop="pricingStrategy">
              <el-input
                v-model="form.pricingStrategy"
                type="textarea"
                :rows="4"
                placeholder="请描述价格策略"
              />
            </el-form-item>
          </el-tab-pane>

          <!-- SWOT分析 -->
          <el-tab-pane label="SWOT分析" name="swot">
            <el-form-item label="优势(S)" prop="swot.strengths">
              <el-input
                v-model="form.swot.strengths"
                type="textarea"
                :rows="4"
                placeholder="请描述企业优势"
              />
            </el-form-item>

            <el-form-item label="劣势(W)" prop="swot.weaknesses">
              <el-input
                v-model="form.swot.weaknesses"
                type="textarea"
                :rows="4"
                placeholder="请描述企业劣势"
              />
            </el-form-item>

            <el-form-item label="机会(O)" prop="swot.opportunities">
              <el-input
                v-model="form.swot.opportunities"
                type="textarea"
                :rows="4"
                placeholder="请描述市场机会"
              />
            </el-form-item>

            <el-form-item label="威胁(T)" prop="swot.threats">
              <el-input
                v-model="form.swot.threats"
                type="textarea"
                :rows="4"
                placeholder="请描述面临威胁"
              />
            </el-form-item>
          </el-tab-pane>

          <!-- 应对策略 -->
          <el-tab-pane label="应对策略" name="response">
            <el-form-item label="应对建议" prop="suggestions">
              <el-input
                v-model="form.suggestions"
                type="textarea"
                :rows="6"
                placeholder="请输入应对策略建议"
              />
            </el-form-item>

            <el-form-item label="重点关注" prop="focusPoints">
              <el-input
                v-model="form.focusPoints"
                type="textarea"
                :rows="4"
                placeholder="请输入需要重点关注的方面"
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
      title="竞争对手详情"
      width="60%">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="企业名称">{{ currentDetail.name }}</el-descriptions-item>
        <el-descriptions-item label="竞争领域">
          <el-tag>{{ currentDetail.field }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="企业规模">
          <el-tag :type="getScaleType(currentDetail.scale)">{{ currentDetail.scale }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="市场份额">{{ currentDetail.marketShare }}%</el-descriptions-item>
        <el-descriptions-item label="竞争程度">
          <el-rate v-model="currentDetail.competitiveLevel" disabled :max="3" />
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ currentDetail.updateTime }}</el-descriptions-item>
      </el-descriptions>

      <div class="detail-section">
        <h4>产品分析</h4>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="主要产品">{{ currentDetail.products }}</el-descriptions-item>
          <el-descriptions-item label="产品优势">{{ currentDetail.productAdvantages }}</el-descriptions-item>
          <el-descriptions-item label="产品劣势">{{ currentDetail.productDisadvantages }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="detail-section">
        <h4>市场策略</h4>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="目标市场">{{ currentDetail.targetMarket }}</el-descriptions-item>
          <el-descriptions-item label="营销策略">{{ currentDetail.marketingStrategy }}</el-descriptions-item>
          <el-descriptions-item label="价格策略">{{ currentDetail.pricingStrategy }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="detail-section">
        <h4>SWOT分析</h4>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="优势(S)">{{ currentDetail.swot?.strengths }}</el-descriptions-item>
          <el-descriptions-item label="劣势(W)">{{ currentDetail.swot?.weaknesses }}</el-descriptions-item>
          <el-descriptions-item label="机会(O)">{{ currentDetail.swot?.opportunities }}</el-descriptions-item>
          <el-descriptions-item label="威胁(T)">{{ currentDetail.swot?.threats }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="detail-section">
        <h4>应对策略</h4>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="应对建议">{{ currentDetail.suggestions }}</el-descriptions-item>
          <el-descriptions-item label="重点关注">{{ currentDetail.focusPoints }}</el-descriptions-item>
        </el-descriptions>
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
const activeTab = ref('basic')
const formRef = ref(null)
const currentDetail = ref({})

// 搜索表单
const searchForm = reactive({
  name: '',
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
  name: '',
  field: '',
  scale: '',
  marketShare: 0,
  competitiveLevel: 1,
  products: '',
  productAdvantages: '',
  productDisadvantages: '',
  targetMarket: '',
  marketingStrategy: '',
  pricingStrategy: '',
  swot: {
    strengths: '',
    weaknesses: '',
    opportunities: '',
    threats: ''
  },
  suggestions: '',
  focusPoints: ''
})

// 竞争对手列表数据
const competitorList = ref([])

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入企业名称', trigger: 'blur' }
  ],
  field: [
    { required: true, message: '请选择竞争领域', trigger: 'change' }
  ],
  scale: [
    { required: true, message: '请选择企业规模', trigger: 'change' }
  ],
  marketShare: [
    { required: true, message: '请输入市场份额', trigger: 'blur' }
  ]
}

// 获取规模类型
const getScaleType = (scale) => {
  const scaleMap = {
    large: 'danger',
    medium: 'warning',
    small: 'info'
  }
  return scaleMap[scale] || ''
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
  activeTab.value = 'basic'
  
  if (type === 'edit' && row) {
    Object.assign(form, row)
  } else {
    Object.keys(form).forEach(key => {
      if (key === 'swot') {
        form[key] = {
          strengths: '',
          weaknesses: '',
          opportunities: '',
          threats: ''
        }
      } else if (typeof form[key] === 'number') {
        form[key] = key === 'competitiveLevel' ? 1 : 0
      } else {
        form[key] = ''
      }
    })
  }
}

// 编辑竞争对手
const editCompetitor = (row) => {
  showDialog('edit', row)
}

// 显示详情
const showDetail = (row) => {
  currentDetail.value = row
  detailDialogVisible.value = true
}

// 删除竞争对手
const deleteCompetitor = (row) => {
  ElMessageBox.confirm(
    '确定要删除该竞争对手分析吗？',
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
    competitorList.value = [
      {
        name: '竞争对手A',
        field: '无人机制造',
        scale: 'large',
        marketShare: 25.5,
        competitiveLevel: 3,
        updateTime: '2024-01-15 14:30:00',
        products: '工业无人机、消费级无人机',
        productAdvantages: '技术领先、品牌知名度高',
        productDisadvantages: '价格较高、售后服务有待改善',
        targetMarket: '高端工业市场、专业摄影市场',
        marketingStrategy: '注重品牌建设，强调技术创新',
        pricingStrategy: '高端定价策略',
        swot: {
          strengths: '技术实力强、资金充足',
          weaknesses: '成本控制能力较弱',
          opportunities: '市场需求持续增长',
          threats: '新进入者增多，竞争加剧'
        },
        suggestions: '加强成本控制，提升服务质量',
        focusPoints: '技术创新、市场拓展'
      },
      {
        name: '竞争对手B',
        field: '航空服务',
        scale: 'medium',
        marketShare: 15.8,
        competitiveLevel: 2,
        updateTime: '2024-01-14 10:00:00',
        products: '航拍服务、测绘服务',
        productAdvantages: '服务灵活、响应速度快',
        productDisadvantages: '规模较小、覆盖范围有限',
        targetMarket: '中小企业市场',
        marketingStrategy: '注重客户关系维护',
        pricingStrategy: '灵活定价策略',
        swot: {
          strengths: '服务质量好、客户关系稳定',
          weaknesses: '规模较小、资金实力有限',
          opportunities: '细分市场需求增长',
          threats: '大型企业进入威胁'
        },
        suggestions: '扩大服务范围，提升规模效应',
        focusPoints: '服务创新、市场细分'
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
.competitor-analysis {
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

@media screen and (max-width: 768px) {
  .competitor-analysis {
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