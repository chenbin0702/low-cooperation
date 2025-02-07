<template>
  <div class="inventory-replenishment">
    <!-- 补货申请表单 -->
    <el-card class="form-card">
      <template #header>
        <div class="card-header">
          <h2>补货申请</h2>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px">
        <el-form-item label="商品选择" prop="productId">
          <el-select
            v-model="form.productId"
            filterable
            placeholder="请选择商品"
            @change="handleProductSelect"
            style="width: 100%">
            <el-option
              v-for="product in productOptions"
              :key="product.code"
              :label="product.name"
              :value="product.code">
              <div class="product-option">
                <span>{{ product.name }}</span>
                <span class="stock-info">
                  当前库存: {{ product.quantity }}
                </span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="当前库存">
          <el-input v-model="currentStock" disabled>
            <template #append>件</template>
          </el-input>
        </el-form-item>

        <el-form-item label="最低库存">
          <el-input v-model="minStock" disabled>
            <template #append>件</template>
          </el-input>
        </el-form-item>

        <el-form-item label="申请数量" prop="quantity">
          <el-input-number
            v-model="form.quantity"
            :min="1"
            :precision="0"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="期望到货日期" prop="expectedDate">
          <el-date-picker
            v-model="form.expectedDate"
            type="date"
            placeholder="选择日期"
            :disabled-date="disabledDate"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="补货原因" prop="reason">
          <el-input
            v-model="form.reason"
            type="textarea"
            :rows="3"
            placeholder="请说明补货原因"
          />
        </el-form-item>

        <el-form-item label="备注说明" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注说明"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="submitting">
            提交申请
          </el-button>
          <el-button @click="resetForm" :disabled="submitting">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 申请记录 -->
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <h2>申请记录</h2>
        </div>
      </template>

      <el-table :data="recordList" v-loading="loading" style="width: 100%">
        <el-table-column prop="applyNo" label="申请编号" width="180" />
        <el-table-column prop="productName" label="商品名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="quantity" label="申请数量" width="120" />
        <el-table-column prop="expectedDate" label="期望到货日期" width="180" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applyTime" label="申请时间" width="180" sortable />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-if="row.status === 'pending'"
              link 
              type="danger" 
              @click="cancelApply(row)">
              取消
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute } from 'vue-router'

const route = useRoute()

// 状态管理
const loading = ref(false)
const submitting = ref(false)
const formRef = ref(null)

// 商品选项
const productOptions = [
  {
    code: 'P001',
    name: '无人机A型',
    quantity: 5,
    minQuantity: 10
  },
  {
    code: 'P002',
    name: '专业航拍镜头',
    quantity: 20,
    minQuantity: 15
  }
]

// 当前选中商品的库存信息
const currentStock = ref(0)
const minStock = ref(0)

// 表单数据
const form = reactive({
  productId: '',
  quantity: 1,
  expectedDate: '',
  reason: '',
  remark: ''
})

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 申请记录列表
const recordList = ref([])

// 表单验证规则
const rules = {
  productId: [
    { required: true, message: '请选择商品', trigger: 'change' }
  ],
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

// 禁用的日期
const disabledDate = (time) => {
  return time.getTime() < Date.now()
}

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    cancelled: 'info'
  }
  return statusMap[status] || ''
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已驳回',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

// 商品选择处理
const handleProductSelect = (productId) => {
  const product = productOptions.find(p => p.code === productId)
  if (product) {
    currentStock.value = product.quantity
    minStock.value = product.minQuantity
  }
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

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true
    
    // TODO: 实现实际的提交逻辑
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('补货申请提交成功')
    resetForm()
    loadData()
  } catch (error) {
    ElMessage.error('表单验证失败，请检查必填项')
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  currentStock.value = 0
  minStock.value = 0
}

// 取消申请
const cancelApply = (row) => {
  ElMessageBox.confirm(
    '确定要取消该补货申请吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    loading.value = true
    try {
      // TODO: 实现实际的取消逻辑
      await new Promise(resolve => setTimeout(resolve, 1000))
      ElMessage.success('申请已取消')
      loadData()
    } catch (error) {
      ElMessage.error('操作失败')
    } finally {
      loading.value = false
    }
  })
}

// 查看详情
const viewDetail = (row) => {
  ElMessage('查看详情：' + row.applyNo)
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // TODO: 实现实际的数据加载逻辑
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟数据
    recordList.value = [
      {
        applyNo: 'R202401150001',
        productName: '无人机A型',
        quantity: 10,
        expectedDate: '2024-01-20',
        status: 'pending',
        applyTime: '2024-01-15 14:30:00'
      },
      {
        applyNo: 'R202401140001',
        productName: '专业航拍镜头',
        quantity: 5,
        expectedDate: '2024-01-18',
        status: 'approved',
        applyTime: '2024-01-14 10:00:00'
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
  // 如果有传入商品ID，自动选择对应商品
  const productId = route.query.productId
  if (productId) {
    form.productId = productId
    handleProductSelect(productId)
  }
  
  loadData()
})
</script>

<style scoped>
.inventory-replenishment {
  padding: 20px;
}

.form-card {
  margin-bottom: 20px;
  max-width: 800px;
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

.product-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stock-info {
  color: #909399;
  font-size: 12px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

@media screen and (max-width: 768px) {
  .inventory-replenishment {
    padding: 10px;
  }
  
  .form-card {
    margin: 0 0 20px 0;
  }
}
</style>