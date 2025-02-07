<template>
  <div class="income-withdraw">
    <!-- 账户概览 -->
    <el-card class="account-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="account-item">
            <div class="label">可提现金额</div>
            <div class="value">¥{{ account.availableAmount }}</div>
            <el-button type="primary" @click="showWithdrawDialog">申请提现</el-button>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="account-item">
            <div class="label">提现中金额</div>
            <div class="value">¥{{ account.withdrawingAmount }}</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="account-item">
            <div class="label">累计提现金额</div>
            <div class="value">¥{{ account.totalWithdrawn }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 提现记录 -->
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <h2>提现记录</h2>
        </div>
      </template>

      <el-table :data="withdrawList" v-loading="loading" style="width: 100%">
        <el-table-column prop="withdrawNo" label="提现单号" width="180" />
        <el-table-column prop="amount" label="提现金额" width="150">
          <template #default="{ row }">
            ¥{{ row.amount }}
          </template>
        </el-table-column>
        <el-table-column prop="bankInfo" label="收款账户" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applyTime" label="申请时间" width="180" sortable />
        <el-table-column prop="completeTime" label="完成时间" width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-if="row.status === 'processing'"
              link 
              type="danger" 
              @click="cancelWithdraw(row)">
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

    <!-- 提现申请对话框 -->
    <el-dialog
      v-model="withdrawDialogVisible"
      title="申请提现"
      width="500px">
      <el-form
        ref="withdrawFormRef"
        :model="withdrawForm"
        :rules="withdrawRules"
        label-width="100px">
        <el-form-item label="提现金额" prop="amount">
          <el-input-number
            v-model="withdrawForm.amount"
            :min="100"
            :max="account.availableAmount"
            :precision="2"
            style="width: 100%"
          />
          <div class="form-tip">
            最小提现金额：¥100.00，单次最大提现金额：¥50,000.00
          </div>
        </el-form-item>

        <el-form-item label="收款账户" prop="bankId">
          <el-select v-model="withdrawForm.bankId" style="width: 100%">
            <el-option
              v-for="bank in bankList"
              :key="bank.id"
              :label="bank.name"
              :value="bank.id">
              <div class="bank-option">
                <span>{{ bank.name }}</span>
                <span class="bank-number">{{ bank.number }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="支付密码" prop="password">
          <el-input
            v-model="withdrawForm.password"
            type="password"
            show-password
            placeholder="请输入支付密码"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="withdrawDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitWithdraw" :loading="submitting">
            确认提现
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="提现详情"
      width="500px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="提现单号">
          {{ currentDetail.withdrawNo }}
        </el-descriptions-item>
        <el-descriptions-item label="提现金额">
          ¥{{ currentDetail.amount }}
        </el-descriptions-item>
        <el-descriptions-item label="收款账户">
          {{ currentDetail.bankInfo }}
        </el-descriptions-item>
        <el-descriptions-item label="申请时间">
          {{ currentDetail.applyTime }}
        </el-descriptions-item>
        <el-descriptions-item label="完成时间">
          {{ currentDetail.completeTime || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentDetail.status)">
            {{ getStatusText(currentDetail.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="备注" v-if="currentDetail.remark">
          {{ currentDetail.remark }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 状态管理
const loading = ref(false)
const submitting = ref(false)
const withdrawDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const withdrawFormRef = ref(null)
const currentDetail = ref({})

// 账户信息
const account = reactive({
  availableAmount: 8280.00,
  withdrawingAmount: 5000.00,
  totalWithdrawn: 28630.00
})

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 提现表单
const withdrawForm = reactive({
  amount: 100,
  bankId: '',
  password: ''
})

// 提现表单验证规则
const withdrawRules = {
  amount: [
    { required: true, message: '请输入提现金额', trigger: 'blur' },
    { type: 'number', min: 100, message: '最小提现金额为100元', trigger: 'blur' },
    { type: 'number', max: 50000, message: '单次最大提现金额为50000元', trigger: 'blur' }
  ],
  bankId: [
    { required: true, message: '请选择收款账户', trigger: 'change' }
  ],
  password: [
    { required: true, message: '请输入支付密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在6-20位之间', trigger: 'blur' }
  ]
}

// 银行账户列表
const bankList = [
  { id: 1, name: '工商银行', number: '**** **** **** 1234' },
  { id: 2, name: '建设银行', number: '**** **** **** 5678' }
]

// 提现记录列表
const withdrawList = ref([])

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    processing: 'warning',
    success: 'success',
    failed: 'danger',
    cancelled: 'info'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    processing: '处理中',
    success: '提现成功',
    failed: '提现失败',
    cancelled: '已取消'
  }
  return statusMap[status] || status
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

// 显示提现对话框
const showWithdrawDialog = () => {
  withdrawForm.amount = 100
  withdrawForm.bankId = ''
  withdrawForm.password = ''
  withdrawDialogVisible.value = true
}

// 提交提现申请
const submitWithdraw = async () => {
  if (!withdrawFormRef.value) return
  
  try {
    await withdrawFormRef.value.validate()
    submitting.value = true
    
    // TODO: 实现实际的提现逻辑
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('提现申请提交成功')
    withdrawDialogVisible.value = false
    loadData()
  } catch (error) {
    ElMessage.error('表单验证失败，请检查填写内容')
  } finally {
    submitting.value = false
  }
}

// 取消提现
const cancelWithdraw = (row) => {
  ElMessageBox.confirm(
    '确定要取消该笔提现吗？',
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
      ElMessage.success('提现已取消')
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
  currentDetail.value = row
  detailDialogVisible.value = true
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // TODO: 实现实际的数据加载逻辑
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟数据
    withdrawList.value = [
      {
        withdrawNo: 'W202401150001',
        amount: 5000.00,
        bankInfo: '工商银行 **** **** **** 1234',
        status: 'processing',
        applyTime: '2024-01-15 14:30:00',
        completeTime: '-'
      },
      {
        withdrawNo: 'W202401140001',
        amount: 3000.00,
        bankInfo: '建设银行 **** **** **** 5678',
        status: 'success',
        applyTime: '2024-01-14 10:00:00',
        completeTime: '2024-01-14 11:00:00'
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
.income-withdraw {
  padding: 20px;
}

.account-card {
  margin-bottom: 20px;
}

.account-item {
  text-align: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.account-item .label {
  color: #606266;
  margin-bottom: 8px;
}

.account-item .value {
  font-size: 24px;
  color: #303133;
  font-weight: bold;
  margin-bottom: 16px;
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

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.bank-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bank-number {
  color: #909399;
  font-size: 12px;
}

@media screen and (max-width: 768px) {
  .income-withdraw {
    padding: 10px;
  }
  
  .account-item {
    margin-bottom: 10px;
  }
}
</style>