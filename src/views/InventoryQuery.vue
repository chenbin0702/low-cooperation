<template>
  <div class="inventory-query">
    <!-- 搜索过滤区域 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="商品名称">
          <el-input v-model="searchForm.name" placeholder="请输入商品名称" clearable />
        </el-form-item>
        <el-form-item label="商品类型">
          <el-select v-model="searchForm.type" placeholder="请选择" clearable>
            <el-option label="无人机" value="drone" />
            <el-option label="配件" value="parts" />
            <el-option label="耗材" value="consumables" />
          </el-select>
        </el-form-item>
        <el-form-item label="库存状态">
          <el-select v-model="searchForm.stockStatus" placeholder="请选择" clearable>
            <el-option label="充足" value="sufficient" />
            <el-option label="正常" value="normal" />
            <el-option label="偏低" value="low" />
            <el-option label="不足" value="insufficient" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 库存列表 -->
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <h2>库存列表</h2>
          <div class="header-actions">
            <el-button type="primary" @click="exportInventory">导出库存</el-button>
          </div>
        </div>
      </template>

      <el-table :data="inventoryList" v-loading="loading" style="width: 100%">
        <el-table-column prop="code" label="商品编码" width="120" />
        <el-table-column prop="name" label="商品名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="type" label="商品类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="当前库存" width="120">
          <template #default="{ row }">
            <span :class="getStockClass(row)">{{ row.quantity }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="minQuantity" label="最低库存" width="120" />
        <el-table-column prop="maxQuantity" label="最高库存" width="120" />
        <el-table-column prop="location" label="库存位置" width="150" show-overflow-tooltip />
        <el-table-column prop="lastUpdate" label="最后更新" width="180" sortable />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-if="row.quantity < row.minQuantity"
              link 
              type="warning" 
              @click="applyReplenishment(row)">
              申请补货
            </el-button>
            <el-button
              link
              type="primary"
              @click="viewDetail(row)">
              详情
            </el-button>
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

    <!-- 补货申请对话框 -->
    <el-dialog
      v-model="replenishmentDialogVisible"
      title="补货申请"
      width="600px"
      destroy-on-close>
      <el-form
        ref="replenishmentFormRef"
        :model="replenishmentForm"
        :rules="replenishmentRules"
        label-width="100px">
        <el-form-item label="商品名称">
          <el-input v-model="selectedProduct.name" disabled />
        </el-form-item>

        <el-form-item label="当前库存">
          <el-input v-model="selectedProduct.quantity" disabled>
            <template #append>件</template>
          </el-input>
        </el-form-item>

        <el-form-item label="最低库存">
          <el-input v-model="selectedProduct.minQuantity" disabled>
            <template #append>件</template>
          </el-input>
        </el-form-item>

        <el-form-item label="申请数量" prop="quantity">
          <el-input-number
            v-model="replenishmentForm.quantity"
            :min="1"
            :precision="0"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="期望到货日期" prop="expectedDate">
          <el-date-picker
            v-model="replenishmentForm.expectedDate"
            type="date"
            placeholder="选择日期"
            :disabled-date="disabledDate"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="补货原因" prop="reason">
          <el-input
            v-model="replenishmentForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请说明补货原因"
          />
        </el-form-item>

        <el-form-item label="备注说明" prop="remark">
          <el-input
            v-model="replenishmentForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注说明"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="replenishmentDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitReplenishment" :loading="submitting">
            提交申请
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="库存详情"
      width="60%">
      <el-descriptions
        :column="2"
        border>
        <el-descriptions-item label="商品编码">{{ currentProduct?.code }}</el-descriptions-item>
        <el-descriptions-item label="商品名称">{{ currentProduct?.name }}</el-descriptions-item>
        <el-descriptions-item label="商品类型">
          <el-tag>{{ currentProduct?.type }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="当前库存">
          <span :class="getStockClass(currentProduct)">{{ currentProduct?.quantity }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="最低库存">{{ currentProduct?.minQuantity }}</el-descriptions-item>
        <el-descriptions-item label="最高库存">{{ currentProduct?.maxQuantity }}</el-descriptions-item>
        <el-descriptions-item label="库存位置">{{ currentProduct?.location }}</el-descriptions-item>
        <el-descriptions-item label="最后更新">{{ currentProduct?.lastUpdate }}</el-descriptions-item>
      </el-descriptions>
      <div class="detail-section">
        <div class="section-header">
          <h3>出入库记录</h3>
        </div>
        <el-table :data="stockHistory" style="width: 100%">
          <el-table-column label="类型" width="100">
            <template #default="{ row }">
              <el-tag :type="getOperationType(row.type)">
                {{ getOperationText(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="100">
            <template #default="{ row }">
              <span :class="{ 'text-red': row.type === 'out', 'text-green': row.type === 'in' }">
                {{ row.type === 'out' ? '-' : '+' }}{{ row.quantity }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="operator" label="操作人" width="120" />
          <el-table-column prop="time" label="操作时间" width="180" />
          <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()

// 状态管理
const loading = ref(false)
const replenishmentDialogVisible = ref(false)
const replenishmentFormRef = ref(null)
const submitting = ref(false)
const selectedProduct = ref({})
const detailDialogVisible = ref(false)
const currentProduct = ref(null)
const stockHistory = ref([])

// 搜索表单
const searchForm = reactive({
  name: '',
  type: '',
  stockStatus: ''
})

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 库存列表数据
const inventoryList = ref([])

// 补货申请表单
const replenishmentForm = reactive({
  quantity: 1,
  expectedDate: '',
  reason: '',
  remark: ''
})

// 补货申请表单验证规则
const replenishmentRules = {
  quantity: [
    { required: true, message: '请输入申请数量', trigger: 'blur' },
    { type: 'number', min: 1, message: '申请数量必须大于0', trigger: 'blur' }
  ],
  expectedDate: [
    { required: true, message: '请选择期望到货日期', trigger: 'change' }
  ],
  reason: [
    { required: true, message: '请输入补货原因', trigger: 'blur' }
  ]
}

// 获取库存状态样式
const getStockClass = (row) => {
  if (row.quantity <= row.minQuantity) {
    return 'stock-insufficient'
  } else if (row.quantity <= row.minQuantity * 1.2) {
    return 'stock-low'
  } else if (row.quantity >= row.maxQuantity * 0.8) {
    return 'stock-sufficient'
  }
  return 'stock-normal'
}

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

// 导出库存
const exportInventory = () => {
  ElMessage.success('库存数据导出成功')
}

// 禁用的日期
const disabledDate = (time) => {
  return time.getTime() < Date.now()
}

// 申请补货
const applyReplenishment = (row) => {
  selectedProduct.value = { ...row }
  replenishmentForm.quantity = Math.max(row.minQuantity - row.quantity, 1)
  replenishmentDialogVisible.value = true
}

// 提交补货申请
const submitReplenishment = async () => {
  if (!replenishmentFormRef.value) return
  
  try {
    await replenishmentFormRef.value.validate()
    submitting.value = true
    
    // TODO: 实现实际的提交逻辑
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('补货申请提交成功')
    replenishmentDialogVisible.value = false
    loadData() // 刷新列表数据
  } catch (error) {
    ElMessage.error('表单验证失败，请检查必填项')
  } finally {
    submitting.value = false
  }
}

// 查看详情
const viewDetail = async (row) => {
  currentProduct.value = row
  // 模拟加载库存历史数据
  stockHistory.value = [
    {
      type: 'in',
      quantity: 10,
      operator: '张三',
      time: '2024-01-15 10:00:00',
      remark: '采购入库'
    },
    {
      type: 'out',
      quantity: 5,
      operator: '李四',
      time: '2024-01-14 15:30:00',
      remark: '销售出库'
    },
    {
      type: 'check',
      quantity: 15,
      operator: '王五',
      time: '2024-01-13 09:00:00',
      remark: '库存盘点'
    }
  ]
  detailDialogVisible.value = true
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // TODO: 实现实际的数据加载逻辑
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟数据
    inventoryList.value = [
      {
        code: 'P001',
        name: '无人机A型',
        type: '无人机',
        quantity: 5,
        minQuantity: 10,
        maxQuantity: 50,
        location: 'A区-01-01',
        lastUpdate: '2024-01-15 14:30:00'
      },
      {
        code: 'P002',
        name: '专业航拍镜头',
        type: '配件',
        quantity: 20,
        minQuantity: 15,
        maxQuantity: 100,
        location: 'B区-02-03',
        lastUpdate: '2024-01-15 10:00:00'
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

// 计算库存百分比
const getStockPercentage = (product) => {
  if (!product) return 0
  const range = product.maxQuantity - product.minQuantity
  const current = product.quantity - product.minQuantity
  return Math.round((current / range) * 100)
}

// 获取库存状态
const getStockStatus = (product) => {
  if (!product) return ''
  if (product.quantity <= product.minQuantity) return 'exception'
  if (product.quantity >= product.maxQuantity) return 'success'
  return ''
}

// 格式化进度条文字
const format = (percentage) => {
  if (percentage < 0) return '库存不足'
  if (percentage > 100) return '库存充足'
  return `${percentage}%`
}

// 获取操作类型样式
const getOperationType = (type) => {
  const typeMap = {
    in: 'success',
    out: 'danger',
    check: 'info'
  }
  return typeMap[type] || 'info'
}

// 获取操作类型文本
const getOperationText = (type) => {
  const textMap = {
    in: '入库',
    out: '出库',
    check: '盘点'
  }
  return textMap[type] || type
}
</script>

<style scoped>
.inventory-query {
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

.stock-insufficient {
  color: #f56c6c;
  font-weight: bold;
}

.stock-low {
  color: #e6a23c;
  font-weight: bold;
}

.stock-normal {
  color: #409eff;
}

.stock-sufficient {
  color: #67c23a;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media screen and (max-width: 768px) {
  .inventory-query {
    padding: 10px;
  }
  
  .search-form {
    flex-direction: column;
  }
  
  .search-form .el-form-item {
    margin-right: 0;
  }
}

.detail-section {
  margin-top: 20px;
}

.section-header {
  margin-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.stock-status {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 4px;
}

.text-red {
  color: #f56c6c;
}

.text-green {
  color: #67c23a;
}

:deep(.el-progress-bar__inner) {
  transition: all 0.3s ease;
}

:deep(.el-descriptions) {
  margin-bottom: 20px;
}

:deep(.el-descriptions__cell) {
  padding: 12px 20px;
}
</style>